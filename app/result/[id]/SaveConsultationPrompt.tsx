'use client';

import { useEffect, useState } from 'react';
import { getUid } from '@/lib/uid';

// AIの無料相談のすぐ下に出す、会員登録の案内。
// 「質問するには会員登録が必要」という強制ゲートにはせず、相談自体はこれまで通り
// 誰でも匿名で利用できるまま、「残しておける」という価値を見せて登録を促す。
// 表示対象は「この相談の本人（同じブラウザのdsk_uid）」かつ「未ログイン」の場合のみ。
// 以前は「今はしない」でこの相談単位にスキップできたが、毎回出してよいとの判断で
// スキップ機能ごと削除した（2026-10-13）。
export default function SaveConsultationPrompt({ id, authorId }: { id: string; authorId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;

    try {
      if (getUid() !== authorId) return; // 本人の相談ではない（共有リンク等から見に来た人には出さない）
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

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>この相談、残しておけます</div>
      {/* 長い説明文1本ではなく、無料会員登録の魅力をポイントで整理して見せる形に変更
          （2026-10-13、「質問の蓄積で分析ノートが作られる」ことが伝わるように）。 */}
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text)', lineHeight: 1.9 }}>
        <li>この相談が「分析ノート」に記録されます</li>
        <li>相談を重ねるほど、お子さんの状況をAIが整理します</li>
        <li>次にできそうなこと・言葉かけの提案もノートに書き足されます</li>
      </ul>
      <a className="btn-primary" href={`/account/register?next=${encodeURIComponent('/notebook')}`}>
        無料で登録する
      </a>
      <a href="/notebook" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
        分析ノートを見る
      </a>
    </div>
  );
}
