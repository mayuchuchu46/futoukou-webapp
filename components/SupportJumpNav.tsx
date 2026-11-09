'use client';

// /supportページ内ジャンプナビ（2026-11-10追加）。当初は素のaタグ（href="#id"）で
// 実装していたが、「このボタン押してもなんも反応しない」と報告を受けて原因を調査した
// ところ、このアプリはスマホ版で.main（内側のdiv、overflow-y:auto）だけがスクロールする
// 構造になっており、かつiOS Safariの再描画バグ対策として.app-shell/.header/.mainに
// transform: translateZ(0)が付与されている。ブラウザ標準のアンカーリンク挙動
// （#idへのジャンプ）は、祖先要素にtransformが付いていると正しく機能しないことが
// 知られている（特にSafari）。そのため、クリック時にJavaScriptで明示的に
// Element.scrollIntoView()を呼ぶ方式に変更した。href="#id"自体はJS無効時の
// フォールバック・右クリックでのリンクコピー用に残している。
export default function SupportJumpNav() {
  const items: { id: string; label: string }[] = [
    { id: 'ask-dosuru', label: '💬 相談する' },
    { id: 'child', label: '🧒 子ども本人' },
    { id: 'school-life', label: '🏫 学校生活' },
    { id: 'prefecture', label: '📍 都道府県別' },
    { id: 'adolescent-clinic', label: '🏥 思春期外来' },
    { id: 'development-test', label: '🧩 発達検査' },
    { id: 'attendance-system', label: '📚 出席扱い制度' },
    { id: 'materials', label: '✏️ 教材・サービス' },
  ];

  const handleClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // elが見つからない場合はpreventDefaultしない＝通常のhref遷移に任せる
    // （万一idがずれていても、何も起きないよりはページ内の該当箇所を探す手がかりになる）。
  };

  return (
    <div className="chip-row" style={{ margin: '-2px 0 0' }}>
      {items.map((item) => (
        <a key={item.id} href={`#${item.id}`} className="chip chip-tag" onClick={handleClick(item.id)}>
          {item.label}
        </a>
      ))}
    </div>
  );
}
