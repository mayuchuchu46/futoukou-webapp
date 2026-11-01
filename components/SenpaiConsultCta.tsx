import Link from 'next/link';

// 先輩保護者プロフィールページ（app/senpai/[id]/page.tsx）に置く
// 「この先輩保護者に相談する」ボタン。
// 2026-11-01、専門家・先輩保護者への質問を恒久的に無料化したのに伴い、
// 常に/askへの実際のリンクとして機能するようにした（以前は無償ボランティア期間
// （EXPERT_VOLUNTEER_MODE）中だけ機能するボタンだったが、その前提自体が恒久化した
// ため、準備中表示との出し分けは不要になった）。
export default function SenpaiConsultCta({ expertId }: { expertId: string }) {
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
