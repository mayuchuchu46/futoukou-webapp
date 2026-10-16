'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type QuestionChoice = { value: string; label: string };
type Question = { slug: string; text: string; choices: QuestionChoice[] };
type Aggregate = { total: number; counts: Record<string, number> };

// TOPページ（ホーム）に出す「みんなのデータ」の誘導カード（2026-10-16追加）。
// 「今日の質問」のような見た目で目に入りやすくし、/todayへの導線を強める狙い
// （「TOPでも表示したい、誘導しやすくしたい」との要望を受けて追加）。
// /todayページと同じ/api/daily-question（「全体」スコープ・child_id未指定）を使う。
// 子どもプロフィールごとの切り替えはここでは行わず、必要ならリンク先の/todayで行う。
export default function TodayQuestionTeaser() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [date, setDate] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/daily-question')
      .then((r) => r.json())
      .then((d) => {
        setLoggedIn(!!d.loggedIn);
        setDate(d.date);
        setQuestion(d.question);
        setMyAnswer(d.myAnswer);
        setAggregate(d.aggregate);
      })
      .catch(() => setLoggedIn(false));
  }, []);

  async function answer(value: string) {
    if (submitting || myAnswer) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, child_id: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      setMyAnswer(data.myAnswer);
      setAggregate(data.aggregate);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  }

  // 質問データの取得が終わるまでは何も出さない（読み込み中の空白を避けるため、
  // ローディング表示もせずスペースを取らない）。
  if (!question) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <img src="/assets/icon_comment.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 0, border: 'none' }} />
        みんなのデータ
        <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>{date}の質問</span>
      </div>
      <div className="qtext" style={{ fontWeight: 700 }}>{question.text}</div>

      {loggedIn && !myAnswer && (
        <div className="genderrow">
          {question.choices.map((c) => (
            <button
              key={c.value}
              type="button"
              className="genderbtn"
              disabled={submitting}
              onClick={() => answer(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {loggedIn && myAnswer && aggregate && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <div className="muted" style={{ fontSize: 12 }}>
            あなたの回答：<strong>{question.choices.find((c) => c.value === myAnswer)?.label || myAnswer}</strong>（今日の回答：{aggregate.total}件）
          </div>
          {question.choices.map((c) => {
            const count = aggregate.counts[c.value] || 0;
            const pct = aggregate.total > 0 ? Math.round((count / aggregate.total) * 100) : 0;
            return (
              <div key={c.value} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ fontWeight: c.value === myAnswer ? 700 : 400 }}>{c.label}</span>
                  <span className="muted">{count}件（{pct}%）</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: c.value === myAnswer ? 'var(--main)' : 'var(--sub)',
                      borderRadius: 6,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 未ログイン時は、/todayと同じ考え方で質問自体は見せ、結果はぼかした見本に
          して会員登録へ誘導する。 */}
      {loggedIn === false && (
        <>
          <div className="genderrow" style={{ opacity: 0.5, pointerEvents: 'none' }} aria-hidden="true">
            {question.choices.map((c) => (
              <button key={c.value} type="button" className="genderbtn" disabled>
                {c.label}
              </button>
            ))}
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', filter: 'blur(5px)', userSelect: 'none' }}
            aria-hidden="true"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>{question.choices[0]?.label}</span>
              <span className="muted">ーー件（ーー%）</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
              <div style={{ width: '58%', height: '100%', background: 'var(--sub)', borderRadius: 6 }} />
            </div>
          </div>
        </>
      )}

      {error && <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>{error}</div>}

      <Link href="/today" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
        {loggedIn ? 'みんなのデータをもっと見る' : 'ログイン・無料登録してみんなのデータを見る'}
      </Link>
    </div>
  );
}
