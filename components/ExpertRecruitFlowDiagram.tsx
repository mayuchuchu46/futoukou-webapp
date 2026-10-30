// 専門家・先輩保護者それぞれの募集ページ（/expert/recruit・/senpai/recruit）向けの
// 登録フローの図解。テキストの「登録の流れ」リストだけだと流れが掴みにくいとの
// 指摘を受けて追加（2026-10-30）。
// 専門家と先輩保護者で入り口・ページを分けたため（2026-10-30）、①②の分岐バッジは
// 廃止し、STEP2の本人確認の中身だけをページごとに切り替えられるようにした。
// 文章の<ol>は読み上げ・検索のために残し、この図は視覚的な補助として併置する。
// CSS変数（globals.css）の配色をそのまま使い、他ページの見た目と揃える。

export default function ExpertRecruitFlowDiagram({
  step2Detail,
}: {
  // STEP2「本人確認」の下に表示する補足（例：「登録証アップロード、または通話」）。
  step2Detail: string;
}) {
  const stepFill = 'var(--card)';
  const stepStroke = 'var(--border)';
  const arrowStroke = 'var(--muted)';
  const textColor = 'var(--text)';
  const mutedColor = 'var(--muted)';
  const accent = 'var(--orange-text)';
  const accentBg = 'var(--orange-bg)';

  return (
    <svg viewBox="0 0 320 400" width="100%" style={{ maxWidth: 320, margin: '0 auto', display: 'block' }} role="img" aria-label="登録からお支払いまでの流れ図">
      {/* STEP 1: 登録フォームに入力 */}
      <rect x="20" y="10" width="280" height="56" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="33" fontSize="11" fill={mutedColor} fontWeight="700">STEP 1</text>
      <text x="40" y="52" fontSize="13" fill={textColor} fontWeight="700">登録フォームに入力</text>

      <line x1="160" y1="66" x2="160" y2="84" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 2: 本人確認 */}
      <rect x="20" y="88" width="280" height="64" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="111" fontSize="11" fill={mutedColor} fontWeight="700">STEP 2</text>
      <text x="40" y="130" fontSize="13" fill={textColor} fontWeight="700">本人確認</text>
      <text x="40" y="146" fontSize="10.5" fill={mutedColor}>{step2Detail}</text>

      <line x1="160" y1="152" x2="160" y2="170" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 3: 運営が確認 */}
      <rect x="20" y="174" width="280" height="56" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="197" fontSize="11" fill={mutedColor} fontWeight="700">STEP 3</text>
      <text x="40" y="216" fontSize="13" fill={textColor} fontWeight="700">運営が内容を確認</text>

      <line x1="160" y1="230" x2="160" y2="248" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 4: 相談に回答 */}
      <rect x="20" y="252" width="280" height="56" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="275" fontSize="11" fill={mutedColor} fontWeight="700">STEP 4</text>
      <text x="40" y="294" fontSize="13" fill={textColor} fontWeight="700">相談に回答できるように</text>

      <line x1="160" y1="308" x2="160" y2="326" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 5: 報酬 */}
      <rect x="20" y="330" width="280" height="52" rx="14" fill={accentBg} stroke="none" />
      <text x="160" y="352" fontSize="12.5" fill={accent} fontWeight="700" textAnchor="middle">毎月まとめて</text>
      <text x="160" y="369" fontSize="12.5" fill={accent} fontWeight="700" textAnchor="middle">報酬をお支払い</text>

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={arrowStroke} />
        </marker>
      </defs>
    </svg>
  );
}
