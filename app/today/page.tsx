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
  myComment: string | null;
  aggregate: Aggregate | null;
  comments: DailyComment[];
};

// 「みんなのデータ」ページ（2026-10-16追加）。AIの回答でよく出る「気づいたときにメモ
// しておく」というアドバイスを、実際にサービス内でできるようにした機能。自由記述では
// なく選択式の日替わりアンケートで、回答すると同じ質問を選んだ全員分の集計グラフが
// 見られる（個別の回答は非公開、見られるのは本人と集計のみ）。
// 集計は「今日の回答だけ」ではなく、同じ質問がこれまでに出た分も全部合わせた累計
// （2026-10-17、「今日だけだと全然データが取れない」との指摘を受けて変更。質問は
// 19問のローテーションで、同じ質問が次に出るのは約19日後になるため）。
// 回答は/ask（匿名相談）と同じブラウザ単位の匿名ID（getUid()）があれば会員登録なしでも
// できる。集計グラフ（本物の数字）を見られる条件は「その質問に回答済みであること」で、
// 会員登録は問わない（2026-10-17、「ログインしなくても回答したら見れるようになると
// いい」との指摘を受けて変更。この機能の狙いである「同じように悩んでいる人がいると
// 実感できる」こととの矛盾を解消するため。2026-10-16時点では一度「会員登録しないと
// 見れない」設計にしていたが、今回これを「回答済みであること」に緩和した）。
// 普段表示されるのは質問バンク19問のうち今日の1問だけだが、「過去の質問データも
// 見れるといい」との要望を受けて、ページ下部に全問＋累計集計の一覧（折りたたみ式）も
// 出している（2026-10-17、/api/daily-question/history参照）。
// 回答するときに任意でひとことコメントを添えられ、他の人のコメントも見られる
// （2026-10-17追加。「同じように悩んでいる人がいるんだと実感できるように」との
// 要望）。コメントも集計グラフと同じく、その質問に回答した後なら誰でも見られる。
// 下部の過去の質問一覧にも、回答済みの質問への後からのコメント追加・編集機能を
// 追加した（2026-10-17追加。「過去の質問も後からコメント入れられるようにして
// おきたい」との要望）。
export default function TodayPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [date, setDate] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [myComment, setMyComment] = useState<string | null>(null);
  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [comments, setComments] = useState<DailyComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  // 回答済みの質問に対して、後からコメントを追加・編集するための入力欄
  // （2026-10-17追加。下のcommentInputは「まだ回答していないとき」専用）。
  // 「投稿したコメントが書く欄にそのまま残ってる」との指摘を受けて、保存済みの
  // コメントは普段はテキストとして表示するだけにし、入力欄は「編集する」を押した
  // ときだけ出す（editingComment）ようにした。保存が終わったら入力欄を閉じる。
  const [commentDraft, setCommentDraft] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);
  const [editingComment, setEditingComment] = useState(false);
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
  // 過去の質問一覧の、各質問ごとのコメント編集状態（2026-10-17追加）。今日の質問
  // カードのeditingComment/commentDraftと同じ考え方だが、質問が複数あるためslugを
  // キーにしたマップで持つ。
  const [historyEditingSlug, setHistoryEditingSlug] = useState<string | null>(null);
  const [historyCommentDraft, setHistoryCommentDraft] = useState('');
  const [historyCommentSaving, setHistoryCommentSaving] = useState<string | null>(null);

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
    setMyComment(null);
    setAggregate(null);
    setComments([]);
    setEditingComment(false);
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
        setMyComment(d.myComment || null);
        setCommentDraft(d.myComment || '');
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
      setMyComment(data.myComment || null);
      setCommentDraft(data.myComment || '');
      setCommentInput('');
      setEditingComment(false);
      setAggregate(data.aggregate);
      setComments(data.comments || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  }

  // すでに回答済みの質問に、後からコメントを追加・編集する（2026-10-17追加）。
  // 「コメント入れられないよー」との指摘を受けて対応：コメント入力欄は最初に回答する
  // ときしか出ない設計だったため、すでに回答済みの人（＝大半のユーザー）がコメントを
  // 入れる手段が無かった。回答内容（value）は変えず、同じ値で上書き保存することで
  // コメントだけを更新する（POST側のupsertの仕組みをそのまま利用）。
  async function saveComment() {
    if (!myAnswer || commentSaving) return;
    setCommentSaving(true);
    setError('');
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: myAnswer,
          child_id: selectedChildId || null,
          uid: getUid(),
          comment: commentDraft.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      setMyComment(data.myComment || null);
      setCommentDraft(data.myComment || '');
      setEditingComment(false);
      setAggregate(data.aggregate);
      setComments(data.comments || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setCommentSaving(false);
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

  // 過去の質問一覧で、すでに回答済みの質問に後からコメントを追加・編集する
  // （2026-10-17追加。「過去の質問も後からコメント入れられるようにしておきたい」
  // との要望）。今日の質問カードのsaveComment()と同じく、回答内容（value）は
  // そのまま保持し、コメントだけを上書き保存する。
  async function saveHistoryComment(slug: string, value: string) {
    if (historyCommentSaving) return;
    setHistoryCommentSaving(slug);
    setHistoryError('');
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value,
          slug,
          child_id: selectedChildId || null,
          uid: getUid(),
          comment: historyCommentDraft.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      setHistory((prev) =>
        prev
          ? prev.map((q) =>
              q.slug === slug
                ? { ...q, myAnswer: data.myAnswer, myComment: data.myComment || null, aggregate: data.aggregate, comments: data.comments || [] }
                : q
            )
          : prev
      );
      setHistoryEditingSlug(null);
    } catch (e: unknown) {
      setHistoryError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setHistoryCommentSaving(null);
    }
  }

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h2 className="pagetitle">みんなのデータ</h2>
          <div className="muted" style={{ marginBottom: 12 }}>
            毎日かわる簡単な質問に答えるだけの、選択式アンケートです。回答は会員登録なしでもできます。あなたの回答は非公開ですが、回答すると「この質問に、みんなはどう答えているか」の累計の集計グラフが見られます。
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

                  {/* 回答済みの質問へのコメント追加・編集（2026-10-17追加）。最初の回答時に
                      コメント欄が出るのは「まだ回答していないとき」だけなので、すでに
                      回答済みの人にも同じようにコメントを入れられるようにしている。
                      「投稿したコメントが書く欄にそのまま残ってる」との指摘を受けて、
                      普段は保存済みのコメントをテキストで表示するだけにし、入力欄は
                      「編集する」を押したときだけ出す。保存が終わったら自動で閉じる。 */}
                  {editingComment ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                      <textarea
                        className="input"
                        style={{ width: '100%', minHeight: 56, fontSize: 13 }}
                        placeholder="ひとこと添える（任意）"
                        maxLength={150}
                        value={commentDraft}
                        disabled={commentSaving}
                        autoFocus
                        onChange={(e) => setCommentDraft(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={commentSaving}
                          onClick={() => {
                            setCommentDraft(myComment || '');
                            setEditingComment(false);
                          }}
                        >
                          キャンセル
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={commentSaving || commentDraft.trim() === (myComment || '')}
                          onClick={saveComment}
                        >
                          {commentSaving ? '保存中…' : '保存する'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                      {myComment && (
                        <div className="qtext" style={{ fontSize: 13, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
                          {myComment}
                        </div>
                      )}
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ alignSelf: 'flex-start', fontSize: 12 }}
                        onClick={() => {
                          setCommentDraft(myComment || '');
                          setEditingComment(true);
                        }}
                      >
                        {myComment ? 'コメントを編集する' : 'ひとこと添える（任意）'}
                      </button>
                    </div>
                  )}

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
                          回答した後なら誰でも見られる（会員登録は問わない）。表示名は個人を特定できない
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
                    // 通常は回答済みなら必ずaggregateが返るはずだが、通信エラー等の
                    // 想定外のケース向けの簡易フォールバック（2026-10-17、閲覧条件を
                    // 「会員登録」から「回答済みであること」に変更したのにあわせて、
                    // 以前あった会員登録誘導は不要になったため削除）。
                    <div className="muted" style={{ fontSize: 12 }}>集計を取得できませんでした。時間をおいて開き直してみてください。</div>
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
              側で絞り込み済み）。質問ごとの集計を見る条件は「回答済みであること」
              （会員登録は問わない。2026-10-17、今日の質問カードと同じ変更）。 */}
          {history && history.length > 0 && (
            <details className="card" style={{ padding: 0 }}>
              <summary style={{ padding: 16, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                過去の質問一覧を見る（{history.length}問）
              </summary>
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                        {/* 過去の質問へのコメント追加・編集（2026-10-17追加）。今日の質問
                            カードと同じ、通常はテキスト表示＋「編集する」ボタン、押したときだけ
                            入力欄を出す方式。 */}
                        {historyEditingSlug === q.slug ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 4 }}>
                            <textarea
                              className="input"
                              style={{ width: '100%', minHeight: 48, fontSize: 12 }}
                              placeholder="ひとこと添える（任意）"
                              maxLength={150}
                              value={historyCommentDraft}
                              disabled={historyCommentSaving === q.slug}
                              autoFocus
                              onChange={(e) => setHistoryCommentDraft(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ fontSize: 11 }}
                                disabled={historyCommentSaving === q.slug}
                                onClick={() => setHistoryEditingSlug(null)}
                              >
                                キャンセル
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ fontSize: 11 }}
                                disabled={historyCommentSaving === q.slug || historyCommentDraft.trim() === (q.myComment || '')}
                                onClick={() => saveHistoryComment(q.slug, q.myAnswer as string)}
                              >
                                {historyCommentSaving === q.slug ? '保存中…' : '保存する'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', marginTop: 4 }}>
                            {q.myComment && (
                              <div className="qtext" style={{ fontSize: 12, background: 'var(--bg)', borderRadius: 8, padding: '6px 8px' }}>
                                {q.myComment}
                              </div>
                            )}
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ alignSelf: 'flex-start', fontSize: 11 }}
                              onClick={() => {
                                setHistoryCommentDraft(q.myComment || '');
                                setHistoryEditingSlug(q.slug);
                              }}
                            >
                              {q.myComment ? 'コメントを編集する' : 'ひとこと添える（任意）'}
                            </button>
                          </div>
                        )}

                        {q.comments.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                            <div className="muted" style={{ fontSize: 11 }}>みんなの声（任意コメント）</div>
                            {q.comments.map((cm) => (
                              <div
                                key={cm.id}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 3,
                                  background: 'var(--bg)',
                                  borderRadius: 8,
                                  padding: '6px 8px',
                                }}
                              >
                                <div className="muted" style={{ fontSize: 10 }}>{cm.label}</div>
                                <div className="qtext" style={{ fontSize: 12 }}>{cm.comment}</div>
                                <div style={{ alignSelf: 'flex-end' }}>
                                  <CommentReportButton id={cm.id} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // 通常は回答済みなら必ずaggregateが返るはずだが、想定外のケース向けの
                      // 簡易フォールバック（2026-10-17、閲覧条件を「会員登録」から「回答済み
                      // であること」に変更したのにあわせて、以前あったぼかし表示は削除）。
                      <div className="muted" style={{ fontSize: 11 }}>集計を取得できませんでした。</div>
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
