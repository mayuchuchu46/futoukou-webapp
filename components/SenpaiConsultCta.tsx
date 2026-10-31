'use client';

// 先輩保護者プロフィールページ（app/senpai/[id]/page.tsx、サーバーコンポーネント）に
// 置く「この先輩保護者に相談する」ボタン。onClickはサーバーコンポーネントの中に
// 直接書けない（イベントハンドラをClient Componentの外に渡すとビルド・実行時に
// エラーになる）ため、クリック処理だけをこの小さなクライアントコンポーネントに
// 切り出した（2026-10-31、ボタン追加時に実行時エラーが出ていた不具合の修正）。
export default function SenpaiConsultCta() {
  return (
    <button
      type="button"
      className="btn-secondary"
      style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8 }}
      onClick={() => {
        alert('先輩保護者への相談機能（オンライン通話・チャットリレー）は現在準備中です。近日公開予定ですので、もうしばらくお待ちください。');
      }}
    >
      この先輩保護者に相談する
      <span className="comingsoon-badge">近日公開</span>
    </button>
  );
}
