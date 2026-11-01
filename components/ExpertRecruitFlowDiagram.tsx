// 専門家・先輩保護者それぞれの募集ページ（/expert/recruit・/senpai/recruit）向けの
// 登録フローの図解。テキストの「登録の流れ」リストだけだと流れが掴みにくいとの
// 指摘を受けて追加（2026-10-30）。
// 文章の<ol>は読み上げ・検索のために残し、この図は視覚的な補助として併置する。
// CSS変数（globals.css）の配色をそのまま使い、他ページの見た目と揃える。
//
// 2026-11-02、「登録証の提出やオンライン通話は不要です」の文言削除に合わせて、
// 本文（<ol>）と食い違っていた図を修正。以前は「STEP2 本人確認（登録証アップロード、
// または通話）」→「STEP3 運営が内容を確認」という、本人確認を前提にした2段階の
// 確認ステップと、「毎月まとめて報酬をお支払い」という最後のステップがあったが、
// 現在の運用（本人確認は不要・運営が内容を確認するだけ／質問への回答自体に報酬は
// 無い）とどちらも矛盾していた。本文の<ol>（登録フォームに入力→運営が確認→
// 相談への回答が可能に、の3ステップ）と完全に一致する3ステップの図に変更した。
export default function ExpertRecruitFlowDiagram({
  step2Detail,
}: {
  // STEP2「運営が内容を確認」の下に表示する補足（ページごとに文言を少し変えられる
  // ようにしている。例：「登録内容を確認」）。
  step2Detail: string;
}) {
  const stepFill = 'var(--card)';
  const stepStroke = 'var(--border)';
  const arrowStroke = 'var(--muted)';
  const textColor = 'var(--text)';
  const mutedColor = 'var(--muted)';

  return (
    <svg viewBox="0 0 320 246" width="100%" style={{ maxWidth: 320, margin: '0 auto', display: 'block' }} role="img" aria-label="登録から相談への回答までの流れ図">
      {/* STEP 1: 登録フォームに入力 */}
      <rect x="20" y="10" width="280" height="56" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="33" fontSize="11" fill={mutedColor} fontWeight="700">STEP 1</text>
      <text x="40" y="52" fontSize="13" fill={textColor} fontWeight="700">登録フォームに入力</text>

      <line x1="160" y1="66" x2="160" y2="84" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 2: 運営が内容を確認 */}
      <rect x="20" y="88" width="280" height="64" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="111" fontSize="11" fill={mutedColor} fontWeight="700">STEP 2</text>
      <text x="40" y="130" fontSize="13" fill={textColor} fontWeight="700">運営が内容を確認</text>
      <text x="40" y="146" fontSize="10.5" fill={mutedColor}>{step2Detail}</text>

      <line x1="160" y1="152" x2="160" y2="170" stroke={arrowStroke} strokeWidth="2" markerEnd="url(#arrow)" />

      {/* STEP 3: 相談に回答 */}
      <rect x="20" y="174" width="280" height="56" rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
      <text x="40" y="197" fontSize="11" fill={mutedColor} fontWeight="700">STEP 3</text>
      <text x="40" y="216" fontSize="13" fill={textColor} fontWeight="700">相談に回答できるように</text>

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={arrowStroke} />
        </marker>
      </defs>
    </svg>
  );
}
