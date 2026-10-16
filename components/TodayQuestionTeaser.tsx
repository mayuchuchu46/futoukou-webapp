'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Question = { slug: string; text: string };

// TOPページ（ホーム）に出す「みんなのデータ」の誘導カード（2026-10-16追加）。
// 「今日の質問」のような見た目で目に入りやすくし、/todayへの導線を強める狙い
// （「TOPでも表示したい、誘導しやすくしたい」との要望を受けて追加）。
// 最初は質問に直接回答できる作りにしていたが、スマホで縦に高さを取りすぎる
// との指摘を受け、.expertbannerと同じ横1行のコンパクトな誘導バナーに変更
// （2026-10-16）。実際の回答・結果グラフ表示は引き続き/todayが担当する。
export default function TodayQuestionTeaser() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);

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

  if (!question) return null;

  const statusText =
    loggedIn === false
      ? 'ログイン・無料登録して回答する'
      : myAnswer
        ? '回答済み・今日の集計を見る'
        : '今日の質問に答える';

  const questionLabel = question.text.length > 26 ? `${question.text.slice(0, 26)}…` : question.text;

  return (
    <Link href="/today" className="expertbanner expertbanner-today">
      <img src="/assets/icon_comment.png" alt="" className="expertbanner-icon" />
      <div className="expertbanner-body">
        <div className="expertbanner-title">みんなのデータ：{questionLabel}</div>
        <div className="expertbanner-desc">{statusText}</div>
      </div>
      {/* 「ぼかしグラフも小さく出したい」との要望を受けて追加（2026-10-16）。
          実際の集計ではなく、横1行の高さに収まるミニ棒グラフの見本（ぼかし）。
          本物のグラフは引き続き/todayで、答えた人だけに見せる。 */}
      <div className="expertbanner-today-graph" aria-hidden="true">
        <span style={{ height: '45%' }} />
        <span style={{ height: '85%', background: 'var(--main)' }} />
        <span style={{ height: '60%' }} />
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
