import Link from 'next/link';
import { cacheLife } from 'next/cache';
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
//
// 2026-11-10、本番ビルドが失敗する不具合を修正：next.config.tsでcacheComponentsを
// 有効化しているため、isFutoukouCardNew内のDate.now()（動的API）を静的プリレンダー中に
// 呼ぶとビルドエラーになる（「Error occurred prerendering page "/data/futoukou"」）。
// コンポーネント全体を'use cache'でキャッシュし、Date.now()の評価をキャッシュ生成時に
// 閉じ込めることで解消。🆕バッジは数日単位の精度で十分なため、cacheLife('hours')
// （キャッシュの再検証間隔）で妥当な新鮮さを保つ。
export default async function FutoukouSummaryGrid() {
  'use cache';
  cacheLife('hours');
  const cards = getFutoukouDataCardsSortedByNewest();
  return (
    <div className="futoukou-tile-grid">
      {cards.map((c) => (
        <Link key={c.slug} href={`/data/futoukou/${c.slug}`} className="futoukou-tile">
          {isFutoukouCardNew(c.addedAt) && <span className="futoukou-tile-new">🆕 新着</span>}
          <span className="futoukou-tile-value">{c.headlineValue}</span>
          <span className="futoukou-tile-label">{c.title}</span>
        </Link>
      ))}
    </div>
  );
}
