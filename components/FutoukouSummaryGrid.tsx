import Link from 'next/link';
import { FUTOUKOU_DATA_CARDS } from '@/lib/data/futoukouDataCards';

// 「データで見る不登校」(/data/futoukou) の冒頭に置く、全データの一覧タイル
// （2026-11-08追加）。「1ページに羅列だけどもっと整理したUIにして」との指摘を
// 受けて、縦に並んだ詳細セクションに入る前に、全体を見渡して気になるものへ
// すぐ飛べるタップ可能なグリッドを用意した。各タイルは個別シェアページ
// （/data/futoukou/[slug]）への直リンクで、クリックするとその数字・グラフだけの
// ページに飛べる。
export default function FutoukouSummaryGrid() {
  return (
    <div className="futoukou-tile-grid">
      {FUTOUKOU_DATA_CARDS.map((c) => (
        <Link key={c.slug} href={`/data/futoukou/${c.slug}`} className="futoukou-tile">
          <span className="futoukou-tile-value">{c.headlineValue}</span>
          <span className="futoukou-tile-label">{c.title}</span>
        </Link>
      ))}
    </div>
  );
}
