'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MIMAMORI_QUESTIONS,
  resolveMimamoriType,
  type AxisAValue,
  type AxisBValue,
} from '@/lib/mimamoriShindan';

export default function MimamoriQuizClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Array<AxisAValue | AxisBValue | undefined>>([]);
  const [step, setStep] = useState(0);
  const total = MIMAMORI_QUESTIONS.length;
  const done = answers.length === total;

  // 最後の質問に答えたら、タイプごとの結果ページ（/shindan/mimamori/result/[type]）に
  // 遷移する（2026-11-01、シェア用ビジュアル対応で追加）。結果をこのページ内に
  // 表示する方式だと、シェアした時のリンク先が診断トップ（全タイプ共通の説明）に
  // なってしまい、OGP画像・説明文をタイプごとに出せない。固有のURLに切り替えることで、
  // X・Facebook・LINEでシェアした時にタイプ専用のOGP画像（opengraph-image.tsx）・
  // 説明文が表示されるようにしている。
  useEffect(() => {
    if (!done) return;
    const type = resolveMimamoriType(answers as Array<AxisAValue | AxisBValue>);
    router.push(`/shindan/mimamori/result/${type}`);
  }, [done, answers, router]);

  if (done) {
    return (
      <div className="card" style={{ alignItems: 'center', gap: 10 }}>
        <div className="qtext">診断結果を表示しています…</div>
      </div>
    );
  }

  function choose(value: AxisAValue | AxisBValue) {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (step < total - 1) setStep(step + 1);
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
