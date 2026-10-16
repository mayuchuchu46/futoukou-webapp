'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { Child } from '@/lib/types';
import { getUid } from '@/lib/uid';

type QuestionChoice = { value: string; label: string };
type Question = { slug: string; text: string; choices: QuestionChoice[] };
type Aggregate = { total: number; counts: Record<string, number> };

// 「みんなのデータ」ページ（2026-10-16追加）。AIの回答でよく出る「気づいたときにメモ
// しておく」というアドバイスを、実際にサービス内でできるようにした機能。自由記述では
// なく選択式の日替わりアンケートで、回答すると同じ質問を選んだ全員分の集計グラフが
// 見られる（個別の回答は非公開、見られるのは本人と集計のみ）。
// 集計は「今日の回答だけ」ではなく、同じ質問がこれまでに出た分も全部合わせた累計
// （2026-10-17、「今日だけだと全然データが取れない」との指摘を受けて変更。質問は
// 19問のローテーションで、同じ質問が次に出るのは約19日後になるため）。
// 回答は/ask（匿名相談）と同じブラウザ単位の匿名ID（getUid()）があれば会員登録なしでも
// できるが、集計グラフ（本物の数字）は会員登録して初めて見られる（2026-10-16、
// 「回答は会員じゃなくてもできるが、閲覧は会員じゃないと見れない」設計に変更）。
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
  // 質問・回答状況を取り直す（子ども切り替えは会員限定なので、未ログインでは
  // selectedChildIdは常に空のまま）。
  useEffect(() => {
    let cancelled = false;
    setMyAnswer(null);
    setAggregate(null);
    const params = new URLSearchParams();
    if (selectedChildId) params.set('child_id', selectedChildId);
    params.set('uid', getUid());
    fetch(`/api/daily-question?${params.toString()}`)
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
        body: JSON.stringify({ value, child_id: selectedChildId || null, uid: getUid() }),
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
            毎日かわる簡単な質問に答えるだけの、選択式アンケートです。回答は会員登録なしでもできます。あなたの回答は非公開ですが、会員登録すると「この質問に、みんなはどう答えているか」の累計の集計グラフが見られます。
          </div>

          {loggedIn === null && <div className="muted">読み込み中…</div>}

          {loggedIn !== null && question && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
              <div className="muted" style={{ fontSize: 12 }}>{date}の質問</div>
              <div className="answer-label" style={{ fontSize: 15 }}>{question.text}</div>

              {/* 子ども切り替えタブは会員限定（childrenListは未ログインでは常に空）。
                  答えた後も切り替えられるよう、常に表示する（2026-10-16、兄弟の
                  不具合修正時に変更）。 */}
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

                  {aggregate ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
                      <div className="muted" style={{ fontSize: 12 }}>これまでの回答：{aggregate.total}件</div>
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
                  ) : (
                    // 未ログインで回答済みの場合：本物の集計は見せず、ぼかした見本＋
                    // 会員登録への誘導を出す（2026-10-16、「回答は会員じゃなくてもできるが、
                    // 閲覧は会員じゃないと見れない」設計への変更）。
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
                      <div className="muted" style={{ fontSize: 12 }}>これまでの回答：ー件</div>
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
                      <div className="qtext">回答ありがとうございます。会員登録（無料）すると、この質問にみんながどう答えているかの累計の集計グラフを見られます。</div>
                      <Link className="btn-primary" href="/account/login?next=/today">
                        ログイン / 無料登録
                      </Link>
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
