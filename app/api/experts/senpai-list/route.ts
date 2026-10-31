import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { SENPAI_CREDENTIAL } from '@/lib/config';

// /api/experts/list（専門家向け）と同じ形で、本人確認済みの先輩保護者
// （経験者）を3件まで返す公開読み取り専用エンドポイント。PCサイドバー
// （components/PcSidebar.tsx）がクライアント側から呼ぶ（2026-10-31追加、
// 「私の情報トップにだして」との依頼を受けて）。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url')
    .eq('verified', true)
    .eq('credential', SENPAI_CREDENTIAL)
    .order('created_at', { ascending: true })
    .limit(3);

  const senpai = (data || []).map((e) => ({
    id: e.id,
    name: expertDisplayName(e),
    credential: e.credential,
    bio: e.bio,
    photo_url: e.photo_url,
  }));

  return NextResponse.json({ senpai });
}
