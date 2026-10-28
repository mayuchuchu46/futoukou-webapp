import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildFollowupPrompt } from '@/lib/prompt';
import { generateConsultAnswer } from '@/lib/aiAnswer';
import { findMentionedSchool, buildSchoolFactsBlock } from '@/lib/schoolFacts';
import { findMentionedInstitutions, buildInstitutionFactsBlock } from '@/lib/institutionFacts';
import {
  findMentionedCorrespondenceSchool,
  buildCorrespondenceSchoolFactsBlock,
  findMentionedFreeSchool,
  buildFreeSchoolFactsBlock,
  findMentionedOnlineFreeSchool,
  buildOnlineFreeSchoolFactsBlock,
} from '@/lib/facilityLinkMatch';
import { checkAiConsultRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentMember } from '@/lib/memberAuth';

// AIの回答に対して、その場で返信（ラリー）できる機能のAPI（2026-10-16追加）。
// /api/consult（新規相談）とほぼ同じ流れだが、新規に質問内容を一から書くのではなく、
// 既存の相談（parent）の質問・回答を会話の続きとしてAIに渡す点が異なる。
// できた行はparent_idを持つ「続き」として保存し、一覧・テーマ件数には出さない
// （lib/consultations.ts等、parent_id is null を条件にしている箇所を参照）。
export async function POST(req: NextRequest) {
  const { parent_id, text, author_id } = await req.json();

  if (!parent_id || !text || !text.trim() || !author_id) {
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

  // 返信先（parent）は、本人の相談であることを確認する（他人の相談には返信できない）。
  // author_idはクライアントのローカルuid。会員ログインでの投稿も、投稿時のauthor_idは
  // 常にセットされているため、これだけで本人確認として十分（他のAPIと同じ方式）。
  const { data: parent } = await supabase
    .from('consultations')
    .select('id, category, question, answer, grade, gender, author_id, member_id, request_type, child_id')
    .eq('id', parent_id)
    .single();

  if (!parent || parent.author_id !== author_id) {
    return NextResponse.json({ error: '元の相談が見つかりませんでした' }, { status: 404 });
  }
  if (parent.request_type !== 'ai' || !parent.answer) {
    return NextResponse.json({ error: 'この相談には返信できません' }, { status: 400 });
  }

  const { data: guidelines } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  const guideCat = guidelines?.categories?.[parent.category];

  // 返信（ラリー）では今回のメッセージ自体に学校名が出てこないこともあるため
  // （最初の相談で学校名を出し、返信では事実だけ聞くパターン）、最初の相談文も
  // あわせて学校名を検索する（lib/schoolFacts.ts参照、2026-10-18追加）。
  const mentionedSchool = findMentionedSchool([parent.question, text]);
  const schoolFactsBlock = mentionedSchool ? buildSchoolFactsBlock(mentionedSchool) : undefined;

  // 通信制高校についても同様（lib/facilityLinkMatch.ts参照、2026-10-28追加）。
  const mentionedCorrespondenceSchool = findMentionedCorrespondenceSchool([parent.question, text]);
  const correspondenceSchoolFactsBlock = mentionedCorrespondenceSchool
    ? buildCorrespondenceSchoolFactsBlock(mentionedCorrespondenceSchool)
    : undefined;

  // フリースクールについても同様（lib/facilityLinkMatch.ts参照、2026-10-28追加）。
  const mentionedFreeSchool = findMentionedFreeSchool([parent.question, text]);
  const freeSchoolFactsBlock = mentionedFreeSchool ? buildFreeSchoolFactsBlock(mentionedFreeSchool) : undefined;

  // オンラインフリースクールについても同様（lib/facilityLinkMatch.ts参照、2026-10-29追加）。
  const mentionedOnlineFreeSchool = findMentionedOnlineFreeSchool([parent.question, text]);
  const onlineFreeSchoolFactsBlock = mentionedOnlineFreeSchool
    ? buildOnlineFreeSchoolFactsBlock(mentionedOnlineFreeSchool)
    : undefined;

  // 返信（ラリー）では、今回の発言単体ではなく元の相談も含めた会話全体から
  // 制度・施設への言及を検出する（lib/institutionFacts.ts参照、2026-10-21追加。
  // 「学びの多様化学校が合うタイプと合わないタイプ」という親の相談への返信
  // 「フリースクールとどう違う？」のように、今回の発言だけでは何の制度の話か
  // 分からないケースがあるため）。
  const mentionedInstitutions = findMentionedInstitutions([parent.question, parent.answer, text]);
  const institutionFactsBlock = buildInstitutionFactsBlock(mentionedInstitutions);
  const factsBlock = [schoolFactsBlock, correspondenceSchoolFactsBlock, freeSchoolFactsBlock, onlineFreeSchoolFactsBlock, institutionFactsBlock]
    .filter(Boolean)
    .join('\n');

  const prompt = buildFollowupPrompt(
    parent.category,
    parent.question,
    parent.answer,
    text.trim(),
    guideCat,
    parent.grade,
    parent.gender,
    !!guidelines?.supervised,
    factsBlock || undefined
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer: string;
  try {
    // app/api/consult/route.tsと同じlib/aiAnswer.tsを使う（検索結果にトークン予算を
    // 奪われて回答本文が尻切れになる不具合への対策を含む、2026-10-24）。
    answer = await generateConsultAnswer(anthropic, prompt);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'AI回答の生成に失敗しました: ' + message }, { status: 502 });
  }

  // /api/consultと同じ判定（lib/prompt.tsの安全上書きが発動したかどうか）。
  const crisisDetected = answer.includes('0120-0-78310');

  // ログイン中の会員かどうかは、元の相談のmember_idではなく、今リクエストしている
  // ブラウザの会員状態をそのまま使う（別の端末から返信する場合もあり得るため）。
  const member = await getCurrentMember();

  const { data: row, error: insertErr } = await supabase
    .from('consultations')
    .insert({
      category: parent.category,
      question: text.trim(),
      answer,
      grade: parent.grade,
      gender: parent.gender,
      author_id,
      member_id: member?.id || parent.member_id || null,
      // 返信（ラリー）も元の相談と同じ子どものこととして扱う（2026-10-16追加）。
      child_id: parent.child_id || null,
      client_ip: ip,
      likes: 0,
      liked_by: [],
      views: 0,
      crisis_detected: crisisDetected,
      parent_id: parent.id,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, consultation: row });
}
