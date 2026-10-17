'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { Child } from '@/lib/types';
import { getUid } from '@/lib/uid';
import CommentReportButton from '@/components/CommentReportButton';

type QuestionChoice = { value: string; label: string };
type Question = { slug: string; text: string; choices: QuestionChoice[] };
type Aggregate = { total: number; counts: Record<string, number> };
type DailyComment = { id: string; value: string; comment: string; label: string; createdAt: string };
type HistoryQuestion = {
  slug: string;
  text: string;
  choices: QuestionChoice[];
  myAnswer: string | null;
  aggregate: Aggregate | null;
};

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
// 普段表示されるのは質問バンク19問のうち今日の1問だけだが、「過去の質問データも
// 見れるといい」との要望を受けて、ページ下部に全問＋累計集計の一覧（折りたたみ式）も
// 出している（2026-10-17、/api/daily-question/history参照）。
// 回答するときに任意でひとことコメントを添えられ、他の人のコメントも見られる
// （2026-10-17追加。「同じように悩んでいる人がいるんだと実感できるように」との
// 要望）。コメントは集計グラフと同じく会員登録して回答した後にしか見られない。
// 対応範囲は今のところ「今日の質問」カードのみで、下部の過去の質問一覧には
// まだコメント機能を付けていない。
export default function TodayPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [date, setDate] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [comments, setComments] = useState<DailyComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // 過去の質問一覧（2026-10-17追加）。「過去の質問データも見れるといい」との要望を
  // 受けて、質問バンク全19問のうちすでに出た質問の累計集計を/api/daily-question/history
  // から取得する。各質問に「自分がすでに回答しているか（myAnswer）」も含まれるため、
  // 「過去の質問にも同じように回答を促したい」との要望を受けて（2026-10-17）、
  // selectedChildIdが変わるたびに取り直す（今日の質問カードと同じスコープで判定する）。
  const [history, setHistory] = useState<HistoryQuestion[] | null>(null);
  const [historySubmitting, setHistorySubmitting] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    fetch('/api/children')
      .then((r) => r.json())
      .then((d) => setChildrenList(d.children || []))
      .catch(() => setChildrenList([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedChildId) params.set('child_id', selectedChildId);
    params.set('uid', getUid());
    fetch(`/api/daily-question/history?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.questions || []))
      .catch(() => setHistory(null));
  }, [selectedChildId]);

  // 兄弟（複数の子どもプロフィール）がいる場合、それぞれ別に1日1回答えられるように
  // する（2026-10-16、「1人分答えたらもう1人の分が答えられない」不具合の修正）。
  // 選んでいる子ども（全体/子どもA/子どもB…）が変わるたびに、そのスコープの
  // 質問・回答状況を取り直す（子ども切り替えは会員限定なので、未ログインでは
  // selectedChildIdは常に空のまま）。
  useEffect(() => {
    let cancelled = false;
    setMyAnswer(null);
    setAggregate(null);
    setComments([]);
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
        setComments(d.comments || []);
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
        body: JSON.stringify({
          value,
          child_id: selectedChildId || null,
          uid: getUid(),
          comment: commentInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      setMyAnswer(data.myAnswer);
      setAggregate(data.aggregate);
      setComments(data.comments || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  }

  // 過去の質問一覧からの回答（2026-10-17追加）。「過去の質問にも同じように回答を
  // 促したい、同じ見せ方で掲載しておくのがいい」との要望を受けて、今日の質問カードの
  // answer()と同じ内容をslug付きでPOSTする。回答後はその質問だけhistory配列内で
  // 差し替える（一覧全体を再取得しない）。
  async function answerHistoryQuestion(slug: string, value: string) {
    if (historySubmitting) return;
    setHistorySubmitting(slug);
    setHistoryError('');
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, slug, child_id: selectedChildId || null, uid: getUid() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      setHistory((prev) =>
        prev
          ? prev.map((q) => (q.slug === slug ? { ...q, myAnswer: data.myAnswer, aggregate: data.aggregate } : q))
          : prev
      );
    } catch (e: unknown) {
      setHistoryError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setHistorySubmitting(null);
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
                <>
                  {/* 任意コメント（2026-10-17追加）。「同じように悩んでいる人がいるんだと
                      実感できるように」との要望を受けて、回答と一緒に一言添えられるように
                      した。未入力でも回答自体はできる（任意）。 */}
                  <textarea
                    className="input"
                    style={{ width: '100%', minHeight: 56, fontSize: 13 }}
                    placeholder="ひとこと添える（任意）"
                    maxLength={150}
                    value={commentInput}
                    disabled={submitting}
                    onChange={(e) => setCommentInput(e.target.value)}
                  />
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
                </>
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

                      {/* みんなの声（任意コメント、2026-10-17追加）。集計グラフと同じく
                          会員登録して回答した後にしか見せない。表示名は個人を特定できない
                          範囲（「◯年生の保護者」「保護者」「匿名」）にとどめる
                          （/api/daily-question/route.tsのbuildComments参照）。自由記述は
                          モデレーション手段が無いとリスクが高いため、通報ボタンを
                          最初から付けている。 */}
                      {comments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                          <div className="muted" style={{ fontSize: 12 }}>みんなの声（任意コメント）</div>
                          {comments.map((cm) => (
                            <div
                              key={cm.id}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                background: 'var(--bg)',
                                borderRadius: 8,
                                padding: '8px 10px',
                              }}
                            >
                              <div className="muted" style={{ fontSize: 11 }}>{cm.label}</div>
                              <div className="qtext" style={{ fontSize: 13 }}>{cm.comment}</div>
                              <div style={{ alignSelf: 'flex-end' }}>
                                <CommentReportButton id={cm.id} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

          {/* 過去の質問一覧（2026-10-17追加）。普段表示される質問は19問ローテーションの
              うち今日の1問だけだが、「過去の質問データも見れるといい」との要望を受けて、
              折りたたみ式（<details>）で過去に見られるようにした。一覧に出すのは
              「すでに出た質問（＝1件でも回答が付いている質問）」だけで、まだローテー
              ションに出ていない質問は含めない（2026-10-17、/api/daily-question/history
              側で絞り込み済み）。会員登録していない場合は、1問ずつぼかすのではなく、
              まとめて1つの案内文だけを出す。 */}
          {history && history.length > 0 && (
            <details className="card" style={{ padding: 0 }}>
              <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                過去の質問一覧を見る（{history.length}問）
              </summary>
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!loggedIn && (
                  <div className="qtext" style={{ paddingTop: 4 }}>
                    会員登録（無料）すると、質問ごとの累計の集計グラフが見られます。
                    <Link href="/account/login?next=/today" style={{ color: 'var(--main)', fontWeight: 700, textDecoration: 'underline', marginLeft: 4 }}>
                      ログイン / 無料登録
                    </Link>
                  </div>
                )}
                {history.map((q) => (
                  <div key={q.slug} style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div className="qtext" style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{q.text}</div>
                    {q.myAnswer === null ? (
                      // 未回答（2026-10-17追加）。「過去の質問にも同じように回答を促したい、
                      // 同じ見せ方で掲載しておくのがいい」との要望を受けて、今日の質問カードと
                      // 同じgenderrow/genderbtnの選択肢ボタンをそのまま出す。
                      <div className="genderrow">
                        {q.choices.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            className="genderbtn"
                            disabled={historySubmitting === q.slug}
                            onClick={() => answerHistoryQuestion(q.slug, c.value)}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    ) : q.aggregate ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="muted" style={{ fontSize: 11 }}>これまでの回答：{q.aggregate.total}件</div>
                        {q.choices.map((c) => {
                          const count = q.aggregate!.counts[c.value] || 0;
                          const pct = q.aggregate!.total > 0 ? Math.round((count / q.aggregate!.total) * 100) : 0;
                          return (
                            <div key={c.value} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ fontWeight: c.value === q.myAnswer ? 700 : 400 }}>{c.label}</span>
                                <span className="muted">{count}件（{pct}%）</span>
                              </div>
                              <div style={{ background: 'var(--border)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${pct}%`,
                                    height: '100%',
                                    background: c.value === q.myAnswer ? 'var(--main)' : 'var(--sub)',
                                    borderRadius: 6,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // 未ログインで回答済みの場合：今日の質問カードと同じ、ぼかした集計見本を
                      // 出す（2026-10-17、「過去の一覧もぼかし入れて同じような見せ方して
                      // ほしい」との要望を受けて、テキストのみの表示から変更）。
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                        <div className="muted" style={{ fontSize: 11 }}>これまでの回答：ー件</div>
                        {q.choices.map((c, i) => (
                          <div
                            key={c.value}
                            style={{ display: 'flex', flexDirection: 'column', gap: 2, filter: 'blur(5px)', userSelect: 'none' }}
                            aria-hidden="true"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                              <span>{c.label}</span>
                              <span className="muted">ーー件（ーー%）</span>
                            </div>
                            <div style={{ background: 'var(--border)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
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
                    )}
                  </div>
                ))}
                {historyError && <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>{historyError}</div>}
              </div>
            </details>
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
