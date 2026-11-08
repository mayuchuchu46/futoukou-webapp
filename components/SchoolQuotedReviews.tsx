import {
  findQuotedReviews,
  SOURCE_TYPE_LABEL,
  FacilityType,
} from '@/lib/data/schoolQuotedReviews';

// 学校詳細ページに出す「実在の口コミ・評判」カード（2026-11-08追加）。
//
// FacilityReviews（Supabaseに書き込まれたユーザー投稿口コミ）とは別に、
// 行政資料・教育メディア取材記事・学校公式の学校関係者評価PDF等の
// 一次情報から許諾不要で引用できるコメントを静的データとして表示する。
//
// 【法的根拠】著作権法第32条（引用）:
//   - 公表済みの著作物を、批評・研究・報道等の目的で引用する場合は著作権者の
//     許諾なく利用できる。ただし、①引用の必要性、②出典の明示、③主従関係
//     （引用部分が従）、④改変しない、の要件を満たすこと。
//   - minkou.jp等の第三者レビューサイトは同社の利用規約が無断転載を禁じているため、
//     このコンポーネントでは掲載しない（lib/data/schoolQuotedReviews.tsの方針参照）。
//
// 引用データがない学校（大多数）は何も表示しない（return null）。
// 呼び出し側はSuspenseで囲む必要はない（非同期処理なし）。
export default function SchoolQuotedReviews({
  facilityType,
  facilityNo,
}: {
  facilityType: FacilityType;
  facilityNo: number | string;
}) {
  const reviews = findQuotedReviews(facilityType, facilityNo);
  if (reviews.length === 0) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 12 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        評判・口コミ（実在の声）
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        {reviews.map((r, i) => (
          <div
            key={i}
            style={{
              borderLeft: '3px solid var(--border)',
              paddingLeft: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {/* 引用本文 */}
            <blockquote
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.75,
                color: 'var(--text)',
              }}
            >
              「{r.quote}」
            </blockquote>

            {/* 出典行 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                {SOURCE_TYPE_LABEL[r.sourceType]}・出典:{r.sourceName}
                {r.sourceDetail ? `・${r.sourceDetail}` : ''}
              </span>
              <a
                href={r.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textDecoration: 'underline',
                  whiteSpace: 'nowrap',
                }}
              >
                元の資料を見る ›
              </a>
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          margin: '4px 0 0',
          lineHeight: 1.6,
        }}
      >
        ※上記は行政資料・報道記事・学校公式資料等から著作権法第32条に基づき引用したものです。
        minkou.jp等の口コミサイトの投稿はこの欄には含まれていません。
      </p>
    </div>
  );
}
