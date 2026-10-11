import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';

// 投稿者本人による、自分の相談の削除（完全削除）。
// 「みんなの相談」は入力内容がそのまま・ログイン不要で公開される仕様のため、
// 誤って個人情報等を書いてしまった場合に自分で取り下げられる手段として用意する。
// 本人確認は、匿名投稿のauthor_id（ブラウザのlocalStorage由来のdsk_uid）と、
// ログイン中の会員であればmember_idのいずれかが一致すればOKとする。
export async function POST(req: NextRequest) {
  const { id, author_id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('id, author_id, member_id')
    .eq('id', id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: '見つかりませんでした' }, { status: 404 });
  }

  const member = await getCurrentMember();
  const isOwnerByAuthor = !!author_id && row.author_id === author_id;
  const isOwnerByMember = !!member && row.member_id === member.id;

  if (!isOwnerByAuthor && !isOwnerByMember) {
    return NextResponse.json({ error: 'この相談を削除する権限がありません' }, { status: 403 });
  }

  const { error: deleteErr } = await supabase.from('consultations').delete().eq('id', id);
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
