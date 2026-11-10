import Link from 'next/link';
import { NEWS_ITEMS } from '@/lib/data/news';
import { todayJstDateString } from '@/lib/dailyQuestions';
import { getSparkHeights } from '@/lib/sparkline';

// TOPページに出す「不登校に関する最新ニュース」への誘導バナー（2026-10-29追加）。
// 「助成金情報だけでなく最新ニュースも定期チェックして、できればサイトにも出したい」
// との要望を受けて新設。見た目はTodayQuestionTeaser（みんなのデータ）の回答済み
// バナーと同じ.expertbanner/.expertbanner-todayを流用し、新しいCSSは増やさない。
// ニュースが1件も無いうちはバナー自体を出さない（空のページへ誘導しても意味がないため）。
//
// リンク先は一覧ページ（/news）にする。一時/news/{id}（最新記事への直リンク）に
// していたが、このバナーがTOP画面で常時表示される唯一の目立つ入り口であるため、
// ここが個別記事止まりだと一覧（過去分含む全体）への導線が実質無くなってしまう
// （ヘッダー・サイドメニューのニュースリンクは別途あるが、PC限定・ページ下部等で
// 目立たない。「ニュース一覧への導線がまだ弱い」との指摘を受けて2026-10-29に修正）。
// 一覧ページ自体が新しい順で最新記事をいちばん上に出すため、ここで一覧に飛んでも
// 最新記事はすぐ見える。
//
// バナーに出す1件は、NEWS_ITEMS[0]（date＝記事・発表の公開日が最新のもの）ではなく、
// addedAt（当サイトへの掲載日）が最新のものを選ぶ（2026-11-05修正）。dateだけで選ぶと、
// 「公開は少し前だが、当サイトが見つけて載せたのは今日」という記事（1日2回のニュース
// 収集タスクが見つけたもの）がバナーに反映されず、サイトを定期更新している手応えが
// 画面に出ないため。一覧ページ（/news）の並び順はdate基準のまま変更しない。
// 2026-11-10追加：「ニュース記事の方は？」との指摘を受けて、隣に並ぶ
// FutoukouDataTeaser（データ誘導バナー）と同じく、記事が見出し数字（headline）・
// グラフ用数値（stats）を持つ場合はアイコン（📰）の代わりにそれを表示するように
// した。ただしニュース記事は数字の無いもの（施設開校のお知らせ等）も多いため、
// headline・statsのどちらも無い記事では従来どおりアイコンにフォールバックする
// （FutoukouDataTeaserは全カードが必ずheadlineValueを持つため常に数字表示だが、
// こちらは記事ごとに有無が分かれる）。
// 2026-11-10再修正：「バナーのデザインの配置バランス改善して」との指摘を受けて、
// FutoukouDataTeaser.tsxと同じく、数字とミニグラフを離して置かず、数字の真下に
// グラフを添えた1つの塊（.expertbanner-stat内）にまとめた（詳細はapp/globals.cssの
// .expertbanner-statコメント参照）。
export default function NewsTeaser() {
  // addedAtが同じ日付（1日2回のニュース収集タスクが同じ日に2件追加した場合など）の
  // ときは「>=」でタイブレークし、NEWS_ITEMS配列の中でより後ろにある方を選ぶ
  // （2026-11-06修正、「でもTOPに出てないよ」との指摘を受けて。単純な「>」だと配列の
  // 先頭寄り＝記事自体のdateが新しい方が常に勝ってしまい、同じ日の2回目の実行で
  // 見つけた記事（dateは前の記事より古いがaddedAtは同じ今日）がバナーに反映されない
  // 不具合があった。addedAtはYYYY-MM-DDのみで追加した時刻までは記録していないため、
  // この配列内の前後関係によるタイブレークは厳密な解決ではないが、実際の運用
  // （1日2回、見つかった記事をその都度追記していく）に対しては妥当な近似になる）。
  const latest = NEWS_ITEMS.reduce<typeof NEWS_ITEMS[number] | undefined>(
    (mostRecentlyAdded, item) =>
      !mostRecentlyAdded || item.addedAt >= mostRecentlyAdded.addedAt ? item : mostRecentlyAdded,
    undefined
  );
  if (!latest) return null;

  const titleLabel = latest.title.length > 32 ? `${latest.title.slice(0, 32)}…` : latest.title;

  // addedAt（当サイトへの掲載日）が今日・昨日（JST）のうちはNEWバッジを出す
  // （2026-11-05追加、「NEWみたいなマークつけれる？」との要望を受けて）。
  // ConsultationCard.tsxの.new-badge（投稿から1時間以内の相談に付けるもの）と
  // 同じCSSクラスを流用し、新しいCSSは増やさない。こちらは1日2回のニュース
  // 収集タスクの更新サイクルに合わせ、「今日・昨日に追加」を基準にする
  // （1時間基準だと、朝7時台に追加した記事が昼にはもうNEWでなくなってしまう）。
  const diffDays = Math.round(
    (new Date(todayJstDateString()).getTime() - new Date(latest.addedAt).getTime()) / 86400000
  );
  const isNew = diffDays >= 0 && diffDays <= 1;

  // headline（見出し数字）があればアイコンの代わりに表示。statsがあれば実データの
  // ミニ棒グラフも添える（FutoukouDataTeaser.tsxと同じ.expertbanner-stat／
  // .expertbanner-today-graph--realを流用）。どちらも無い記事（施設開校の
  // お知らせ等）では、従来どおり📰アイコンを出す。
  const sparkHeights = getSparkHeights((latest.stats || []).slice(0, 5).map((s) => s.value));

  return (
    <Link href="/news" className="expertbanner expertbanner-today">
      {latest.headline ? (
        <div className="expertbanner-stat" aria-hidden="true">
          <span className="expertbanner-stat-value">{latest.headline.value}</span>
          {sparkHeights.length >= 2 && (
            <div className="expertbanner-stat-spark">
              {sparkHeights.map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: `${Math.round(h)}%`,
                    background: i === sparkHeights.length - 1 ? 'var(--main)' : 'var(--sub)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <span className="expertbanner-icon" aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>📰</span>
      )}
      <div className="expertbanner-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isNew && <span className="new-badge">NEW</span>}
          <div className="expertbanner-title">{titleLabel}</div>
        </div>
        <div className="expertbanner-desc">不登校に関する最新ニュース</div>
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
