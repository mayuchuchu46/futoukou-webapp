import Link from 'next/link';
import { NEWS_ITEMS } from '@/lib/data/news';
import { todayJstDateString } from '@/lib/dailyQuestions';

// TOPページに出す「不登校に関する最新ニュース」への誘導バナー（2026-10-29追加）。
// 「助成金情報だけでなく最新ニュースも定期チェックして、できればサイトにも出したい」
// との要望を受けて新設。見た目はTodayQuestionTeaser（みんなのデータ）の回答済み
// バナーと同じ.expertbanner/.expertbanner-todayを流用し、新しいCSSは増やさない。
// ニュースが1件も無いうちはバナー自体を出さない（空のページへ誘導しても意味がないため）。
//
// リンク先は個別記事ページ（/news/{id}）にする。
// 以前は一覧ページ（/news）にしていたが、バナーに特定の記事の見出し・数字を
// 表示しているのに押すと一覧に飛んでしまい、その記事自体にはたどり着けない
// （一覧はdate基準の並びのため、バナーで見せているaddedAt最新の記事が
// 必ずしも先頭に出るとは限らない）という不具合があった（2026-11-19、
// 「トップからの不登校ニュースだけど、クリックしても一覧だからそのニュースに
// 辿り着けない」との指摘を受けて修正）。ニュース一覧自体への導線は
// ヘッダー・サイドメニュー・個別記事ページ側に別途あるため、ここは
// バナーが見せている記事そのものへ直接飛ばす。
//
// バナーに出す1件は、NEWS_ITEMS[0]（date＝記事・発表の公開日が最新のもの）ではなく、
// addedAt（当サイトへの掲載日）が最新のものを選ぶ（2026-11-05修正）。dateだけで選ぶと、
// 「公開は少し前だが、当サイトが見つけて載せたのは今日」という記事（1日2回のニュース
// 収集タスクが見つけたもの）がバナーに反映されず、サイトを定期更新している手応えが
// 画面に出ないため。一覧ページ（/news）の並び順はdate基準のまま変更しない。
// 2026-11-10追加：「ニュース記事の方は？」との指摘を受けて、隣に並ぶ
// FutoukouDataTeaser（データ誘導バナー）と同じく、記事が見出し数字（headline）を
// 持つ場合はアイコン（📰）の代わりにそれを表示するようにした。ただしニュース記事は
// 数字の無いもの（施設開校のお知らせ等）も多いため、headlineの無い記事では従来どおり
// アイコンにフォールバックする（FutoukouDataTeaserは全カードが必ずheadlineValueを
// 持つため常に数字表示だが、こちらは記事ごとに有無が分かれる）。
// 2026-11-10再修正：データ側で「数字だけでいいかも」と整理されたのに合わせ、
// 一時追加していたミニグラフ（stats由来）は削除し、headline数字のみ／アイコンの
// どちらかを出すシンプルな構成にした。
export default function NewsTeaser() {
  // addedAtが同じ日付（1日に複数件のニュースを追加した場合など）のときのタイブレーク
  // （2026-11-26修正）。NEWS_ITEMSは新しい記事を配列の先頭に追加していく運用
  // （型定義のコメント「新しい順（配列の先頭が最新）に並べる」のとおり）なので、
  // 同じaddedAtなら配列のより前方（先に見つかった方）を優先する「>」にする必要が
  // あった。以前は逆の「>=」（後ろにある方を優先）になっており、同じ日にもう1件
  // 別の記事のaddedAtだけを今日の日付に更新したケース（八王子市の記事、配列の後方）
  // が、本当に新しく先頭に追加した記事より優先されてバナーに出てしまう不具合があった。
  // addedAtはYYYY-MM-DDのみで時刻までは記録していないため、この配列内の前後関係に
  // よるタイブレークは厳密な解決ではないが、「新しい記事は配列の先頭に追加する」
  // という実際の運用に対しては妥当な近似になる。
  const latest = NEWS_ITEMS.reduce<typeof NEWS_ITEMS[number] | undefined>(
    (mostRecentlyAdded, item) =>
      !mostRecentlyAdded || item.addedAt > mostRecentlyAdded.addedAt ? item : mostRecentlyAdded,
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

  return (
    <Link href={`/news/${latest.id}`} className="expertbanner expertbanner-today">
      {latest.headline ? (
        <div className="expertbanner-stat" aria-hidden="true">
          <span className="expertbanner-stat-value">{latest.headline.value}</span>
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
