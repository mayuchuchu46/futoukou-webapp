import Link from 'next/link';

// 先輩保護者プロフィールページ（app/senpai/[id]/page.tsx）に置く、相談フォームへの
// ボタン。
// 2026-11-01、専門家への質問を「質問するときに希望すれば、登録している専門家・
// 先輩保護者が任意で回答してくれる」という恒久的に無料の仕組みに統合し、特定の人を
// 指名する機能は撤去した。そのため、このボタンも「この先輩保護者」宛てではなく、
// 一般の相談フォーム（/ask、専門家・先輩保護者からの回答もほしいチェック付き）へ
// 案内する文言に変更した。
export default function SenpaiConsultCta() {
  return (
    <Link
      href="/ask"
      className="btn-secondary"
      style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      どうする先生で相談してみる →
    </Link>
  );
}
