'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import CrisisModal from '@/components/CrisisModal';
import { getUid } from '@/lib/uid';
import { CRISIS_PRECHECK_WORDS } from '@/lib/kotobaHonyaku';
import { SITE_URL } from '@/lib/site';
import {
  type GohoubiTriedItem,
  clearGohoubiTried,
  getGohoubiTried,
  setGohoubiTried,
  updateGohoubiTriedStatus,
} from '@/lib/gohoubiTried';

const EXAMPLES = [
  '子どもと長時間、進路の話をした',
  '仕事と対応で心身ともに限界だった',
  '何もできなかった自分を責めてしまった',
  '小さな前進があった',
];

type Suggestion = {
  title: string;
  category: string;
  reason: string;
};

type GohoubiResult = {
  is_fallback: boolean;
  encouragement: string;
  suggestions: Suggestion[];
};

export default function GohoubiClient() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GohoubiResult | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [triedItem, setTriedItem] = useState<GohoubiTriedItem | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // localStorageはクライアントでしか読めないため、マウント後に読み込む。
  // 前回「これやってみる！」を押した提案が残っていれば、次に来たときに
  // 「できましたか？」と軽く気づかせるきっかけにする。
  useEffect(() => {
    setTriedItem(getGohoubiTried());
  }, []);

  function checkTried(title: string, category: string) {
    setGohoubiTried(title, category);
    setTriedItem(getGohoubiTried());
  }

  function answerTriedCheckIn(status: 'done' | 'skipped') {
    updateGohoubiTriedStatus(status);
    // 答えたら表示自体は消す（「できた」の達成感を残すためだけに一瞬メッセージを
    // 見せたい場合もあるが、まずはシンプルに閉じるだけにする）
    setTimeout(() => {
      clearGohoubiTried();
      setTriedItem(null);
    }, status === 'done' ? 1600 : 0);
    setTriedItem((prev) => (prev ? { ...prev, status } : prev));
  }

  async function analyze() {
    const text = input.trim();
    if (!text) {
      setError('今日あったこと・頑張ったことを入力してください');
      return;
    }
    setError('');

    // /kotobaと同じ、クライアント側での一次チェック。保護者自身の状況説明のため
    // 自己危機的な表現が入る可能性があり、ヒットした場合はAI呼び出し自体を行わず
    // 既存のCrisisModalを即時表示する。
    if (CRISIS_PRECHECK_WORDS.some((w) => text.includes(w))) {
      setResult(null);
      setShowCrisisModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/gohoubi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, uid: getUid() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || '通信エラーが発生しました。もう一度お試しください。');
        return;
      }
      if (data.is_crisis) {
        setShowCrisisModal(true);
        return;
      }
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setInput('');
    setResult(null);
    setError('');
  }

  return (
    <>
      <div style={{ margin: '14px 0 10px' }}>
        <div
          style={{
            display: 'inline-block',
            fontWeight: 800,
            fontSize: 19,
            color: '#fff',
            background: 'var(--main)',
            padding: '3px 12px',
            borderRadius: 8,
            letterSpacing: '0.02em',
          }}
        >
          親のご褒美クラブ
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>今日もがんばった自分に、ご褒美を</div>
        <div className="qtext" style={{ marginTop: 8 }}>
          今日あったこと・頑張ったことを一言書いてみてください。今のあなたに合ったご褒美を提案します。
        </div>
      </div>

      {triedItem && triedItem.status === 'pending' && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 8, marginBottom: 10, border: '2px dashed var(--main)' }}>
          <div className="muted" style={{ fontSize: 12 }}>前回チェックしたご褒美</div>
          <div className="qtext-main">「{triedItem.title}」、できましたか？</div>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => answerTriedCheckIn('done')}>
              できた！
            </button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => answerTriedCheckIn('skipped')}>
              まだ／今回はいいや
            </button>
          </div>
        </div>
      )}
      {triedItem && triedItem.status === 'done' && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 6, marginBottom: 10, border: '2px solid var(--main)', background: 'var(--sub)' }}>
          <div className="qtext-main">よくできました！🎉</div>
        </div>
      )}

      <div className="card" style={{ alignItems: 'stretch', gap: 10 }}>
        <textarea
          className="input"
          style={{ minHeight: 70, resize: 'none' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例：子どもと長時間、進路の話をした"
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="crisis-btn"
              style={{ borderBottom: '1.5px dashed var(--main)', color: 'var(--main)' }}
              onClick={() => setInput(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
        {error && <div style={{ color: 'var(--seal-text)', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={analyze} disabled={loading}>
          {loading ? 'ご褒美を考えています…' : 'ご褒美を提案してもらう'}
        </button>
      </div>

      {result && result.is_fallback && (
        <div ref={resultRef} style={{ scrollMarginTop: 16 }}>
          <div className="card" style={{ alignItems: 'flex-start', gap: 8, marginTop: 10 }}>
            <div className="qtext-main">この内容だけでは、まだご褒美を考えられませんでした</div>
            <div className="muted" style={{ fontSize: 13 }}>
              もう少し具体的に（今日どんなことがあったか）教えていただけると、提案しやすくなります。
            </div>
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={reset}>もう一度入力する</button>
        </div>
      )}

      {result && !result.is_fallback && result.suggestions?.length > 0 && (
        <div ref={resultRef} style={{ scrollMarginTop: 16 }}>
          {result.encouragement && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 6, marginTop: 10, border: '2px solid var(--main)', background: 'var(--sub)' }}>
              <div className="qtext-main">{result.encouragement}</div>
            </div>
          )}
          <div className="muted" style={{ fontSize: 13, margin: '14px 0 8px' }}>
            今のあなたへのご褒美はこちら
          </div>
          {result.suggestions.map((s, i) => {
            const isChecked = triedItem?.title === s.title && triedItem.status !== 'skipped';
            return (
              <div className="card" key={i} style={{ alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <span className="cat-badge" style={{ background: 'var(--sub)', color: '#1F4A3C' }}>{s.category}</span>
                <div className="qtext-main">{s.title}</div>
                <div className="muted" style={{ fontSize: 13 }}>{s.reason}</div>
                <button
                  type="button"
                  className={isChecked ? 'btn-secondary' : 'btn-primary'}
                  style={{ width: '100%' }}
                  disabled={isChecked}
                  onClick={() => checkTried(s.title, s.category)}
                >
                  {isChecked ? '✓ やってみることにしました' : 'これやってみる！'}
                </button>
              </div>
            );
          })}

          <div className="share-btn-row" style={{ margin: '0 0 10px' }}>
            <a
              className="share-btn"
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: `今日のご褒美は「${result.suggestions[0]?.title}」にしました。`,
                url: `${SITE_URL}/gohoubi`,
                hashtags: 'どうする先生,親のご褒美クラブ',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="share-btn-icon">𝕏</span>
              この結果をシェア
            </a>
          </div>

          <div className="card home-gakko-link" style={{ alignItems: 'stretch', gap: 8, margin: '0 0 10px', border: '2px solid var(--main)', background: 'var(--sub)' }}>
            <Link
              href="/ask"
              style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'var(--main)' }}>どうする先生に相談する</span>
                <span style={{ display: 'block', fontSize: 12 }}>今日の状況を詳しく書いて相談すると、具体的なアドバイスが受けられます</span>
              </span>
              <span style={{ color: 'var(--main)', fontWeight: 700 }}>›</span>
            </Link>
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={reset}>もう一度入力する</button>
        </div>
      )}

      <div className="muted" style={{ fontSize: 11.5, textAlign: 'center', margin: '20px 0' }}>
        ここでの提案は診断ではなく、頑張りをねぎらうためのヒントです。つらい気持ちが続く場合は、学校や専門家にご相談ください。
      </div>

      {showCrisisModal && (
        <CrisisModal
          onClose={() => {
            setShowCrisisModal(false);
            reset();
          }}
        />
      )}
    </>
  );
}
