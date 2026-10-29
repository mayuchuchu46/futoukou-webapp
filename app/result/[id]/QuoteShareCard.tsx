'use client';

import { useState } from 'react';

// 回答を一言に要約した「格言カード」シェア機能（2026-10-17追加）。
//
// 以前はone_linerを投稿時に毎回AIで生成していたが、実際にシェアされるか
// どうかに関わらず全件でAPIコストがかかっていたため、2026-10-30、ここで
// 「シェア画像を作る」ボタンが押された時だけ/api/consultations/[id]/one-liner
// を呼んでオンデマンド生成する方式に変更した。生成結果はDBにキャッシュされる
// ため、同じ相談で2回目以降に開いた人がいても再生成はされない。
export default function QuoteShareCard({
  id,
  resultUrl,
  initialOneLiner,
}: {
  id: string;
  resultUrl: string;
  initialOneLiner: string | null;
}) {
  const [oneLiner, setOneLiner] = useState<string | null>(initialOneLiner);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function generate() {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/consultations/${id}/one-liner`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.one_liner) {
        setOneLiner(data.one_liner);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  const quoteImageUrl = `${resultUrl}/quote-image`;

  return (
    <div className="card quote-share-card" style={{ alignItems: 'center', gap: 14 }}>
      <div className="answer-label" style={{ fontSize: 13 }}>この回答を、一言カードでシェア</div>
      {oneLiner ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={quoteImageUrl}
            alt={oneLiner}
            width={1080}
            height={1080}
            style={{ width: '100%', maxWidth: 360, height: 'auto', borderRadius: 16, border: '1px solid var(--border)' }}
            loading="lazy"
          />
          <a
            className="share-btn"
            href={`https://twitter.com/intent/tweet?${new URLSearchParams({
              text: `${oneLiner}\n\nーどうする先生`,
              url: resultUrl,
              hashtags: 'どうする先生,不登校',
            })}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="share-btn-icon">𝕏</span>
            この一言をシェア
          </a>
        </>
      ) : (
        <>
          <button type="button" className="share-btn" onClick={generate} disabled={loading}>
            {loading ? '作成中…' : 'シェア画像を作る'}
          </button>
          {failed && <div className="muted" style={{ fontSize: 12 }}>作成に失敗しました。もう一度お試しください。</div>}
        </>
      )}
    </div>
  );
}
