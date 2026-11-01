import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 専門家・先輩保護者がオンライン相談リンク（online_consult_url）を未設定の場合に、
// 回答を読んだ利用者が「直接相談をリクエストする」を押すと呼ばれる（2026-11-01追加）。
// リンクが設定済みならクライアント側でそちらへ直接遷移させるため、ここは呼ばれない
// （app/result/[id]/ResultClient.tsx参照）。
// メール等の通知基盤はまだ無いため、consult_requestsテーブルに記録するだけにし、
// 専門家側のダッシュボード（app/account/ExpertSection.tsx）に件数を表示して気づいて
// もらう方式にしている。
export async function POST(req: NextRequest) {
  const { expert_id, consultation_id, author_id } = await req.json();
  if (!expert_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: expert } = await supabase.from('experts').select('id').eq('id', expert_id).eq('verified', true).single();
  if (!expert) {
    return NextResponse.json({ error: '専門家が見つかりません' }, { status: 404 });
  }

  // 同じ人が同じ専門家に何度もリクエストを重ねて件数を水増ししないよう、
  // 直近24時間以内の同一author_id・同一expert_idのリクエストがあれば新規作成しない
  // （既に送信済みとして扱う）。
  if (author_id) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('consult_requests')
      .select('id')
      .eq('expert_id', expert_id)
      .eq('author_id', author_id)
      .gte('created_at', since)
      .limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, alreadyRequested: true });
    }
  }

  const { error } = await supabase.from('consult_requests').insert({
    expert_id,
    consultation_id: consultation_id || null,
    author_id: author_id || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
