import Link from 'next/link';

// TOPページに出す「見守り力タイプ診断」への誘導バナー（2026-11-01追加）。
// 拡散をメインに置いた診断コンテンツ（lib/mimamoriShindan.ts・app/shindan/mimamori参照）
// への入り口として、見た目はNewsTeaser・TodayQuestionTeaserの回答済みバナーと同じ
// .expertbanner/.expertbanner-todayを流用し、新しいCSSは増やさない。
export default function MimamoriShindanTeaser() {
  return (
    <Link href="/shindan/mimamori" className="expertbanner expertbanner-today">
      <span className="expertbanner-icon" aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>🔍</span>
      <div className="expertbanner-body">
        <div className="expertbanner-title">あなたの「見守り力」タイプ診断</div>
        <div className="expertbanner-desc">全8問・今のあなたの対応スタイルを診断</div>
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
