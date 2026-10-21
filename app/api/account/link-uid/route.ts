import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';

// 匿名ブラウザID（dsk_uid / author_id）で投稿した相談を、ログイン中の会員（member_id）に
// 紐付けるエンドポイント。
//
// 相談投稿時にログインしていなかった場合、consultations.member_idがNULLのまま残る。
// 後からログインしても自動紐付けされないため、伴走ノートの「今のお子さんの状況」
// （/api/member-summary → lib/memberSummary.ts getOrGenerateMemberSummary）が
// member_idで引くと相談0件になり、「まだ相談がありません」と表示されてしまう。
//
// このエンドポイントをログイン・会員登録・伴走ノートページ閲覧時に呼ぶことで、
// 匿名投稿した相談をその会員のノートに取り込む（member_idを後付けで設定する）。
// 同じuidに対して複数回呼んでも、既にmember_idが設定済みの行はWHERE member_id IS NULLで
// スキップされるため冪等（2度目以降はlinked:0を返す）。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { uid } = body as { uid?: string };
  if (!uid || typeof uid !== 'string' || !uid.startsWith('u_')) {
    return NextResponse.json({ error: 'uidが不正です' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('consultations')
    .update({ member_id: member.id })
    .eq('author_id', uid)
    .is('member_id', null)
    .select('id');

  if (error) {
    console.error('[link-uid] update error:', error);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }

  return NextResponse.json({ linked: (data || []).length });
}
