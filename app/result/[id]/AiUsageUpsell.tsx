'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUid } from '@/lib/uid';

// AI無料相談を累計で一定回数（閾値はlib/config.tsのAI_USAGE_UPSELL_THRESHOLD）
// 使った利用者に、専門家への相談（無料。2026-11-01に恒久的に無料化した）を
// 案内するバナー。
// 2026-10-11時点では実利用データのない仮説の閾値なので、ここで表示/非表示だけ
// 切り替え、実際の案内文言・導線は既存の「専門家に相談する」teaserと揃える。
//
// 2026-11-07、「専門家に相談する、の先が普通の相談ページにいくんだけど、また
// 相談しないといけないの？って感じになりそう」との指摘を受けて、/askへの
// 遷移（＝もう一度書き直す）をやめ、今表示しているこの相談をワンクリックで
// そのまま専門家・経験者の回答待ちキューに乗せる方式に変更。あわせて、
// 任意の一人を選んで直接見てもらいたい場合向けに、専門家一覧・経験者一覧への
// 導線も追加した（「専門家一覧から選ぶ」導線）。
export default function AiUsageUpsell({
  consultationId,
  authorId,
}: {
  consultationId: string;
  authorId: string;
}) {
  const [show, setShow] = useState(false);
  const [expertAvailable, setExpertAvailable] = useState(false);
  const [requestState, setRequestState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`/api/ai-usage-count?author_id=${getUid()}`).then((r) => r.json()),
      fetch('/api/experts/available').then((r) => r.json()),
    ])
      .then(([usage, experts]) => {
        if (cancelled) return;
        setShow((usage.count || 0) >= (usage.threshold || Infinity));
        setExpertAvailable(!!experts.available);
      })
      .catch(() => {
        if (!cancelled) setShow(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  async function requestExpert() {
    setRequestState('sending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/consultations/request-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: consultationId, author_id: authorId || getUid() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || '送信に失敗しました。時間をおいて再度お試しください。');
        setRequestState('error');
        return;
      }
      setRequestState('sent');
    } catch {
      setErrorMessage('送信に失敗しました。時間をおいて再度お試しください。');
      setRequestState('error');
    }
  }

  return (
    <div className="expertteaser">
      <div className="expertteaser-title">
        もっと詳しく相談してみませんか
        {!expertAvailable && <span className="comingsoon-badge">準備中・近日公開</span>}
      </div>
      {expertAvailable ? (
        <>
          <div className="expertteaser-desc">
            ここまで何度かAIに相談いただいています。状況を直接読んだ専門家・経験者から、文章で個別の回答が届くことがあります（無料）。
          </div>
          {requestState === 'sent' ? (
            <div className="muted" style={{ fontSize: 13 }}>
              専門家・経験者に伝わるようにしました。回答が届くとこのページに表示されます。
            </div>
          ) : (
            <button
              type="button"
              className="btn-secondary"
              disabled={requestState === 'sending'}
              onClick={requestExpert}
            >
              {requestState === 'sending' ? '送信中…' : '専門家・経験者に回答をリクエストする'}
            </button>
          )}
          {requestState === 'error' && (
            <div className="muted" style={{ fontSize: 12, color: 'var(--orange-text)' }}>
              {errorMessage}
            </div>
          )}
          <div className="muted" style={{ fontSize: 12 }}>
            特定の方を選んで直接相談したい場合は、
            <Link href="/experts" style={{ fontWeight: 700 }}>
              専門家一覧
            </Link>
            ・
            <Link href="/senpai" style={{ fontWeight: 700 }}>
              経験者一覧
            </Link>
            からプロフィールを見て選ぶこともできます。
          </div>
        </>
      ) : (
        <div className="expertteaser-desc">
          ここまで何度かAIに相談いただいています。現在、運営の確認が完了した専門家がまだ登録されていないため、個別相談は準備中です。登録が整い次第ご利用いただけるようになります。
        </div>
      )}
    </div>
  );
}
