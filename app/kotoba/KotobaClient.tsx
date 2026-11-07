'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
  consultation_id?: string | null;
};

export default function KotobaClient() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  // 専門家への導線強化（2026-11-07追加）。/askの「専門家・経験者にも回答してもらう」
  // チェックと同じ仕組み。本人確認済みの専門家が1人もいない間はチェック自体を出さない
  // （/askのexpertAvailableと同じ考え方）。
  const [expertAvailable, setExpertAvailable] = useState(false);
  const [wantExpert, setWantExpert] = useState(false);
  // 「回答が質問と同じページの下の方に出てきて、出てるのかどうか分かりにくい」との
  // 指摘を受けて追加（2026-11-07）。結果（fallbackも含む）が表示されたタイミングで、
  // 結果の先頭まで自動スクロールする。
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/experts/available')
      .then((r) => r.json())
      .then((d) => setExpertAvailable(!!d.available))
      .catch(() => setExpertAvailable(false));
  }, []);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

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
        body: JSON.stringify({ text, uid: getUid(), wantExpert }),
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
          子どもの本音翻訳
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>子供の言葉、ほんとはこう</div>
        <div className="qtext" style={{ marginTop: 8 }}>
          お子さんが言った言葉をそのまま入れてみてください。考えられる気持ちと、親としての返し方の例を確認できます。
        </div>
      </div>

      {/* kotobaの結果は「みんなの相談」に匿名で自動公開されるようになったため（2026-11-07）、
          /askの入力欄上にある注意書きと同じ内容を、入力前に必ず目に入る位置に表示する。 */}
      <div className="privacy-notice">
        <span className="privacy-notice-icon">⚠️</span>
        <span>
          入力した言葉と結果は、匿名のまま「みんなの相談」に自動で公開されます。お名前・住所・学校名など個人を特定できる情報は書かないでください。
        </span>
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
        {/* 専門家・経験者への導線強化（2026-11-07追加）。/askの同名チェックと同じ役割。
            本人確認済みの専門家・経験者が1人もいない間は表示しない。 */}
        {expertAvailable && (
          <label className="card" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wantExpert}
              onChange={(e) => setWantExpert(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              <span style={{ fontWeight: 700 }}>専門家・経験者にも見てもらう（無料）</span>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                登録している専門家・経験者がこの内容を見て、テキストで回答を追加してくれることがあります。回答を読むには会員登録が必要です。
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                <a href="/experts">どんな専門家が回答していますか？</a>
              </div>
            </span>
          </label>
        )}
        {error && <div style={{ color: 'var(--seal-text)', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={analyze} disabled={loading}>
          {loading ? '気持ちを読んでいます…' : '気持ちを読んでみる'}
        </button>
      </div>

      {result && !result.is_crisis && result.is_fallback && (
        <div ref={resultRef} style={{ scrollMarginTop: 16 }}>
          <div className="card" style={{ alignItems: 'flex-start', gap: 8, marginTop: 10 }}>
            <div className="qtext-main">この言葉だけでは、まだ読み取れませんでした</div>
            <div className="muted" style={{ fontSize: 13 }}>
              もう少し具体的に（いつ言ったか、どんな様子だったか）教えていただけると、より詳しい相談ができます。
            </div>
          </div>
          <div className="card home-gakko-link" style={{ alignItems: 'stretch', gap: 8, margin: '10px 0', border: '2px solid var(--main)', background: 'var(--sub)' }}>
            <Link
              href={`/ask?prefill=${encodeURIComponent(`子どもが「${input.trim()}」と言いました。`)}${wantExpert ? '&expert=1' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'var(--main)' }}>どうする先生に相談する</span>
                <span style={{ display: 'block', fontSize: 12 }}>状況を詳しく書いて相談すると、もっと具体的なアドバイスが受けられます</span>
              </span>
              <span style={{ color: 'var(--main)', fontWeight: 700 }}>›</span>
            </Link>
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={reset}>別の言葉を入れてみる</button>
        </div>
      )}

      {result && !result.is_crisis && !result.is_fallback && result.interpretations?.length > 0 && (
        <div ref={resultRef} style={{ scrollMarginTop: 16 }}>
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
                <div className="qtext muted">{interp.response_avoid}</div>
              </div>
            </div>
          ))}
          {/* 入力時点で「みんなの相談」に自動公開済み（上の注意書き参照）のため、公開済みの
              その投稿をそのまま見られるようにするリンク（2026-11-07追加）。 */}
          {result.consultation_id && (
            <Link
              href={`/result/${result.consultation_id}`}
              className="muted"
              style={{ fontSize: 12, textDecoration: 'underline', display: 'block', margin: '0 0 4px' }}
            >
              この結果は「みんなの相談」に公開されました。投稿を見る ›
            </Link>
          )}
          {/* 専門家チェックをONにして送った場合、公開した投稿がそのまま回答待ちキューに
              乗っていることを伝える（2026-11-07追加）。 */}
          {result.consultation_id && wantExpert && (
            <div className="muted" style={{ fontSize: 12, margin: '0 0 10px' }}>
              専門家・経験者からの回答もお待ちください。届いた回答は上のリンクから確認できます（会員登録が必要です）。
            </div>
          )}
          <div className="card home-gakko-link" style={{ alignItems: 'stretch', gap: 8, margin: '0 0 10px', border: '2px solid var(--main)', background: 'var(--sub)' }}>
            <Link
              href={`/ask?prefill=${encodeURIComponent(`子どもが「${input.trim()}」と言いました。`)}${wantExpert ? '&expert=1' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'var(--main)' }}>この状況、もっと詳しく相談したい方へ</span>
                <span style={{ display: 'block', fontSize: 12 }}>どうする先生に相談する（状況を書き足して送れます）</span>
              </span>
              <span style={{ color: 'var(--main)', fontWeight: 700 }}>›</span>
            </Link>
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={reset}>別の言葉を入れてみる</button>
        </div>
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
