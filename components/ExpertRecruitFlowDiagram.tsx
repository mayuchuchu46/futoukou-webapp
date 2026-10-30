// 専門家・先輩保護者募集ページ（/expert/recruit）向けの登録フローの図解。
// テキストの「登録の流れ」リストだけだと流れが掴みにくいとの指摘を受けて追加（2026-10-30）。
// 文章の<ol>は読み上げ・検索のために残し、この図は視覚的な補助として併置する。
// CSS変数（globals.css）の配色をそのまま使い、他ページの見た目と揃える。

export default function ExpertRecruitFlowDiagram() {
  const stepFill = 'var(--card)';
  const stepStroke = 'var(--border)';
  const arrowStroke = 'var(--muted)';
  const textColor = 'var(--text)';
  const mutedColor = 'var(--muted)';
  const accent = 'var(--orange-text)';
  const accentBg = 'var(--orange-bg)';

  return (
    <svg viewBox="0 0 320 450" width="100%" style={{ maxWidth: 320, margin: '0 auto', display: 'block' }} role="img" aria-label="登録からお支払いまでの流れ図">
      {/* STEP 1: 登録フォームに入力 */}
      <rect x="20" y="10" width="280" height="56" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="33" fontSize="11" fill={mutedColor} fontWeight="700">STEP 1</text>
      <text x="40" y="52" fontSize="13" fill={textColor} fontWeight="700">登録フォームに入力</text>

      {/* 分岐：①②の立場を選ぶ（横並びのバッジだと文字が収まりきらなかったため、
          1行のテキストにまとめた。2026-10-30） */}
      <rect x="20" y="74" width="280" height="24" rx="12" fill={accentBg} />
      <text x="160" y="90" fontSize="11" fill={accent} fontWeight="700" textAnchor="middle">① 専門家　または　② 先輩保護者 を選択</text>

      <line x1="160" y1="108" x2="160" y2="126" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 2: 本人確認 */}
      <rect x="20" y="130" width="280" height="80" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="153" fontSize="11" fill={mutedColor} fontWeight="700">STEP 2</text>
      <text x="40" y="172" fontSize="13" fill={textColor} fontWeight="700">本人確認</text>
      <text x="40" y="189" fontSize="10.5" fill={mutedColor}>①登録証アップロード、または通話</text>
      <text x="40" y="203" fontSize="10.5" fill={mutedColor}>②通話のみ</text>

      <line x1="160" y1="210" x2="160" y2="228" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 3: 運営が確認 */}
      <rect x="20" y="232" width="280" height="56" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="255" fontSize="11" fill={mutedColor} fontWeight="700">STEP 3</text>
      <text x="40" y="274" fontSize="13" fill={textColor} fontWeight="700">運営が内容を確認</text>

      <line x1="160" y1="288" x2="160" y2="306" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 4: 相談に回答 */}
      <rect x="20" y="310" width="280" height="56" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="333" fontSize="11" fill={mutedColor} fontWeight="700">STEP 4</text>
      <text x="40" y="352" fontSize="13" fill={textColor} fontWeight="700">相談に回答できるように</text>

      <line x1="160" y1="366" x2="160" y2="384" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 5: 報酬 */}
      <rect x="20" y="388" width="280" height="52" rx="14" fill={accentBg} stroke="none" />
      <text x="160" y="410" fontSize="12.5" fill={accent} fontWeight="700" textAnchor="middle">毎月まとめて</text>
      <text x="160" y="427" fontSize="12.5" fill={accent} fontWeight="700" textAnchor="middle">Stripeで報酬をお支払い</text>

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={arrowStroke} />
        </marker>
      </defs>
    </svg>
  );
}
