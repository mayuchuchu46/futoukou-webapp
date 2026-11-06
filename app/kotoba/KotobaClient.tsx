'use client';

import Link from 'next/link';
import { useState } from 'react';
import CrisisModal from '@/components/CrisisModal';
import { getUid } from '@/lib/uid';
import { CRISIS_PRECHECK_WORDS } from '@/lib/kotobaHonyaku';

const EXAMPLES = ['もう学校行きたくない', 'お腹痛い', 'どうせ私なんて', 'うるさい、あっち行って'];

type Interpretation = {
  tag: string;
  psychology: string;
  sign: string;
  response_do: string;
  response_avoid: string;
};

type AnalysisResult = {
  is_crisis: boolean;
  is_fallback: boolean;
  interpretations: Interpretation[];
};

export default function KotobaClient() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  async function analyze() {
    const text = input.trim();
    if (!text) {
      setError('言葉を入力してください');
      return;
    }
    setError('');

    // クライアント側の一次チェック。ヒットした場合はAI呼び出し自体を行わず、
    // 既存の相談機能と同じCrisisModal（components/CrisisModal.tsx）を即時表示する。
    if (CRISIS_PRECHECK_WORDS.some((w) => text.includes(w))) {
      setResult(null);
      setShowCrisisModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/kotoba-honyaku', {
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
        <div className="answer-label" style={{ fontSize: 14 }}>子供の言葉、ほんとはこう</div>
        <div className="qtext" style={{ marginTop: 4 }}>
          お子さんが言った言葉をそのまま入れてみてください。考えられる気持ちと、親としての返し方の例を確認できます。
        </div>
      </div>

      <div className="card" style={{ alignItems: 'stretch', gap: 10 }}>
        <textarea
          className="input"
          style={{ minHeight: 70, resize: 'none' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例：もう学校行きたくない"
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
          {loading ? '気持ちを読んでいます…' : '気持ちを読んでみる'}
        </button>
      </div>

      {result && !result.is_crisis && result.is_fallback && (
        <>
          <div className="card" style={{ alignItems: 'flex-start', gap: 8, marginTop: 10 }}>
            <div className="qtext-main">この言葉だけでは、まだ読み取れませんでした</div>
            <div className="muted" style={{ fontSize: 13 }}>
              もう少し具体的に（いつ言ったか、どんな様子だったか）教えていただけると、より詳しい相談ができます。
            </div>
          </div>
          <div className="card home-gakko-link" style={{ alignItems: 'stretch', gap: 8, margin: '10px 0', border: '2px solid var(--main)', background: 'var(--sub)' }}>
            <Link href="/ask" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'var(--main)' }}>どうする先生に相談する</span>
                <span style={{ display: 'block', fontSize: 12 }}>状況を詳しく書いて相談すると、もっと具体的なアドバイスが受けられます</span>
              </span>
              <span style={{ color: 'var(--main)', fontWeight: 700 }}>›</span>
            </Link>
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={reset}>別の言葉を入れてみる</button>
        </>
      )}

      {result && !result.is_crisis && !result.is_fallback && result.interpretations?.length > 0 && (
        <>
          <div className="muted" style={{ fontSize: 13, margin: '14px 0 8px' }}>
            「{input.trim()}」には、こんな気持ちが隠れているかもしれません
          </div>
          {result.interpretations.map((interp, i) => (
            <div className="card" key={i} style={{ alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <span className="cat-badge" style={{ background: 'var(--sub)', color: '#1F4A3C' }}>{interp.tag}</span>
              <div className="qtext-main">{interp.psychology}</div>
              <div className="muted" style={{ fontSize: 13 }}>見分けるヒント：{interp.sign}</div>
              <div className="card-answerbox" style={{ background: 'var(--teal-bg)', width: '100%' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-text)' }}>こう返すとよい</div>
                <div className="qtext">{interp.response_do}</div>
              </div>
              <div className="card-answerbox" style={{ width: '100%' }}>
                <div style={{ fontSize: 12, fontWeight: 700 }} className="muted">避けたい返し方</div>
                <div className="qtext muted" style={{ textDecoration: 'line-through' }}>{interp.response_avoid}</div>
              </div>
            </div>
          ))}
          <div className="card home-gakko-link" style={{ alignItems: 'stretch', gap: 8, margin: '0 0 10px', border: '2px solid var(--main)', background: 'var(--sub)' }}>
            <Link href="/ask" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'var(--main)' }}>この状況、もっと詳しく相談したい方へ</span>
                <span style={{ display: 'block', fontSize: 12 }}>どうする先生に相談する</span>
              </span>
              <span style={{ color: 'var(--main)', fontWeight: 700 }}>›</span>
            </Link>
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={reset}>別の言葉を入れてみる</button>
        </>
      )}

      <div className="muted" style={{ fontSize: 11.5, textAlign: 'center', margin: '20px 0' }}>
        このツールは診断ではなく、気持ちを考えるためのヒントです。心配な様子が続く場合は、学校や専門家にご相談ください。
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
