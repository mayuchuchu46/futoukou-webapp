import { NextRequest, NextResponse, after } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert, EXPERT_COOKIE_NAME } from '@/lib/expertAuth';
import { SENPAI_CREDENTIAL, expertPayout } from '@/lib/config';
import { sendEmail } from '@/lib/email';
import { expertDisplayName, answererName } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// 公開側の結果ページから、まだ登録していない専門家・経験者がその場で回答を書き、
// その場で簡易登録もできるようにするエンドポイント（2026-11-07追加）。
// 「これを読んだ経験者や専門家がコメント入れるみたいな、その流れで登録するみたいな」
// 「でも、登録するのハードルたかいよね、経験者はすぐできるといいんだけど」という
// 要望を受けて追加。書く行為自体は登録前でもできるが、本人確認（verified化）が
// 済むまでは内容を公開せず、expert_pending_answersに一時保存しておく
// （運営の確認を経ないまま、不特定多数が書いた回答が保護者の目に触れることを
// 避けるため）。運営が本人確認を承認した時点で公開される
// （app/api/admin/experts/verify/route.ts参照）。
//
// 呼び出し元（相談の投稿者本人ではなく、それを読んだ第三者）には所有権が無いため、
// /api/consultations/request-expertと違い author_id による所有権チェックは行わない。
export async function POST(req: NextRequest) {
  const body = await req.json();
  const consultation_id = String(body.consultation_id || '');
  const answer = String(body.answer || '').trim();
  if (!consultation_id || !answer) {
    return NextResponse.json({ error: '回答を入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from('consultations')
    .select('id, question, request_type, expert_status, hidden, crisis_detected, member_id, expert_funding, price_jpy')
    .eq('id', consultation_id)
    .single();

  if (!row || row.hidden) {
    return NextResponse.json({ error: '見つかりませんでした' }, { status: 404 });
  }
  // 希死念慮・自傷等の安全上書きが出た相談は、他の専門家・経験者向け導線と同じ理由で対象外。
  if (row.crisis_detected) {
    return NextResponse.json({ error: 'この相談には回答できません' }, { status: 400 });
  }
  if (row.request_type === 'expert' && row.expert_status === 'answered') {
    return NextResponse.json({ error: 'この相談には既に回答済みです' }, { status: 409 });
  }

  // 通常のAI相談（まだ専門家・経験者への送信フラグが立っていない）に書き込まれた
  // 場合は、ここで一緒にフラグを立てる。以前は相談者自身が「専門家・経験者にこの
  // 質問を見てもらう」ボタンを押した場合（request-expert route）にしかこの
  // フラグが立たず、その場合しか回答を保存できなかった。
  if (row.request_type !== 'expert') {
    const { error: flagErr } = await supabase
      .from('consultations')
      .update({
        request_type: 'expert',
        expert_status: 'pending',
        paid: true,
        price_jpy: 0,
        expert_funding: 'volunteer',
      })
      .eq('id', consultation_id);
    if (flagErr) {
      return NextResponse.json({ error: flagErr.message }, { status: 500 });
    }
  }

  const expert = await getCurrentExpert();

  // すでに本人確認済みの専門家・経験者としてログイン中 → そのまま公開する
  // （/api/expert/answerと同じ更新内容）。
  if (expert && expert.verified) {
    const payout = row.expert_funding === 'volunteer' ? 0 : expertPayout(row.price_jpy || 0);
    const { error } = await supabase
      .from('consultations')
      .update({
        expert_answer: answer,
        expert_status: 'answered',
        expert_id: expert.id,
        expert_payout_jpy: payout,
      })
      .eq('id', consultation_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (row.member_id) {
      after(async () => {
        const { data: member } = await supabase.from('members').select('email').eq('id', row.member_id).single();
        if (member?.email) {
          const role = answererName(expert.credential);
          const name = expertDisplayName(expert);
          await sendEmail({
            to: member.email,
            subject: `【${SITE_NAME}】あなたの相談に${role}から回答が届きました`,
            text: `${SITE_NAME}に投稿いただいた相談に、${name}さん（${role}）から回答が届きました。

相談内容：
${row.question.length > 60 ? `${row.question.slice(0, 60)}…` : row.question}

回答を読む（読み放題会員登録が必要です）：
${SITE_URL}/result/${row.id}

${SITE_NAME}
${SITE_URL}`,
          });
        }
      });
    }
    return NextResponse.json({ ok: true, published: true });
  }

  // ログイン中だが未確認（本人確認待ち） → キューに保存し、承認時に公開する。
  if (expert) {
    const { error } = await supabase
      .from('expert_pending_answers')
      .upsert({ expert_id: expert.id, consultation_id, answer }, { onConflict: 'expert_id,consultation_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, published: false, pendingAccount: true });
  }

  // 未ログイン → 簡易登録（先輩保護者・経験者としてのみ。資格・登録証の提出は
  // 不要）とセットで回答をキューに保存する。専門家（資格保有者）としての登録を
  // 希望する場合は、通常どおり/expert/registerで登録証の提出が必要なため、
  // ここでは扱わない（UI側で/expert/registerへの案内を別途出す）。
  const registration = (body.registration || {}) as {
    email?: string;
    password?: string;
    name?: string;
    display_name?: string;
    bio?: string;
  };
  const email = String(registration.email || '').trim();
  const password = String(registration.password || '');
  const name = String(registration.name || '').trim();
  const display_name = String(registration.display_name || '').trim();
  const bio = String(registration.bio || '').trim();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'メールアドレス・パスワード・お名前は必須です' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 });
  }

  const { data: existing } = await supabase.from('experts').select('id').eq('email', email).maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: 'このメールアドレスは既に登録されています。ログインしてからもう一度お試しください' },
      { status: 409 }
    );
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data: newExpert, error: createErr } = await supabase
    .from('experts')
    .insert({
      email,
      password_hash,
      name,
      display_name: display_name || null,
      credential: SENPAI_CREDENTIAL,
      bio,
      // 登録証の提出を求めないため、verification_methodは既存の「オンライン通話で
      // 確認」と同じ扱い（'call'）にする。実際には通話も必須ではなく、運営が
      // 登録内容を見て承認する運用（app/senpai/register/page.tsxと同じ）。
      verification_method: 'call',
      verified: false,
    })
    .select('id')
    .single();

  if (createErr || !newExpert) {
    return NextResponse.json({ error: createErr?.message || '登録に失敗しました' }, { status: 500 });
  }

  const { error: pendingErr } = await supabase
    .from('expert_pending_answers')
    .insert({ expert_id: newExpert.id, consultation_id, answer });
  if (pendingErr) {
    return NextResponse.json({ error: pendingErr.message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, published: false, pendingAccount: true, registered: true });
  res.cookies.set(EXPERT_COOKIE_NAME, newExpert.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
