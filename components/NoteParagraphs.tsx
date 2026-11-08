// 施設データのnoteフィールド（運営法人・教育方針・特色等、Web調査で確認できた
// 固有の補足情報）は数文が句点なしで続く1つの長い文字列として保存されている。
// これをそのまま1つの<div>に流し込むと、情報量の多い施設ほど改行の無い
// 長文ブロックになり読みにくい、という指摘を受けて追加した（2026-11-08）。
// 句点「。」の位置で改行を入れて1文＝1行に分けるだけで、文言自体（内容・表現）は
// 一切変更しない。要約・言い換え・書き換えは行わないため、事実の正確性には影響しない。
export function NoteParagraphs({ text }: { text: string }) {
  const sentences = text
    .split('。')
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {sentences.map((s, i) => (
        <div key={i}>{s}。</div>
      ))}
    </div>
  );
}
