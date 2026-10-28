import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';
import { FavoriteType } from '@/lib/favorites';

// 学校詳細ページの「お気に入り保存」を会員アカウント（favoritesテーブル）に
// 紐づけるAPI（2026-10-22追加）。未ログイン時はブラウザのlocalStorageだけで
// 運用するため（lib/favorites.ts）、このAPIはすべてログイン中の会員本人の分のみ
// 操作する。

const VALID_TYPES: FavoriteType[] = ['school', 'free', 'tsushin', 'online', 'teiji'];

function isValidType(value: unknown): value is FavoriteType {
  return typeof value === 'string' && (VALID_TYPES as string[]).includes(value);
}

// ログイン中なら会員のお気に入り一覧を返す。未ログインはエラーにせず、
// loggedIn:falseで空配列を返す（クライアント側はこのレスポンスだけで
// ログイン状態の判定と一覧の両方を済ませられる）。
export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ loggedIn: false, favorites: [] });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('favorites')
    .select('type, no, name, meta, created_at')
    .eq('member_id', member.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    loggedIn: true,
    favorites: (data || []).map((row) => ({
      type: row.type,
      no: row.no,
      name: row.name,
      meta: row.meta,
      savedAt: new Date(row.created_at).getTime(),
    })),
  });
}

// 1件の保存（{type,no,name,meta}）と、複数件まとめての引き継ぎ（{items:[...]}}、
// ログイン・会員登録の直後に、未ログイン時代にこの端末で保存していたお気に入りを
// まとめてサーバーに反映するために使う）の両方をこのエンドポイントで扱う。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });

  const body = await req.json();
  const rawItems: unknown[] = Array.isArray(body?.items) ? body.items : [body];

  const rows = rawItems
    .filter((item: unknown): item is { type: string; no: number; name: string; meta?: string } => {
      if (!item || typeof item !== 'object') return false;
      const i = item as Record<string, unknown>;
      return isValidType(i.type) && Number.isInteger(i.no) && typeof i.name === 'string' && i.name.trim().length > 0;
    })
    .map((item) => ({
      member_id: member.id,
      type: item.type,
      no: item.no,
      name: item.name.trim().slice(0, 100),
      meta: typeof item.meta === 'string' ? item.meta.slice(0, 100) : null,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  // 同じ学校を何度保存操作しても重複登録されないよう、unique(member_id,type,no)に
  // 対してupsertする（既存分はnameやmetaが最新の表示に更新される）。
  const { error } = await supabase.from('favorites').upsert(rows, { onConflict: 'member_id,type,no' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });

  const { type, no } = await req.json();
  if (!isValidType(type) || !Number.isInteger(no)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('favorites').delete().eq('member_id', member.id).eq('type', type).eq('no', no);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
