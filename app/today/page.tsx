'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { Child } from '@/lib/types';

type QuestionChoice = { value: string; label: string };
type Question = { slug: string; text: string; choices: QuestionChoice[] };
type Aggregate = { total: number; counts: Record<string, number> };

// 「みんなのデータ」ページ（2026-10-16追加）。AIの回答でよく出る「気づいたときにメモ
// しておく」というアドバイスを、実際にサービス内でできるようにした会員限定機能。
// 自由記述ではなく選択式の日替わりアンケートで、回答すると同日の全員の回答を
// 集計したグラフが見られる（個別の回答は非公開、見られるのは本人と集計のみ）。
export default function TodayPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [date, setDate] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/children')
      .then((r) => r.json())
      .then((d) => setChildrenList(d.children || []))
      .catch(() => setChildrenList([]));
  }, []);

  // 兄弟（複数の子どもプロフィール）がいる場合、それぞれ別に1日1回答えられるように
  // する（2026-10-16、「1人分答えたらもう1人の分が答えられない」不具合の修正）。
  // 選んでいる子ども（全体/子どもA/子どもB…）が変わるたびに、そのスコープの
  // 質問・回答状況を取り直す。
  useEffect(() => {
    let cancelled = false;
    setMyAnswer(null);
    setAggregate(null);
    const qs = selectedChildId ? `?child_id=${encodeURIComponent(selectedChildId)}` : '';
    fetch(`/api/daily-question${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setLoggedIn(!!d.loggedIn);
        setDate(d.date);
        setQuestion(d.question);
        setMyAnswer(d.myAnswer);
        setAggregate(d.aggregate);
      })
      .catch(() => {
        if (!cancelled) setLoggedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedChildId]);

  async function answer(value: string) {
    if (submitting || myAnswer) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, child_id: selectedChildId || null }),
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

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h2 className="pagetitle">みんなのデータ</h2>
          <div className="muted" style={{ marginBottom: 12 }}>
            毎日かわる簡単な質問に答えるだけの、選択式アンケートです。あなたの回答は非公開ですが、答えると「今日、みんなはどう答えているか」の集計が見られます。
          </div>

          {/* 未ログイン時も、質問自体は見せて「どんな機能か」が伝わるようにする（2026-10-16、
              「質問は出して、アンケート結果をぼかして会員登録に誘導したい」との要望を受けて
              変更）。選択肢ボタンは押せない見本として表示し、結果グラフは実際の集計では
              なくぼかした見本（本物のデータは答えた会員だけに見せる、という設計は維持）。
              回答・結果閲覧には引き続き会員登録が必要。 */}
          {loggedIn === false && question && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="muted" style={{ fontSize: 12 }}>{date}の質問</div>
              <div className="answer-label" style={{ fontSize: 15 }}>{question.text}</div>

              <div className="genderrow" style={{ opacity: 0.5, pointerEvents: 'none' }} aria-hidden="true">
                {question.choices.map((c) => (
                  <button key={c.value} type="button" className="genderbtn" disabled>
                    {c.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
                <div className="muted" style={{ fontSize: 12 }}>今日の回答：ー件</div>
                {question.choices.map((c, i) => (
                  <div
                    key={c.value}
                    style={{ display: 'flex', flexDirection: 'column', gap: 3, filter: 'blur(5px)', userSelect: 'none' }}
                    aria-hidden="true"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span>{c.label}</span>
                      <span className="muted">ーー件（ーー%）</span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${35 + ((i * 23) % 50)}%`,
                          height: '100%',
                          background: 'var(--sub)',
                          borderRadius: 6,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="qtext">ログイン・無料登録すると、この質問に回答して、今日みんながどう答えているかの集計グラフを見られます。</div>
              <Link className="btn-primary" href="/account/login?next=/today">
                ログイン / 無料登録
              </Link>
            </div>
          )}

          {loggedIn === null && <div className="muted">読み込み中…</div>}

          {loggedIn && question && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="muted" style={{ fontSize: 12 }}>{date}の質問</div>
              <div className="answer-label" style={{ fontSize: 15 }}>{question.text}</div>

              {/* 以前は「まだ回答していない時だけ」表示していたが、それだと兄弟がいる場合に
                  1人分答えた時点で切り替えタブごと消えてしまい、もう1人の分に切り替えられ
                  なくなっていた（2026-10-16、不具合修正）。答えた後も切り替えられるよう、
                  常に表示する。 */}
              {childrenList.length > 0 && (
                <div className="chip-row chip-row-wrap">
                  <button
                    type="button"
                    className={`chip chip-tag${selectedChildId === '' ? ' active' : ''}`}
                    onClick={() => setSelectedChildId('')}
                  >
                    全体
                  </button>
                  {childrenList.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`chip chip-tag${selectedChildId === c.id ? ' active' : ''}`}
                      onClick={() => setSelectedChildId(c.id)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {!myAnswer ? (
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
              ) : (
                <>
                  <div className="qtext" style={{ fontSize: 13 }}>
                    あなたの回答：<strong>{question.choices.find((c) => c.value === myAnswer)?.label || myAnswer}</strong>
                  </div>

                  {aggregate && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
                      <div className="muted" style={{ fontSize: 12 }}>今日の回答：{aggregate.total}件</div>
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
                </>
              )}

              {error && <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>{error}</div>}
            </div>
          )}

          {loggedIn && (
            <Link href="/notebook" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>伴走ノートを見る</span>
              <span className="muted">›</span>
            </Link>
          )}
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
