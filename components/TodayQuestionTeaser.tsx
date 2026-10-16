'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUid } from '@/lib/uid';

type QuestionChoice = { value: string; label: string };
type Question = { slug: string; text: string; choices: QuestionChoice[] };

// TOPページ（ホーム）に出す「みんなのデータ」の誘導カード（2026-10-16追加）。
// 回答自体は会員登録なしでもできる（/ask同様、ブラウザ単位の匿名ID＝getUid()を使う）。
// 会員登録が必要なのは「本物の集計グラフを見る」ことだけなので、未ログインで答えた
// 後は、ぼかしのグラフ＋会員登録への誘導を出す（2026-10-16、「回答は会員じゃなくても
// できるが、閲覧は会員じゃないと見れない」設計への変更）。
export default function TodayQuestionTeaser() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/daily-question?uid=${encodeURIComponent(getUid())}`)
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
        body: JSON.stringify({ value, child_id: null, uid: getUid() }),
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

  if (!question || loggedIn === null) return null;

  const questionLabel = question.text.length > 30 ? `${question.text.slice(0, 30)}…` : question.text;

  // まだ回答していない場合（未ログイン・ログイン済みどちらも）、その場で選べそうな
  // チップボタンを見せる。未ログインでも実際にその場で回答できる（会員登録不要）。
  // 未ログインの場合は、テキストでの説明ではなく、質問文と同じ行の右側に
  // ぼかしのミニグラフ（登録すると見られる本物の集計の予告）を添える
  // （2026-10-16、文言を外して視覚的な誘導に変更。高さを増やさないよう、
  // 専用の行ではなく質問文の行に収めた）。
  if (!myAnswer) {
    return (
      <div className="card" style={{ gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/assets/icon_comment.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain', flex: '0 0 auto' }} />
          <div className="qtext" style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{questionLabel}</div>
          {!loggedIn && (
            <div className="expertbanner-today-graph" aria-hidden="true">
              <span style={{ height: '45%' }} />
              <span style={{ height: '85%', background: 'var(--main)' }} />
              <span style={{ height: '60%' }} />
            </div>
          )}
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

  // 回答済みの場合は、横1行のコンパクトなバナーで/todayへ誘導する。会員なら本物の
  // 集計グラフへ、未ログインならぼかしグラフ＋会員登録への誘導へ（/today側で分岐）。
  return (
    <Link href="/today" className="expertbanner expertbanner-today">
      <img src="/assets/icon_comment.png" alt="" className="expertbanner-icon" />
      <div className="expertbanner-body">
        <div className="expertbanner-title">{questionLabel}</div>
        <div className="expertbanner-desc">{loggedIn ? '回答済み・今日の集計を見る' : '回答ありがとうございます'}</div>
      </div>
      {/* 実際の集計ではなく、横1行の高さに収まるミニ棒グラフの見本（ぼかし）。
          会員は/todayで本物のグラフが見られる。未ログインは/todayでも引き続き
          ぼかし見本＋会員登録への誘導が出る。 */}
      <div className="expertbanner-today-graph" aria-hidden="true">
        <span style={{ height: '45%' }} />
        <span style={{ height: '85%', background: 'var(--main)' }} />
        <span style={{ height: '60%' }} />
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
