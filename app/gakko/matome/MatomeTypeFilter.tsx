'use client';

import { useState } from 'react';

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

  function toggle(key: string) {
    setActive((cur) => {
      const next = new Set(cur);
      if (next.has(key)) {
        // 最後の1つは消さない（全部非表示になって「何も無い」ように見えるのを防ぐ）。
        if (next.size === 1) return next;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const allActive = active.size === sections.length;

  return (
    <>
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>種類で絞り込む</div>
        <div className="chip-row chip-row-wrap">
          <button
            type="button"
            className={`chip chip-tag${allActive ? ' active' : ''}`}
            onClick={() => setActive(new Set(sections.map((s) => s.key)))}
          >
            すべて
          </button>
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`chip chip-tag${active.has(s.key) ? ' active' : ''}`}
              onClick={() => toggle(s.key)}
              style={{ opacity: s.count === 0 ? 0.55 : 1 }}
            >
              {s.icon} {s.label}（{s.count}）
            </button>
          ))}
        </div>
      </div>

      {sections.map((s) => (
        <div key={s.key} style={{ display: active.has(s.key) ? 'contents' : 'none' }}>
          {s.node}
        </div>
      ))}
    </>
  );
}
