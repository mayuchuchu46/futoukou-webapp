import { getApprovedFacilityInfo, type FacilityType } from '@/lib/facilityInfo';
import { FACILITY_FEATURE_LABEL } from '@/lib/data/facilityFeatures';

// 施設・学校ページに、承認済みの費用・特徴タグを表示する汎用コンポーネント
// （components/FacilityConsultations.tsxと同じ考え方、2026-11-07追加）。
// 呼び出し側は<Suspense fallback={null}>で囲むこと（DB問い合わせを含むため）。
// 承認済みの提案が無ければ何も表示しない（CoCon等と違い「お問い合わせください」
// という空の行は出さない。情報が無いことを示すより、無ければ出さない方針）。
export default async function FacilityInfoCard({
  facilityType,
  facilityNo,
}: {
  facilityType: FacilityType;
  facilityNo: number;
}) {
  const info = await getApprovedFacilityInfo(facilityType, facilityNo);
  if (!info || (!info.fee && info.features.length === 0 && !info.photoUrl)) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {info.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={info.photoUrl}
          alt="施設から提供された写真"
          style={{ width: '100%', borderRadius: 12, display: 'block', objectFit: 'cover', maxHeight: 280 }}
        />
      )}
      {info.fee && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            paddingBottom: 6,
          }}
        >
          <span className="muted" style={{ fontSize: 13 }}>費用</span>
          <span className="qtext" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
            {info.fee}
          </span>
        </div>
      )}
      {info.features.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {info.features.map((f) => (
            <span
              key={f}
              className="chip chip-tag"
              style={{ fontSize: 11 }}
            >
              {FACILITY_FEATURE_LABEL[f]}
            </span>
          ))}
        </div>
      )}
      <div className="muted" style={{ fontSize: 11 }}>
        ※施設・学校からの情報提供にもとづく表示です
      </div>
    </div>
  );
}
