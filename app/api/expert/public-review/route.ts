import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert, EXPERT_COOKIE_NAME } from '@/lib/expertAuth';
import { SENPAI_CREDENTIAL } from '@/lib/config';

const ALLOWED_FACILITY_TYPES = ['school', 'alternative', 'free', 'teiji', 'tsushin', 'online'] as const;
type FacilityType = (typeof ALLOWED_FACILITY_TYPES)[number];

// 各学校・施設の詳細ページから、口コミを書き込む（＋まだ登録していない場合は
// その場で簡易登録する）エンドポイント（2026-11-07追加）。/api/expert/public-answer
// （公開側の結果ページでの回答）と同じ3分岐：
//   1. 本人確認済みでログイン中 → 即時公開（published: true）
//   2. ログイン中だが未確認 → 非公開で保存（published: false）、承認時に公開
//   3. 未ログイン → 簡易登録（先輩保護者・経験者としてのみ。資格・登録証は不要）
//      とセットで非公開保存
// 同じ人が同じ施設について複数回投稿した場合は、新規投稿ではなく上書き（編集）として扱う
// （school_reviewsのunique(expert_id, facility_type, facility_no)）。
export async function POST(req: NextRequest) {
  const body = await req.json();
  const facility_type = String(body.facility_type || '');
  const facility_no = String(body.facility_no || '');
  const facility_name = String(body.facility_name || '').trim();
  const reviewBody = String(body.body || '').trim();

  if (!ALLOWED_FACILITY_TYPES.includes(facility_type as FacilityType)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!facility_no || !facility_name || !reviewBody) {
    return NextResponse.json({ error: '口コミを入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const expert = await getCurrentExpert();

  if (expert) {
    const { error } = await supabase.from('school_reviews').upsert(
      {
        expert_id: expert.id,
        facility_type,
        facility_no,
        facility_name,
        body: reviewBody,
        published: !!expert.verified,
      },
      { onConflict: 'expert_id,facility_type,facility_no' }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, published: !!expert.verified });
  }

  // 未ログイン → 簡易登録（先輩保護者・経験者としてのみ。資格をお持ちの専門家としての
  // 登録は、通常どおり/expert/registerで登録証の提出が必要なため、ここでは扱わない）。
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
      verification_method: 'call',
      verified: false,
    })
    .select('id')
    .single();

  if (createErr || !newExpert) {
    return NextResponse.json({ error: createErr?.message || '登録に失敗しました' }, { status: 500 });
  }

  const { error: reviewErr } = await supabase.from('school_reviews').insert({
    expert_id: newExpert.id,
    facility_type,
    facility_no,
    facility_name,
    body: reviewBody,
    published: false,
  });
  if (reviewErr) {
    return NextResponse.json({ error: reviewErr.message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, published: false, registered: true });
  res.cookies.set(EXPERT_COOKIE_NAME, newExpert.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}

// アカウントページ（/account）から、自分が投稿済みの口コミを編集・削除できるように
// 追加（2026-11-07）。「口コミを書いたら名前が出ると知らなかった／ネガティブな内容を
// 書いてしまったので直したい」という声を受けて、学校ページの投稿フォームに再入力する
// （＝上書きされることに気づきにくい）以外の、本人にとって分かりやすい編集導線として
// アカウントページ側に一覧を出す。PUTは本文の編集、DELETEは投稿の削除。どちらも
// ログイン中の本人（expert_id一致）の口コミのみ操作できる。
export async function PUT(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const body = await req.json();
  const id = String(body.id || '');
  const reviewBody = String(body.body || '').trim();
  if (!id || !reviewBody) {
    return NextResponse.json({ error: '口コミを入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  // 公開済み・未公開のどちらでも編集できる。公開状態（published）はそのまま変えない
  // （本人確認済みの経験者ならpublished=trueのまま、未確認ならfalseのまま）。
  const { data, error } = await supabase
    .from('school_reviews')
    .update({ body: reviewBody })
    .eq('id', id)
    .eq('expert_id', expert.id)
    .select('id')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: '口コミが見つかりませんでした' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';
  if (!id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('school_reviews')
    .delete()
    .eq('id', id)
    .eq('expert_id', expert.id)
    .select('id')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: '口コミが見つかりませんでした' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
