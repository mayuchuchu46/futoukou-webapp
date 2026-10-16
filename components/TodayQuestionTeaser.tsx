'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type QuestionChoice = { value: string; label: string };
type Question = { slug: string; text: string; choices: QuestionChoice[] };

// TOPページ（ホーム）に出す「みんなのデータ」の誘導カード（2026-10-16追加）。
// 未ログインでも、質問と選べそうな選択肢チップを見せることで「押したくなる」
// 状態を作り、実際に押すとログイン・無料登録へ誘導する設計にしている
// （「ログインしてなくても回答押したくなるような設計にしたい」との要望を
// 受けて変更。以前はログイン済みの時だけチップを出し、未ログイン時は
// 「ログインしてください」という横1行バナーだけだったが、それだと
// 「自分も答えたい」という気持ちを作れていなかった）。
// 答え終わった（myAnswerがある）場合だけ、横1行のコンパクトなバナー
// （.expertbanner流用）で/todayの結果グラフへ誘導する。
export default function TodayQuestionTeaser() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/daily-question')
      .then((r) => r.json())
      .then((d) => {
        setLoggedIn(!!d.loggedIn);
        setQuestion(d.question);
        setMyAnswer(d.myAnswer);
      })
      .catch(() => setLoggedIn(false));
  }, []);

  async function answer(value: string) {
    if (submitting || myAnswer) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, child_id: null }),
      });
      const data = await res.json();
      if (res.ok) {
        setMyAnswer(data.myAnswer);
      }
    } catch {
      // TOPの小さい誘導枠でのエラー表示は煩雑になるため、失敗時は黙って何もしない
      // （/todayに行けば改めて答えられる）。
    } finally {
      setSubmitting(false);
    }
  }

  function handleChoiceClick(value: string) {
    if (loggedIn) {
      answer(value);
    } else {
      // 未ログインで選択肢をタップした＝回答する意思があるということなので、
      // 「どうする先生とは」等を挟まず、ログイン・無料登録に直接誘導する。
      router.push('/account/login?next=/today');
    }
  }

  if (!question || loggedIn === null) return null;

  const questionLabel = question.text.length > 30 ? `${question.text.slice(0, 30)}…` : question.text;

  // まだ回答していない場合（未ログイン・ログイン済みどちらも）、その場で選べそうな
  // チップボタンを見せる。未ログインの場合は押すとログインへ誘導される。
  if (!myAnswer) {
    return (
      <div className="card" style={{ gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/assets/icon_comment.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          <div className="qtext" style={{ fontWeight: 700, fontSize: 13 }}>{questionLabel}</div>
        </div>
        <div className="chip-row chip-row-wrap">
          {question.choices.map((c) => (
            <button
              key={c.value}
              type="button"
              className="chip chip-tag"
              disabled={submitting}
              onClick={() => handleChoiceClick(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {!loggedIn && (
          <div className="muted" style={{ fontSize: 11 }}>
            回答するには、ログイン・無料登録が必要です
          </div>
        )}
      </div>
    );
  }

  // 回答済みの場合は、横1行のコンパクトなバナーで/todayの結果グラフへ誘導する。
  return (
    <Link href="/today" className="expertbanner expertbanner-today">
      <img src="/assets/icon_comment.png" alt="" className="expertbanner-icon" />
      <div className="expertbanner-body">
        <div className="expertbanner-title">{questionLabel}</div>
        <div className="expertbanner-desc">回答済み・今日の集計を見る</div>
      </div>
      {/* 実際の集計ではなく、横1行の高さに収まるミニ棒グラフの見本（ぼかし）。
          本物のグラフは引き続き/todayで見られる。 */}
      <div className="expertbanner-today-graph" aria-hidden="true">
        <span style={{ height: '45%' }} />
        <span style={{ height: '85%', background: 'var(--main)' }} />
        <span style={{ height: '60%' }} />
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
