import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';

// 子どもプロフィール（childrenテーブル）のCRUD（2026-10-16追加）。
// 「兄弟で不登校のパターンが多い」ため、1つの会員アカウントで複数の子どもを分けて
// 管理できるようにする機能。すべてログイン中の会員本人の分のみ操作できる。

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ children: [] });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('children')
    .select('id, name, grade, gender, created_at')
    .eq('member_id', member.id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ children: data || [] });
}

export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });

  const { name, grade, gender } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'お名前（ニックネーム）を入力してください' }, { status: 400 });
  }
  // 無制限に増やされてもUI・AI呼び出し上の意味がないため、実用上十分な上限を設ける。
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from('children')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', member.id);
  if ((count || 0) >= 3) {
    return NextResponse.json({ error: '登録できるお子さんの数の上限に達しました' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('children')
    .insert({
      member_id: member.id,
      name: name.trim().slice(0, 30),
      grade: grade || null,
      gender: gender || null,
    })
    .select('id, name, grade, gender, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, child: data });
}

export async function PATCH(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });

  const { id, name, grade, gender } = await req.json();
  if (!id || !name || !name.trim()) {
    return NextResponse.json({ error: 'お名前（ニックネーム）を入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  // 本人の子どもプロフィールであることを確認したうえで更新する（他人の分は更新できない）。
  const { data, error } = await supabase
    .from('children')
    .update({ name: name.trim().slice(0, 30), grade: grade || null, gender: gender || null })
    .eq('id', id)
    .eq('member_id', member.id)
    .select('id, name, grade, gender, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || '更新できませんでした' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, child: data });
}

export async function DELETE(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'invalid request' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  // 本人の子どもプロフィールであることを確認したうえで削除する。
  const { error } = await supabase.from('children').delete().eq('id', id).eq('member_id', member.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
