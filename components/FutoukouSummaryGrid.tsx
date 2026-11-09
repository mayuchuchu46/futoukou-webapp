import Link from 'next/link';
import { getFutoukouDataCardsSortedByNewest, isFutoukouCardNew } from '@/lib/data/futoukouDataCards';

// 「データで見る不登校」(/data/futoukou) の冒頭に置く、全データの一覧タイル
// （2026-11-08追加）。「1ページに羅列だけどもっと整理したUIにして」との指摘を
// 受けて、縦に並んだ詳細セクションに入る前に、全体を見渡して気になるものへ
// すぐ飛べるタップ可能なグリッドを用意した。各タイルは個別シェアページ
// （/data/futoukou/[slug]）への直リンクで、クリックするとその数字・グラフだけの
// ページに飛べる。
//
// 2026-11-10追加：「新しく追加されたものは🆕で、トップに出したい」との要望を受けて、
// 新着順（addedAtが新しい順）に並べ替え、追加から日の浅いカードには🆕バッジを付けた。
// 毎日ネタを追加していく運用（スケジュールタスク）なので、タイル一覧の先頭に自然と
// 最新のデータが来るようになる。
export default function FutoukouSummaryGrid() {
  const cards = getFutoukouDataCardsSortedByNewest();
  return (
    <div className="futoukou-tile-grid">
      {cards.map((c) => (
        <Link key={c.slug} href={`/data/futoukou/${c.slug}`} className="futoukou-tile">
          {isFutoukouCardNew(c.addedAt) && <span className="futoukou-tile-new">🆕 NEW</span>}
          <span className="futoukou-tile-value">{c.headlineValue}</span>
          <span className="futoukou-tile-label">{c.title}</span>
        </Link>
      ))}
    </div>
  );
}
