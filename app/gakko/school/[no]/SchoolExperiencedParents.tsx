import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { buildExperiencedParentOrFilter } from '@/lib/expertSchoolMatch';

// 「保護者は、語れる学校情報とか、わかるといいよね」「その学校のページにも出せると
// いいな」という要望を受けて追加（2026-10-30）。先輩保護者（経験者）の自己紹介文
// （bio）、または専用の構造化入力欄（experienced_school_names、2026-10-31追加）に、
// その学校の名前・愛称が含まれていれば、この学校のページに表示する。
//
// SchoolConsultations.tsx（この学校についての相談）と同じ考え方：学びの多様化学校・
// 通信制・フリースクールなど学校の種類ごとに別々のデータセット（no）を持っており、
// それを横断する構造化リレーションを作るのはコストが高いため、テキスト一致＋
// 構造化配列の軽量な組み合わせにした。該当が無ければ何も表示しない（存在しない
// 先輩保護者を匂わせない）。
export default async function SchoolExperiencedParents({
  schoolName,
  branchName,
}: {
  schoolName: string;
  branchName: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const names = [schoolName, branchName].filter((n): n is string => !!n);
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
        先輩保護者からこの学校の話を聞く
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
        {rows.map((e) => (
          <div key={e.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <Link href={`/experts/${e.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="qtext" style={{ fontWeight: 700 }}>
                👤 {expertDisplayName(e)}（先輩保護者）
              </div>
              {e.bio && (
                <div className="muted qtext-clamp-3" style={{ fontSize: 13, marginTop: 4 }}>
                  {e.bio}
                </div>
              )}
            </Link>
            {/* 「相談してみる、みたいな流れをつくりたい」との指摘を受けて追加（2026-10-31）。
                プロフィールページ（/experts/[id]）にも同じ導線のボタンがあるが、学校ページ
                から1タップで相談を始められるよう、ここにも直接置く。 */}
            <Link
              href={`/ask?expert=${e.id}`}
              className="btn-secondary"
              style={{ display: 'inline-block', marginTop: 8, fontSize: 13, padding: '6px 14px' }}
            >
              {expertDisplayName(e)}さんに相談してみる →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
