'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

// 専門家回答つき相談の表示。
// サーバー側は「会員ではない匿名の訪問者」として見えるべき初期状態（initialItem）を
// すでにSSR済み。ここではマウント後に本当のviewer_id（本人／会員かどうか）で
// 再取得し、ロック解除が必要なら表示を差し替える。決済直後の確認もここで行う。
export default function ResultClient({ id, initialItem }: { id: string; initialItem: Consultation }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [item, setItem] = useState<Consultation>(initialItem);
  const [confirming, setConfirming] = useState(false);

  async function load() {
    const res = await fetch(`/api/consultations?viewer_id=${getUid()}`);
    const data = await res.json();
    const found = (data.consultations || []).find((c: Consultation) => c.id === id);
    if (found) setItem(found as Consultation);
    return found as Consultation | undefined;
  }

  async function confirmPaymentIfNeeded() {
    if (!sessionId) return;
    setConfirming(true);
    try {
      await fetch('/api/expert-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, consultation_id: id }),
      });
    } finally {
      setConfirming(false);
      await load();
    }
  }

  useEffect(() => {
    load().then((found) => {
      if (sessionId && found && found.request_type === 'expert' && !found.paid) {
        confirmPaymentIfNeeded();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="card">
      {confirming && <div className="muted">決済結果を確認しています…</div>}

      {!confirming && !item.paid && (
        <div className="muted">
          お支払いが完了していません。決済ページで手続きが完了すると、ここに反映されます。
        </div>
      )}

      {!confirming && item.paid && item.refunded && (
        <div className="muted">
          この相談は、回答のお届けができなかったため運営にて返金処理をいたしました。ご不便をおかけして申し訳ございません。
        </div>
      )}

      {!confirming && item.paid && !item.refunded && item.expert_status !== 'answered' && (
        <>
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            専門家が回答します
          </div>
          <div className="muted">
            お支払いが完了しました。登録している専門家が内容を確認し、数日以内にテキストで回答します。回答が届くとこのページに表示されます。
          </div>
        </>
      )}

      {!confirming && item.paid && !item.refunded && item.expert_status === 'answered' && item.locked && (
        <>
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            専門家の回答
          </div>
          <div className="blur-lines">
            <div />
            <div />
            <div />
          </div>
          <div className="locked-note">
            この相談は回答済みですが、本文を読むには読み放題会員（月¥800）の登録が必要です。会員はさらに1回¥500で専門家に直接質問もできます。
          </div>
          <Link href="/account" className="btn-primary">
            月¥800で読み放題会員になる
          </Link>
        </>
      )}

      {!confirming && item.paid && !item.refunded && item.expert_status === 'answered' && !item.locked && (
        <>
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            {item.experts ? `${item.experts.credential}・${item.experts.name}さんの回答` : '専門家の回答'}
          </div>
          <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
            {item.expert_answer}
          </div>
        </>
      )}
    </div>
  );
}
