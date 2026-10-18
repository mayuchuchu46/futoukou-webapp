import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPrompt, buildOneLinerPrompt, PastConsultation } from '@/lib/prompt';
import { findMentionedSchool, buildSchoolFactsBlock } from '@/lib/schoolFacts';
import { checkAiConsultRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentMember } from '@/lib/memberAuth';

export async function POST(req: NextRequest) {
  const { category, text, author_id, grade, gender, child_id } = await req.json();

  if (!category || !text || !text.trim() || !author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const ip = getClientIp(req);
  const limit = await checkAiConsultRateLimit(author_id, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const supabase = getSupabaseAdmin();

  // ログイン中の会員であれば、過去の相談履歴（直近分）を取得してAIの回答に反映する。
  // このroute自体はクライアントからのfetch経由でのみ呼ばれる動的なRoute Handlerなので、
  // ここでCookieから会員情報を読んでも共有キャッシュに乗る心配はない（lib/consultations.tsのコメント参照）。
  const member = await getCurrentMember();
  let history: PastConsultation[] | undefined;
  if (member) {
    const { data: pastRows } = await supabase
      .from('consultations')
      .select('category, question, created_at')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (pastRows && pastRows.length) {
      history = pastRows as PastConsultation[];
    }
  }

  // 子どもプロフィール（2026-10-16追加）。「お子さんのプロフィール」で選んだ子がいれば、
  // その相談として記録する（後で伴走ノートが子ども単位で分かれる）。他人の子どもを
  // 指定できないよう、ログイン中の会員自身の子どもであることを必ず確認する。
  let childId: string | null = null;
  if (child_id && member) {
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('member_id', member.id)
      .single();
    if (child) childId = child.id;
  }

  const { data: guidelines } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  const guideCat = guidelines?.categories?.[category];

  // 相談文に、学びの多様化学校一覧に載っている学校名が含まれていれば、サイト側で
  // 確認済みの情報をAIに渡す（lib/schoolFacts.ts参照、2026-10-18追加）。
  const mentionedSchool = findMentionedSchool([text]);
  const schoolFactsBlock = mentionedSchool ? buildSchoolFactsBlock(mentionedSchool) : undefined;

  const prompt = buildPrompt(
    category,
    text.trim(),
    guideCat,
    grade || null,
    gender || null,
    !!guidelines?.supervised,
    history,
    undefined,
    schoolFactsBlock
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer: string;
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    // 応答の先頭ブロックが常にtextとは限らない（拡張思考ブロック等が
    // 先に来るケースがある）ため、content配列からtextブロックを探す。
    const textBlock = msg.content.find(
      (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text'
    );
    answer = textBlock ? textBlock.text.trim() : '';
    if (!answer) {
      throw new Error(
        `empty response (stop_reason=${msg.stop_reason}, blocks=${msg.content.map((b) => b.type).join(',')})`
      );
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'AI回答の生成に失敗しました: ' + message }, { status: 502 });
  }

  // lib/prompt.tsの安全上書き（希死念慮・自傷等を検知した場合、ホットライン案内のみを
  // 返す指示）が実際に発動したかどうかを、プロンプトが必ず含めさせている電話番号の文字列
  // で判定する。この判定結果を保存しておくことで、結果ページ側で「専門家・公的支援へつなげる
  // 流れをしっかり作る」ための専用UIを出せるようにする（2026-10-14、「隠すのではなく」との
  // 要望を受けて追加）。
  const crisisDetected = answer.includes('0120-0-78310');

  // 回答の一言要約（Xシェア用の格言カードに使う）。crisis_detectedな回答には
  // 生成しない（命に関わる場面でシェア導線を出さない方針、結果ページのisCrisis分岐と
  // 同じ考え方）。生成に失敗しても本回答の保存自体は妨げず、one_linerはnullのままにする
  // （2026-10-17追加）。
  let oneLiner: string | null = null;
  if (!crisisDetected) {
    try {
      const oneLinerMsg = await anthropic.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 100,
        messages: [{ role: 'user', content: buildOneLinerPrompt(text.trim(), answer) }],
      });
      const oneLinerBlock = oneLinerMsg.content.find(
        (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text'
      );
      const raw = oneLinerBlock ? oneLinerBlock.text.trim() : '';
      // 万一「」で囲って返ってきた場合に備えて剥がしておく。
      oneLiner = raw ? raw.replace(/^[「『]|[」』]$/g, '').trim() : null;
    } catch {
      oneLiner = null;
    }
  }

  const { data: row, error: insertErr } = await supabase
    .from('consultations')
    .insert({
      category,
      question: text.trim(),
      answer,
      grade: grade || null,
      gender: gender || null,
      author_id,
      member_id: member?.id || null,
      child_id: childId,
      client_ip: ip,
      likes: 0,
      liked_by: [],
      views: 0,
      crisis_detected: crisisDetected,
      one_liner: oneLiner,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, consultation: row });
}
