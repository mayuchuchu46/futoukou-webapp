import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { buildExperiencedParentOrFilter } from '@/lib/expertSchoolMatch';

// 施設・学校ページに、その施設を経験した先輩保護者を表示する汎用コンポーネント
// （2026-10-30、app/gakko/school/[no]/SchoolExperiencedParents.tsxと同じ仕組みを
// 通信制高校・フリースクール・定時制・オンラインフリースクールにも広げるため汎用化。
// components/FacilityConsultations.tsxと同じ構成に揃えた）。
// 本人確認済みの先輩保護者（経験者）の自己紹介文（bio）、または専用の構造化入力欄
// （experienced_school_names、2026-10-31追加）に、施設名・愛称が含まれていれば表示する。
// 呼び出し側は<Suspense fallback={null}>で囲むこと。
export default async function FacilityExperiencedParents({
  name,
  altName,
  label = '先輩保護者からこの学校の話を聞く',
}: {
  name: string;
  altName?: string | null;
  label?: string;
}) {
  const supabase = getSupabaseAdmin();
  const names = [name, altName].filter((n): n is string => !!n);
  const orFilter = buildExperiencedParentOrFilter(names);

  const { data: rows } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url')
    .eq('verified', true)
    .eq('credential', '先輩保護者（経験者）')
    .or(orFilter)
    .limit(5);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {rows.map((e) => (
          <Link
            key={e.id}
            href={`/experts/${e.id}`}
            style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
          >
            <div className="qtext" style={{ fontWeight: 700 }}>
              👤 {expertDisplayName(e)}（先輩保護者）
            </div>
            {e.bio && (
              <div className="muted qtext-clamp-3" style={{ fontSize: 13, marginTop: 4 }}>
                {e.bio}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
