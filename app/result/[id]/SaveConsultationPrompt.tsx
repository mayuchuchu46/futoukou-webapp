'use client';

import { useEffect, useState } from 'react';
import { getUid } from '@/lib/uid';

// スキップ済みの相談IDを憶えておくためのlocalStorageキー。
// 「今はしない」を押した後、同じ相談ページを再訪したときに毎回出さないようにする。
const DISMISSED_KEY = 'dsk_save_prompt_dismissed';

function getDismissedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markDismissed(id: string) {
  try {
    const set = getDismissedSet();
    set.add(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorageが使えない環境では何もしない（単に毎回表示されるだけ）
  }
}

// AIの無料相談のすぐ下に出す、スキップ可能な会員登録の案内。
// 「質問するには会員登録が必要」という強制ゲートにはせず、相談自体はこれまで通り
// 誰でも匿名で利用できるまま、「残しておける」という価値を見せて登録を促す。
// 表示対象は「この相談の本人（同じブラウザのdsk_uid）」かつ「未ログイン」かつ
// 「まだこの相談でスキップしていない」場合のみ。
export default function SaveConsultationPrompt({ id, authorId }: { id: string; authorId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;

    try {
      if (getUid() !== authorId) return; // 本人の相談ではない（共有リンク等から見に来た人には出さない）
      if (getDismissedSet().has(id)) return; // 既にこの相談ではスキップ済み
    } catch {
      return;
    }

    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && !data.loggedIn) setShow(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, authorId]);

  if (!show) return null;

  function skip() {
    markDismissed(id);
    setShow(false);
  }

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>この相談、残しておけます</div>
      <div className="qtext">
        無料登録すると、スマホを買い替えても、別のブラウザで開いても、この相談を後から読み返せます。
      </div>
      <div className="row" style={{ gap: 10, width: '100%' }}>
        <a className="btn-primary" href={`/account/register?next=${encodeURIComponent(`/result/${id}`)}`}>
          無料で登録する
        </a>
        <button type="button" className="btn-ghost" onClick={skip}>
          今はしない
        </button>
      </div>
    </div>
  );
}
