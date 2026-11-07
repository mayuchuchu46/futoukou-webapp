import { FACILITY_CATEGORY_CONTENT, type FacilityCategoryKey } from '@/lib/data/facilityCategoryContent';

// カテゴリ共通の「入会までの一般的な流れ」「よくある質問」を表示する
// （2026-11-07追加）。特定の施設名を主語にしない一般論のみを扱う
// （lib/data/facilityCategoryContent.ts冒頭のコメント参照）。
// よくある質問はFAQPage構造化データも併せて出力し、検索結果での
// リッチリザルト表示も狙う。
export default function FacilityCategoryInfo({ type }: { type: FacilityCategoryKey }) {
  const content = FACILITY_CATEGORY_CONTENT[type];
  if (!content) return null;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 12 }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="answer-label" style={{ fontSize: 14 }}>
        {content.categoryLabel}への入会・利用までの一般的な流れ
      </div>
      <div className="muted" style={{ fontSize: 11 }}>
        ※ この施設固有の手順ではなく、{content.categoryLabel}全般で見られる一般的な流れです。実際の手順は施設にご確認ください。
      </div>
      <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {content.admissionFlow.map((step, i) => (
          <li key={i} className="qtext" style={{ fontSize: 13 }}>
            {step}
          </li>
        ))}
      </ol>

      <div className="answer-label" style={{ fontSize: 14, marginTop: 8 }}>
        よくある質問
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {content.faq.map((item, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            <div className="qtext" style={{ fontWeight: 700, fontSize: 13 }}>Q. {item.q}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>A. {item.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
