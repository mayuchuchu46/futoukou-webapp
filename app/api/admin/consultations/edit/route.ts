import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

// 管理者が、公開中の相談本文（question）を修正するためのエンドポイント。
// 誤投稿・テスト投稿など、非表示にするのではなく文面そのものを直したいケース向け。
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const { id, question } = await req.json();
  if (!id || typeof question !== 'string' || !question.trim()) {
    return NextResponse.json({ error: '本文を入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('consultations').update({ question: question.trim() }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
