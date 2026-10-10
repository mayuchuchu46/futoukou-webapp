'use client';

import { useEffect, useState } from 'react';
import { getUid } from '@/lib/uid';

// AI無料相談を累計で一定回数（閾値はlib/config.tsのAI_USAGE_UPSELL_THRESHOLD）
// 使った利用者に、専門家への相談（有料）を案内するバナー。
// 2026-10-11時点では実利用データのない仮説の閾値なので、ここで表示/非表示だけ
// 切り替え、実際の案内文言・導線は既存の「公認心理師に相談する」teaserと揃える。
export default function AiUsageUpsell() {
  const [show, setShow] = useState(false);
  const [expertAvailable, setExpertAvailable] = useState(false);

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

  return (
    <div className="expertteaser">
      <div className="expertteaser-title">
        もっと詳しく相談してみませんか
        {!expertAvailable && <span className="comingsoon-badge">準備中・近日公開</span>}
      </div>
      {expertAvailable ? (
        <>
          <div className="expertteaser-desc">
            ここまで何度かAIに相談いただいています。状況を直接読んだ公認心理師から、文章で個別の回答がほしい場合は、有料の専門家相談もご利用いただけます。
          </div>
          <a className="btn-secondary" href="/ask">
            公認心理師に相談する
          </a>
        </>
      ) : (
        <div className="expertteaser-desc">
          ここまで何度かAIに相談いただいています。現在、本人確認が完了した公認心理師がまだ登録されていないため、個別相談は準備中です。登録が整い次第ご利用いただけるようになります。
        </div>
      )}
    </div>
  );
}
