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
    <svg viewBox="0 0 320 240" width="100%" style={{ maxWidth: 320, margin: '0 auto', display: 'block' }} role="img" aria-label="ご協力いただく内容：テキストでの回答と、オンラインでの通話・チャット（任意）の図">
      {/* テキストでの回答 */}
      <rect x="20" y="10" width="280" height="78" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="36" y="36" fontSize="14" fill={textColor} fontWeight="700">テキストでの回答</text>
      <text x="36" y="58" fontSize="11" fill={mutedColor}>答えたい質問を選んで、ご自身のタイミングで</text>
      <text x="36" y="72" fontSize="11" fill={mutedColor}>文章で回答します</text>

      {/* ＋記号（順番ではなく内訳であることを示す） */}
      <text x="160" y="108" fontSize="20" fill={mutedColor} fontWeight="700" textAnchor="middle">＋</text>

      {/* オンラインでの通話・チャット（任意） */}
      <rect x="20" y="120" width="280" height="110" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <rect x="36" y="134" width="40" height="20" rx="10" fill="var(--bg)" />
      <text x="56" y="148" fontSize="10.5" fill={mutedColor} fontWeight="700" textAnchor="middle">任意</text>
      <text x="36" y="176" fontSize="14" fill={textColor} fontWeight="700">オンラインでの通話・チャット</text>
      <text x="36" y="195" fontSize="11" fill={mutedColor}>ご自身がお使いの外部サービス（予約サイト</text>
      <text x="36" y="209" fontSize="11" fill={mutedColor}>など）へのリンクをプロフィールに設定すると、</text>
      <text x="36" y="223" fontSize="11" fill={mutedColor}>「オンラインで相談する」ボタンが表示されます</text>
    </svg>
  );
}
