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

  // まだ該当する先輩保護者がいない場合、以前は何も表示していなかったが、
  // 「各学校のところに、この学校について話せる保護者を募集してる▶登録、
  // な流れつくれたりする？」との指摘を受けて、募集導線を表示するように変更
  // （2026-10-31）。登録フォーム（/senpai/register）には学校名（name）を
  // クエリパラメータで渡し、入力の手間を減らす。
  if (!rows || rows.length === 0) {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>
          {label}
        </div>
        <div className="qtext" style={{ fontSize: 13 }}>
          まだ「{name}」について話せる先輩保護者がいません。実際に通われた（通われている）ご家庭の方、募集しています。
        </div>
        <Link href={`/senpai/recruit?school=${encodeURIComponent(name)}`} className="btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }}>
          先輩保護者として登録する →
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {label}
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
