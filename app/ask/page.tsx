'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { CATS, Category } from '@/lib/categories';
import { getUid, hasAgreedTerms, setAgreedTerms } from '@/lib/uid';

export default function AskPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [needsTerms, setNeedsTerms] = useState(false);

  useEffect(() => {
    setNeedsTerms(!hasAgreedTerms());
  }, []);

  function selectCategory(key: Category) {
    setCategory(key);
    setStep(2);
  }

  async function submit() {
    if (!category || !text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, text, author_id: getUid() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      router.push(`/result/${data.consultation.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  }

  if (needsTerms) {
    return (
      <div className="app-shell">
        <Header supervised={false} />
        <div className="main">
          <div className="card">
            <div style={{ fontWeight: 700 }}>ご利用前の確認</div>
            <div className="qtext">
              このアプリの回答はAIによる一般的な情報提供であり、医療的・心理的な診断ではありません。
              重大な判断の際は、専門機関（学校・医療機関・公的な相談窓口）に相談してください。
              詳しくは利用規約をご確認ください。
            </div>
            <a className="btn-secondary" href="/terms" target="_blank">利用規約を見る</a>
            <button
              className="btn-primary"
              onClick={() => {
                setAgreedTerms();
                setNeedsTerms(false);
              }}
            >
              同意して相談をはじめる
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        {step === 1 && (
          <>
            <div style={{ fontWeight: 700, fontSize: 16 }}>どのテーマに近いですか？</div>
            {Object.entries(CATS).map(([key, c]) => (
              <button
                key={key}
                className="card"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', border: 'none' }}
                onClick={() => selectCategory(key as Category)}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                  <img src={c.icon} style={{ width: 18, height: 18 }} alt="" />
                </div>
                <div style={{ fontWeight: 700 }}>{c.label}</div>
              </button>
            ))}
          </>
        )}

        {step === 2 && category && (
          <>
            <div className={`cat-badge ${CATS[category].cls}`} style={{ alignSelf: 'flex-start' }}>
              {CATS[category].label}
            </div>
            <div style={{ fontWeight: 700 }}>どんなことがありましたか？できるだけ具体的に書いてください。</div>
            <textarea
              className="input"
              rows={8}
              placeholder="例：小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="btn-secondary" onClick={() => setStep(1)}>テーマを選び直す</button>
            <button className="btn-primary" disabled={!text.trim()} onClick={() => setStep(3)}>
              確認する
            </button>
          </>
        )}

        {step === 3 && category && (
          <>
            <div className={`cat-badge ${CATS[category].cls}`} style={{ alignSelf: 'flex-start' }}>
              {CATS[category].label}
            </div>
            <div className="card">
              <div className="muted">相談内容</div>
              <div className="qtext">{text}</div>
            </div>
            {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
            <button className="btn-secondary" onClick={() => setStep(2)} disabled={submitting}>
              内容を直す
            </button>
            <button className="btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? 'どうする先生が考えています…' : 'どうする先生に相談する'}
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
