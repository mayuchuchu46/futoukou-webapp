// 専門家・経験者それぞれの募集ページ（/expert/recruit・/senpai/recruit）向けの
// 登録フローの図解。テキストの「登録の流れ」リストだけだと流れが掴みにくいとの
// 指摘を受けて追加（2026-10-30）。
// 文章の<ol>は読み上げ・検索のために残し、この図は視覚的な補助として併置する。
// CSS変数（globals.css）の配色をそのまま使い、他ページの見た目と揃える。
//
// 2026-11-03、専門家のみ資格の登録証アップロード（またはオンライン通話）による
// 本人確認を復活させたため、専門家向け（/expert/recruit）だけverificationDetailを
// 渡して「本人確認」ステップを追加で表示できるようにした。経験者（/senpai/recruit）
// は本人確認の工程自体が無いため、このプロパティを渡さない＝これまでどおり
// 「登録フォームに入力→運営が内容を確認→相談に回答できるように」の3ステップのまま。
export default function ExpertRecruitFlowDiagram({
  step2Detail,
  verificationDetail,
}: {
  // 「運営が内容を確認」ステップの下に表示する補足（ページごとに文言を少し変えられる
  // ようにしている。例：「プロフィール・資格・リンク等を確認」）。
  step2Detail: string;
  // 専門家向けのみ指定する、本人確認ステップの補足（例：「登録証アップロード、
  // または通話」）。未指定（経験者向け）の場合、本人確認ステップ自体を表示しない。
  verificationDetail?: string;
}) {
  const stepFill = 'var(--card)';
  const stepStroke = 'var(--border)';
  const arrowStroke = 'var(--muted)';
  const textColor = 'var(--text)';
  const mutedColor = 'var(--muted)';

  const steps: { label: string; detail?: string }[] = [
    { label: '登録フォームに入力' },
    ...(verificationDetail ? [{ label: '本人確認', detail: verificationDetail }] : []),
    { label: '運営が内容を確認', detail: step2Detail },
    { label: '相談に回答できるように' },
  ];

  const GAP = 18;
  const PAD_TOP = 10;
  let y = PAD_TOP;
  const boxes = steps.map((step, i) => {
    const height = step.detail ? 64 : 56;
    const box = { ...step, y, height, stepNo: i + 1 };
    y += height + GAP;
    return box;
  });
  const totalHeight = y - GAP + 10;

  return (
    <svg viewBox={`0 0 320 ${totalHeight}`} width="100%" style={{ maxWidth: 320, margin: '0 auto', display: 'block' }} role="img" aria-label="登録から相談への回答までの流れ図">
      {boxes.map((box, i) => (
        <g key={box.label}>
          <rect x="20" y={box.y} width="280" height={box.height} rx="14" fill={stepFill} stroke={stepStroke} strokeWidth="1.5" />
          <text x="40" y={box.y + 23} fontSize="11" fill={mutedColor} fontWeight="700">STEP {box.stepNo}</text>
          <text x="40" y={box.y + 42} fontSize="13" fill={textColor} fontWeight="700">{box.label}</text>
          {box.detail && (
            <text x="40" y={box.y + 58} fontSize="10.5" fill={mutedColor}>{box.detail}</text>
          )}
          {i < boxes.length - 1 && (
            <line
              x1="160"
              y1={box.y + box.height}
              x2="160"
              y2={box.y + box.height + GAP}
              stroke={arrowStroke}
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
          )}
        </g>
      ))}

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={arrowStroke} />
        </marker>
      </defs>
    </svg>
  );
}
