'use client';

import Link from 'next/link';

// 先輩保護者プロフィールページ（app/senpai/[id]/page.tsx、サーバーコンポーネント）に
// 置く「この先輩保護者に相談する」ボタン。onClickはサーバーコンポーネントの中に
// 直接書けない（イベントハンドラをClient Componentの外に渡すとビルド・実行時に
// エラーになる）ため、クリック処理だけをこの小さなクライアントコンポーネントに
// 切り出した（2026-10-31、ボタン追加時に実行時エラーが出ていた不具合の修正）。
//
// オンライン通話・チャットリレーの予約・決済はまだ準備中だが、①テキストでの
// 回答（/askの既存フロー）は、EXPERT_VOLUNTEER_MODE（無償ボランティア期間）中は
// 金銭のやり取りが発生しないため、先輩保護者も実際に使えるようにした
// （2026-10-31、「この先輩保護者に相談する、の導線は？」との指摘を受けて、
// 案内のみのボタンから実際に/askへ飛ぶボタンに変更）。通常の有料運用に戻ったら
// （volunteerMode=false）、自動的に「準備中」の案内ボタンに戻る。
export default function SenpaiConsultCta({ expertId, volunteerMode }: { expertId: string; volunteerMode: boolean }) {
  if (volunteerMode) {
    return (
      <Link
        href={`/ask?expert=${expertId}`}
        className="btn-secondary"
        style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        この先輩保護者に相談する（テキストで質問）
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="btn-secondary"
      style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8 }}
      onClick={() => {
        alert('先輩保護者への相談機能は現在準備中です。近日公開予定ですので、もうしばらくお待ちください。');
      }}
    >
      この先輩保護者に相談する
      <span className="comingsoon-badge">近日公開</span>
    </button>
  );
}
