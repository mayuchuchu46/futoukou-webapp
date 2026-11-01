'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SITE_URL } from '@/lib/site';
import {
  MIMAMORI_QUESTIONS,
  MIMAMORI_RESULTS,
  resolveMimamoriType,
  type AxisAValue,
  type AxisBValue,
} from '@/lib/mimamoriShindan';

const RESULT_URL = `${SITE_URL}/shindan/mimamori`;

export default function MimamoriQuizClient() {
  const [answers, setAnswers] = useState<Array<AxisAValue | AxisBValue | undefined>>([]);
  const [step, setStep] = useState(0);
  const total = MIMAMORI_QUESTIONS.length;
  const done = answers.length === total;

  function choose(value: AxisAValue | AxisBValue) {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (step < total - 1) setStep(step + 1);
  }

  function reset() {
    setAnswers([]);
    setStep(0);
  }

  if (done) {
    const type = resolveMimamoriType(answers as Array<AxisAValue | AxisBValue>);
    const result = MIMAMORI_RESULTS[type];
    const shareText = `【見守り力タイプ診断】\n私は「${result.name}」でした。\n${result.catch}`;

    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 12 }}>
        <div className="answer-label" style={{ fontSize: 13 }}>診断結果</div>
        <div className="qtext-main" style={{ fontSize: 18 }}>{result.name}</div>
        <div className="qtext" style={{ fontWeight: 600 }}>{result.catch}</div>
        <div className="qtext">{result.desc}</div>
        <div className="card-answerbox" style={{ width: '100%' }}>
          <div className="qtext" style={{ fontSize: 13 }}>
            <strong>気をつけたいこと一つだけ：</strong>{result.caution}
          </div>
        </div>
        <Link href={`/dictionary/${result.categorySlug}`} className="btn-secondary" style={{ width: '100%' }}>
          {result.categoryLabel}に関する相談を見る
        </Link>
        <div className="share-btn-row" style={{ width: '100%' }}>
          <a
            className="share-btn"
            href={`https://twitter.com/intent/tweet?${new URLSearchParams({
              text: shareText,
              url: RESULT_URL,
              hashtags: 'どうする先生,不登校',
            })}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="share-btn-icon">𝕏</span>
            診断結果をシェア
          </a>
          <a
            className="share-btn share-btn-line"
            href={`https://social-plugins.line.me/lineit/share?${new URLSearchParams({
              url: RESULT_URL,
              text: shareText,
            })}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="share-btn-icon">L</span>
            LINEでシェアする
          </a>
        </div>
        <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={reset}>
          もう一度診断する
        </button>
      </div>
    );
  }

  const question = MIMAMORI_QUESTIONS[step];

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 14 }}>
      <div className="muted" style={{ fontSize: 12 }}>質問 {step + 1}/{total}</div>
      <div className="qtext-main">{question.text}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {question.choices.map((choice) => (
          <button
            key={choice.label}
            type="button"
            className="btn-secondary"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => choose(choice.value)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
