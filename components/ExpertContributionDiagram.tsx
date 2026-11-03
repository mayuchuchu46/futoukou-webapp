// 専門家・経験者それぞれの募集ページ（/expert/recruit・/senpai/recruit）向けの
// 「ご協力いただく内容」の図解（2026-11-03追加）。文章だけだと「テキスト回答が必須で、
// 通話・チャットは任意の追加要素」という関係性が伝わりにくいとの指摘を受けて、
// ExpertRecruitFlowDiagram（登録の流れ）と同じ見た目のトーンで追加。
// 登録の流れ図とは違い、これは時系列の手順ではなく「必須＋任意」の構成なので、
// 矢印ではなく「＋」の記号でつなぎ、順番ではなく内訳であることを表す。
export default function ExpertContributionDiagram() {
  const stepFill = 'var(--card)';
  const stepStroke = 'var(--border)';
  const textColor = 'var(--text)';
  const mutedColor = 'var(--muted)';
  const accent = 'var(--orange-text)';
  const accentBg = 'var(--orange-bg)';

  return (
    <svg viewBox="0 0 320 260" width="100%" style={{ maxWidth: 320, margin: '0 auto', display: 'block' }} role="img" aria-label="ご協力いただく内容：テキストでの回答（必須）と、オンラインでの通話・チャット（任意）の図">
      {/* テキストでの回答（必須） */}
      <rect x="20" y="10" width="280" height="88" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <rect x="36" y="24" width="40" height="20" rx="10" fill={accentBg} />
      <text x="56" y="38" fontSize="10.5" fill={accent} fontWeight="700" textAnchor="middle">必須</text>
      <text x="36" y="66" fontSize="14" fill={textColor} fontWeight="700">テキストでの回答</text>
      <text x="36" y="85" fontSize="11" fill={mutedColor}>届いた相談文に、ご自身のタイミングで</text>
      <text x="36" y="99" fontSize="11" fill={mutedColor}>文章で回答します</text>

      {/* ＋記号（順番ではなく内訳であることを示す） */}
      <text x="160" y="128" fontSize="20" fill={mutedColor} fontWeight="700" textAnchor="middle">＋</text>

      {/* オンラインでの通話・チャット（任意） */}
      <rect x="20" y="140" width="280" height="110" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <rect x="36" y="154" width="40" height="20" rx="10" fill="var(--bg)" />
      <text x="56" y="168" fontSize="10.5" fill={mutedColor} fontWeight="700" textAnchor="middle">任意</text>
      <text x="36" y="196" fontSize="14" fill={textColor} fontWeight="700">オンラインでの通話・チャット</text>
      <text x="36" y="215" fontSize="11" fill={mutedColor}>ご自身がお使いの外部サービス（予約サイト</text>
      <text x="36" y="229" fontSize="11" fill={mutedColor}>など）へのリンクをプロフィールに設定すると、</text>
      <text x="36" y="243" fontSize="11" fill={mutedColor}>「オンラインで相談する」ボタンが表示されます</text>
    </svg>
  );
}
