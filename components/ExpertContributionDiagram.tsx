// 専門家・経験者それぞれの募集ページ（/expert/recruit・/senpai/recruit）向けの
// 「ご協力いただく内容」の図解（2026-11-03追加）。文章だけだと「テキスト回答が基本の
// 形で、通話・チャットは任意の追加要素」という関係性が伝わりにくいとの指摘を受けて、
// ExpertRecruitFlowDiagram（登録の流れ）と同じ見た目のトーンで追加。
// 登録の流れ図とは違い、これは時系列の手順ではなく「基本＋任意」の構成なので、
// 矢印ではなく「＋」の記号でつなぎ、順番ではなく内訳であることを表す。
// 「必須」バッジは付けない（2026-11-03、付けていたら「必須」が回答を強制される
// ニュアンスに読めるとの指摘を受けて削除。回答は質問ごとに任意で選べるボランティア制
// のため、強制を連想させる表現は避ける）。
export default function ExpertContributionDiagram() {
  const stepFill = 'var(--card)';
  const stepStroke = 'var(--border)';
  const textColor = 'var(--text)';
  const mutedColor = 'var(--muted)';

  return (
    // ボックス幅が本文より広すぎて右側に大きな余白ができ、配置バランスが悪く
    // 見えていたため（2026-11-03、指摘を受けて調整）、幅を280→250に詰め、
    // 本文のフォントサイズも11→12に上げて中身の密度を上げた。
    <svg viewBox="0 0 320 230" width="100%" style={{ maxWidth: 320, margin: '0 auto', display: 'block' }} role="img" aria-label="ご協力いただく内容：テキストでの回答と、オンラインでの通話・チャット（任意）の図">
      {/* テキストでの回答 */}
      <rect x="35" y="10" width="250" height="76" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="51" y="36" fontSize="14" fill={textColor} fontWeight="700">テキストでの回答</text>
      <text x="51" y="58" fontSize="12" fill={mutedColor}>答えたい質問を選んで、ご自身の</text>
      <text x="51" y="74" fontSize="12" fill={mutedColor}>タイミングで文章で回答します</text>

      {/* ＋記号（順番ではなく内訳であることを示す） */}
      <text x="160" y="104" fontSize="20" fill={mutedColor} fontWeight="700" textAnchor="middle">＋</text>

      {/* オンラインでの通話・チャット（任意） */}
      <rect x="35" y="116" width="250" height="104" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <rect x="51" y="130" width="40" height="20" rx="10" fill="var(--bg)" />
      <text x="71" y="144" fontSize="10.5" fill={mutedColor} fontWeight="700" textAnchor="middle">任意</text>
      <text x="51" y="172" fontSize="14" fill={textColor} fontWeight="700">オンラインでの通話・チャット</text>
      <text x="51" y="191" fontSize="12" fill={mutedColor}>ご自身がお使いの外部サービス（予約</text>
      <text x="51" y="206" fontSize="12" fill={mutedColor}>サイトなど）へのリンクをプロフィールに</text>
      <text x="51" y="221" fontSize="12" fill={mutedColor}>設定すると、専用ボタンが表示されます</text>
    </svg>
  );
}
