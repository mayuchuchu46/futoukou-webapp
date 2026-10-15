// ルート直下のloading.tsxから使う共通スケルトン。
// 「画面遷移の時遅い感覚がある、さくさくいかない」との指摘を受けて追加（2026-10-16）。
//
// これまで `/`・`/result/[id]` 等のページはサーバー側コンポーネント自身が
// Supabaseへの問い合わせを直接awaitしてからJSXを返す作りで、ページ内に置いていた
// <Suspense>はすでに取得済みのデータを受け取るだけの子要素を包んでいたため、実質的に
// 何も先読み表示していなかった（従来型のブロッキングSSRと同じ）。
// 各ルートフォルダにNext.js標準の`loading.tsx`を置くと、Next.jsがpage.tsx自体を
// 自動でSuspense境界で包んでくれるため、このスケルトンがタップ直後に即表示され、
// データ取得が終わった時点で実際のページに切り替わるようになる。
//
// ヘッダー・カード数枚ぶんのおおまかな形だけを薄く表示し、「反応している」ことが
// 伝わればよいので、ページごとに正確な形を再現する必要はない（意図的に簡素にしている）。
export default function RouteLoadingSkeleton() {
  return (
    <div className="app-shell">
      <div className="skeleton-wrap">
        <div className="skeleton-block" style={{ width: 160, height: 42 }} />
        <div className="skeleton-block" style={{ width: '70%', height: 14, marginTop: 4 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-block" style={{ height: 96, marginTop: 10 }} />
        ))}
      </div>
    </div>
  );
}
