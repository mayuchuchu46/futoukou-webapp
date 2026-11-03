import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { CAREER_FIELD_OPTIONS, type CareerField } from '@/lib/careerFields';

// 経歴確認（2026-11-03追加）：フィールド名が許可された分野以外のものは無視する
// （app/api/expert/register/route.tsのparseCareerFieldsと同じ考え方）。
function sanitizeCareerFields(input: unknown): CareerField[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (item): item is CareerField =>
        item &&
        typeof item === 'object' &&
        typeof item.field === 'string' &&
        (CAREER_FIELD_OPTIONS as readonly string[]).includes(item.field) &&
        typeof item.years === 'string'
    )
    .map((item) => ({ field: item.field, years: item.years.trim() }));
}

export async function POST(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });

  // photo_urlはここでは扱わない（/api/expert/photo でのアップロード時にのみ更新する。
  // ここで一緒に受け取ってしまうと、写真未選択時に空文字で上書き＝消してしまう事故につながるため）。
  const { name, display_name, credential, bio, link_url, online_consult_url, career_fields } = await req.json();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('experts')
    .update({
      name,
      display_name: (display_name || '').trim() || null,
      credential,
      bio,
      link_url: link_url || '',
      online_consult_url: online_consult_url || '',
      career_fields: sanitizeCareerFields(career_fields),
    })
    .eq('id', expert.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
