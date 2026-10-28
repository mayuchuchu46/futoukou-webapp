import Link from 'next/link';
import { NEWS_ITEMS } from '@/lib/data/news';

// TOPページに出す「不登校に関する最新ニュース」への誘導バナー（2026-10-29追加）。
// 「助成金情報だけでなく最新ニュースも定期チェックして、できればサイトにも出したい」
// との要望を受けて新設。見た目はTodayQuestionTeaser（みんなのデータ）の回答済み
// バナーと同じ.expertbanner/.expertbanner-todayを流用し、新しいCSSは増やさない。
// ニュースが1件も無いうちはバナー自体を出さない（空のページへ誘導しても意味がないため）。
export default function NewsTeaser() {
  const latest = NEWS_ITEMS[0];
  if (!latest) return null;

  const titleLabel = latest.title.length > 32 ? `${latest.title.slice(0, 32)}…` : latest.title;

  return (
    <Link href={`/news/${latest.id}`} className="expertbanner expertbanner-today">
      <span className="expertbanner-icon" aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>📰</span>
      <div className="expertbanner-body">
        <div className="expertbanner-title">{titleLabel}</div>
        <div className="expertbanner-desc">不登校に関する最新ニュース</div>
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
