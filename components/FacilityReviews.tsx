import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { expertDisplayName } from '@/lib/expertDisplay';
import FacilityReviewForm from './FacilityReviewForm';
import ReviewItem from './ReviewItem';

// 各学校・施設の詳細ページに出す「口コミ」カード（2026-11-07追加）。
// 「この学校の口コミを書く、みたいな流れにして気軽にかける動線作れるといいのかな」
// との提案を受けて追加。経験者のプロフィール（bio）に学校名を書いてもらう既存の
// FacilityExperiencedParents/SchoolExperiencedParentsとは別の導線で、施設ごとに
// 書き込める口コミ（school_reviews）を表示しつつ、その場で書ける入力フォーム
// （FacilityReviewForm）も常に埋め込む。
// 呼び出し側は<Suspense fallback={null}>で囲むこと。
export default async function FacilityReviews({
  facilityType,
  facilityNo,
  facilityName,
}: {
  facilityType: 'school' | 'alternative' | 'free' | 'teiji' | 'tsushin' | 'online';
  facilityNo: string | number;
  facilityName: string;
}) {
  const supabase = getSupabaseAdmin();
  const [{ data: rows }, currentExpert] = await Promise.all([
    supabase
      .from('school_reviews')
      .select('id, body, created_at, experts(id, name, display_name, credential)')
      .eq('facility_type', facilityType)
      .eq('facility_no', String(facilityNo))
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10),
    getCurrentExpert(),
  ]);

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        この学校の口コミ
      </div>

      {rows && rows.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          {rows.map((r) => {
            const reviewer = Array.isArray(r.experts) ? r.experts[0] : r.experts;
            return (
              <ReviewItem
                key={r.id}
                id={r.id}
                authorLabel={reviewer ? `${expertDisplayName(reviewer)}（経験者）` : '経験者'}
                initialBody={r.body}
                isOwner={!!currentExpert && !!reviewer && reviewer.id === currentExpert.id}
              />
            );
          })}
        </div>
      ) : (
        <div className="qtext" style={{ fontSize: 13 }}>
          まだ「{facilityName}」の口コミがありません。実際に通われた（通われている）ご家庭の方、ぜひ書いてみてください。
        </div>
      )}

      <FacilityReviewForm facilityType={facilityType} facilityNo={String(facilityNo)} facilityName={facilityName} />
    </div>
  );
}
