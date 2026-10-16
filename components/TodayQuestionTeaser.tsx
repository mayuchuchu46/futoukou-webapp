'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type QuestionChoice = { value: string; label: string };
type Question = { slug: string; text: string; choices: QuestionChoice[] };

// TOPページ（ホーム）に出す「みんなのデータ」の誘導カード（2026-10-16追加）。
// 横1行のコンパクトなバナー（.expertbanner流用）にしていたが、「すぐに回答選択
// できるようにしたい」との要望を受けて、ログイン済み・未回答の場合だけその場で
// 選べるチップボタンを出す形に変更。以前の.genderbtn（縦に大きい）ではなく
// .chip（横並びの小さいピル型ボタン）を使い、高さを取りすぎないようにしている。
// 未ログイン・回答済みの場合は、引き続き横1行バナーのまま/todayへ誘導する。
export default function TodayQuestionTeaser() {
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

  if (!question) return null;

  const questionLabel = question.text.length > 30 ? `${question.text.slice(0, 30)}…` : question.text;

  // ログイン済み・未回答の場合だけ、その場で選べるチップボタンを出す。
  if (loggedIn && !myAnswer) {
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
              onClick={() => answer(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 未ログイン・回答済みの場合は、横1行のコンパクトなバナーで/todayに誘導する。
  const statusText = loggedIn === false ? 'ログイン・無料登録して回答する' : '回答済み・今日の集計を見る';

  return (
    <Link href="/today" className="expertbanner expertbanner-today">
      <img src="/assets/icon_comment.png" alt="" className="expertbanner-icon" />
      <div className="expertbanner-body">
        <div className="expertbanner-title">{questionLabel}</div>
        <div className="expertbanner-desc">{statusText}</div>
      </div>
      {/* 実際の集計ではなく、横1行の高さに収まるミニ棒グラフの見本（ぼかし）。
          本物のグラフは引き続き/todayで、答えた人だけに見せる。myAnswer済みの
          自分の行だけでも実データを出したくなるが、ここは導線用の枠として
          あえて共通の見本のままにしている（一貫性のため）。 */}
      <div className="expertbanner-today-graph" aria-hidden="true">
        <span style={{ height: '45%' }} />
        <span style={{ height: '85%', background: 'var(--main)' }} />
        <span style={{ height: '60%' }} />
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
