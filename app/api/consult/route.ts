import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPrompt, PastConsultation } from '@/lib/prompt';
import { generateConsultAnswer } from '@/lib/aiAnswer';
import { findMentionedSchool, buildSchoolFactsBlock } from '@/lib/schoolFacts';
import { findMentionedInstitutions, buildInstitutionFactsBlock } from '@/lib/institutionFacts';
import {
  findMentionedCorrespondenceSchool,
  buildCorrespondenceSchoolFactsBlock,
  findMentionedFreeSchool,
  buildFreeSchoolFactsBlock,
  findMentionedOnlineFreeSchool,
  buildAlternativeFactsBlockFor,
  buildOnlineFreeSchoolFactsBlock,
} from '@/lib/facilityLinkMatch';
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

  // 通信制高校一覧に載っている学校名についても同様に確認済み情報を渡す
  // （lib/facilityLinkMatch.ts参照、2026-10-28追加。それまではfindMentionedCorrespondenceSchool
  // の結果を内部リンク表示にしか使っておらず、noteに確認済み情報がある学校について相談しても
  // 「確認できる情報を持っていません」という回答になってしまっていた）。
  const mentionedCorrespondenceSchool = findMentionedCorrespondenceSchool([text]);
  const correspondenceSchoolFactsBlock = mentionedCorrespondenceSchool
    ? buildCorrespondenceSchoolFactsBlock(mentionedCorrespondenceSchool)
    : undefined;

  // フリースクール一覧に載っている施設名についても同様（2026-10-28追加。「レアレアの
  // 情報いれたのに回答がかわらない」との指摘を受けて、通信制高校と全く同じ抜けが
  // フリースクールにもあったことが判明したため）。
  const mentionedFreeSchool = findMentionedFreeSchool([text]);
  const freeSchoolFactsBlock = mentionedFreeSchool ? buildFreeSchoolFactsBlock(mentionedFreeSchool) : undefined;

  // オンラインフリースクール一覧に載っている施設名についても同様（2026-10-29追加。
  // ソウガク等のオンラインフリースクールについて相談しても「当サイトでは確認できる情報を
  // 持ち合わせていません」という回答になってしまっていたため）。
  const mentionedOnlineFreeSchool = findMentionedOnlineFreeSchool([text]);
  const onlineFreeSchoolFactsBlock = mentionedOnlineFreeSchool
    ? buildOnlineFreeSchoolFactsBlock(mentionedOnlineFreeSchool)
    : undefined;

  // 学校名が出てこない一般論の質問（例：「学びの多様化学校ってフリースクールと
  // 何が違うの？」）でも、制度・施設そのものについての確認済み情報を渡す
  // （lib/institutionFacts.ts参照、2026-10-21追加）。
  const mentionedInstitutions = findMentionedInstitutions([text]);
  const institutionFactsBlock = buildInstitutionFactsBlock(mentionedInstitutions);
  const factsBlock = [schoolFactsBlock, correspondenceSchoolFactsBlock, freeSchoolFactsBlock, onlineFreeSchoolFactsBlock, buildAlternativeFactsBlockFor([text]), institutionFactsBlock]
    .filter(Boolean)
    .join('\n');

  const prompt = buildPrompt(
    category,
    text.trim(),
    guideCat,
    grade || null,
    gender || null,
    !!guidelines?.supervised,
    history,
    undefined,
    factsBlock || undefined
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer: string;
  try {
    // 回答生成の共通処理はlib/aiAnswer.tsに集約している。2026-10-21に追加したweb_search
    // ツールはコスト対策で2026-10-28に撤去済み（検索結果が入力トークンとして課金され
    // コストが増加したため）。それに伴い発生していた「検索に予算を取られて回答本文が
    // 尻切れになる」不具合も解消済みで、以前あった検索なし再試行ロジックは不要になった。
    answer = await generateConsultAnswer(anthropic, prompt);
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

  // 回答の一言要約（Xシェア用の格言カードに使う）は、以前はここで相談のたびに毎回
  // 生成していたが、実際にシェアされるかどうかに関わらず全件でAPIを叩くことになり
  // コストの無駄だったため、2026-10-30、結果ページで「シェア画像を作る」ボタンが
  // 押された時だけ生成する方式（/api/consultations/[id]/one-liner）に変更した。
  // ここでは常にnullのまま保存する。

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
      one_liner: null,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, consultation: row });
}
