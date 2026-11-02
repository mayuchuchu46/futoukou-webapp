'use client';

import { useEffect, useRef, useState } from 'react';

// まとめページの「種類で絞り込む」チップ（2026-10-21追加）。
//
// 最初は「種類で探す」を別カードの、押すと/gakkoの該当タブへ飛ぶリンク一覧として
// 作ったが、「都道府県で探す」（このページ内でそのまま全カテゴリの一覧が出る）と
// 挙動が違う2つの入口が並ぶ形になってしまっていた。「オンラインフリースクールだけ
// 一覧なのもどうなんだろ、もっと最適なUIを」との指摘を受けて、ページ遷移せず
// その場でカテゴリの表示・非表示を切り替えられるチップに置き換えた。
//
// 各カテゴリの一覧自体はサーバー側（page.tsx）で都道府県に応じて絞り込んだ上で
// 子要素として渡してもらい、ここではCSSのdisplayで出し分けるだけにしている
// （JS無効時・初回表示時はすべて表示される＝全件がHTMLに含まれるため、SEO上も
// 問題ない）。
export type MatomeSection = {
  key: string;
  icon: string;
  label: string;
  count: number;
  node: React.ReactNode;
};

export default function MatomeTypeFilter({ sections }: { sections: MatomeSection[] }) {
  const [active, setActive] = useState<Set<string>>(new Set(sections.map((s) => s.key)));

  // 以前は「すべて表示」の状態から、見たくない種類を1つずつ外していく（トグルで
  // 解除していく）方式だった。1種類だけ見たいときに他の5つを全部タップして
  // 消さなければならず、「ボタンを外していく選択方法がめんどい」との指摘を
  // 受けた（2026-11-02）。種類チップをタップしたら、それ1種類だけに絞り込む
  // 方式（タブに近い動き）に変更し、「すべて」チップで全種類表示に戻せるように
  // した。複数種類を組み合わせて見たい場合の手段は無くなるが、単一種類への
  // 絞り込みのほうが頻度が高いと判断した。
  function selectOnly(key: string) {
    setActive(new Set([key]));
  }

  function selectAll() {
    setActive(new Set(sections.map((s) => s.key)));
  }

  const allActive = active.size === sections.length;

  // 種類チップで1種類だけに絞り込んだとき、その中身（<details>）が元々閉じた状態
  // だと（オンラインフリースクールのセクションは、都道府県による絞り込みが効かず
  // 常に内容があるため、他の5種類と違って初期状態は閉じている）、絞り込んだのに
  // もう一度タップして開かないと一覧が見えない二度手間になっていた
  // （2026-11-02、「オンラインフリースクール選んでもすぐ一覧で出るようにして」
  // との指摘を受けて対応）。1種類だけに絞り込んだ直後は、そのセクション内の
  // <details>を強制的に開く。
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    if (active.size !== 1) return;
    const onlyKey = Array.from(active)[0];
    const el = sectionRefs.current[onlyKey];
    el?.querySelectorAll('details').forEach((d) => {
      d.open = true;
    });
  }, [active]);

  return (
    <>
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>種類で絞り込む</div>
        <div className="chip-row chip-row-wrap">
          <button
            type="button"
            className={`chip chip-tag${allActive ? ' active' : ''}`}
            onClick={selectAll}
          >
            すべて
          </button>
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`chip chip-tag${!allActive && active.has(s.key) ? ' active' : ''}`}
              onClick={() => selectOnly(s.key)}
              style={{ opacity: s.count === 0 ? 0.55 : 1 }}
            >
              {s.icon} {s.label}（{s.count}）
            </button>
          ))}
        </div>
      </div>

      {sections.map((s) => (
        <div
          key={s.key}
          ref={(el) => {
            sectionRefs.current[s.key] = el;
          }}
          style={{ display: active.has(s.key) ? 'contents' : 'none' }}
        >
          {s.node}
        </div>
      ))}
    </>
  );
}
