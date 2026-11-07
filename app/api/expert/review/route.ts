import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';

// 回答待ちキューの相談を「あとで見る」に退避／呼び戻しするAPI（2026-11-07追加）。
// expert_consultation_reviewsに行があれば「あとで見る」扱い。回答そのものとは
// 無関係で、expert_statusやanswerには一切触れない（単にその専門家・経験者の
// 表示上の仕分けを記録するだけ）。
export async function POST(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { consultation_id, action } = await req.json();
  if (!consultation_id || (action !== 'defer' && action !== 'undefer')) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (action === 'defer') {
    const { error } = await supabase
      .from('expert_consultation_reviews')
      .upsert({ consultation_id, expert_id: expert.id }, { onConflict: 'consultation_id,expert_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('expert_consultation_reviews')
      .delete()
      .eq('consultation_id', consultation_id)
      .eq('expert_id', expert.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
