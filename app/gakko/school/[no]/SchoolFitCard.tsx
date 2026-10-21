'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Child } from '@/lib/types';

// 「この学校がうちの子に合うか合わないかって、相談するごとにわかってくると良くない？」
// との要望を受けて追加（2026-10-22）。会員登録済みの人だけが対象（匿名利用者には何も
// 表示しない）。クライアント側から/api/school-fitを叩く構成にしているのは、Cookieベースの
// 会員判定をサーバーコンポーネント側で直接行うと、CDNの共有キャッシュに特定ユーザー向けの
// 表示が乗ってしまう危険があるため（lib/schoolFit.ts冒頭のコメント参照。/notebookの
// 伴走ノート（ConsultationSummaryCard.tsx）と同じ構成）。
type FitResponse = {
  loggedIn: boolean;
  count: number;
  note: { fitNote: string; progressLabel: string } | null;
};

export default function SchoolFitCard({ schoolNo, schoolName }: { schoolNo: number; schoolName: string }) {
  const [childrenList, setChildrenList] = useState<Child[] | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [data, setData] = useState<FitResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    // 未ログインの間はAPIが常に空配列を返すだけなので、ログイン状態を気にせず取得してよい
    // （ConsultationSummaryCard.tsxと同じ）。
    fetch('/api/children')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setChildrenList(d.children || []);
      })
      .catch(() => {
        if (!cancelled) setChildrenList([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const qs = new URLSearchParams({ school_no: String(schoolNo) });
    if (selectedChildId) qs.set('child_id', selectedChildId);
    fetch(`/api/school-fit?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData({ loggedIn: false, count: 0, note: null });
      });
    return () => {
      cancelled = true;
    };
  }, [schoolNo, selectedChildId]);

  // 未ログイン・読み込み中・エラー時は何も表示しない（会員限定機能で、空の勧誘表示を
  // すべての学校ページに出すと煩わしいため。会員登録への導線は他の案内（相談するCTA等）
  // に任せる）。
  if (!data || !data.loggedIn) return null;

  const childSwitcher =
    childrenList && childrenList.length > 1 ? (
      <div className="chip-row chip-row-wrap" style={{ marginBottom: 2 }}>
        <button
          type="button"
          className={`chip chip-tag${selectedChildId === null ? ' active' : ''}`}
          onClick={() => setSelectedChildId(null)}
        >
          全体
        </button>
        {childrenList.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip chip-tag${selectedChildId === c.id ? ' active' : ''}`}
            onClick={() => setSelectedChildId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
    ) : null;

  if (!data.note) {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>{schoolName}との相性メモ</div>
        {childSwitcher}
        <div className="qtext">
          まだ相談がないため、相性メモはまだ作れません。相談を重ねるほど、ここに今分かっている範囲のメモが作られていきます。
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>{schoolName}との相性メモ</div>
      {childSwitcher}
      <div className="qtext">{data.note.fitNote}</div>
      <div className="muted" style={{ fontSize: 12 }}>
        {data.note.progressLabel}（これまでの相談{data.count}件から）
      </div>
      <Link href="/notebook" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
        伴走ノートも見る ›
      </Link>
    </div>
  );
}
