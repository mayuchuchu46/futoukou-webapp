import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { SENPAI_CREDENTIAL } from '@/lib/config';

// PCサイドバーなど、トップ以外のページからも「専門家一覧」導線を出すための
// 公開読み取り専用エンドポイント。本人確認済みの専門家を3件まで返す
// （app/page.tsxのgetVerifiedExperts()と同じ条件）。
// 本名（name）は本人確認用のため公開APIでは返さず、表示名のみnameとして返す
// （2026-10-13、本名と表示名を分離）。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url')
    .eq('verified', true)
    // 先輩保護者（経験者）は別枠のため出さない（2026-10-31追加）。
    .neq('credential', SENPAI_CREDENTIAL)
    .order('created_at', { ascending: true })
    .limit(3);

  const experts = (data || []).map((e) => ({
    id: e.id,
    name: expertDisplayName(e),
    credential: e.credential,
    bio: e.bio,
    photo_url: e.photo_url,
  }));

  return NextResponse.json({ experts });
}
