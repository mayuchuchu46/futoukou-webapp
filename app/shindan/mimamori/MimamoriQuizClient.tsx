'use client';

import { useState } from 'react';
import {
  MIMAMORI_QUESTIONS,
  resolveMimamoriType,
  type AxisAValue,
  type AxisBValue,
} from '@/lib/mimamoriShindan';

export default function MimamoriQuizClient() {
  const [answers, setAnswers] = useState<Array<AxisAValue | AxisBValue | undefined>>([]);
  const [step, setStep] = useState(0);
  const [moving, setMoving] = useState(false);
  const total = MIMAMORI_QUESTIONS.length;

  // 最後の質問に答えたら、タイプごとの結果ページ（/shindan/mimamori/result/[type]）に
  // 遷移する（2026-11-01、シェア用ビジュアル対応で追加）。結果をこのページ内に
  // 表示する方式だと、シェアした時のリンク先が診断トップ（全タイプ共通の説明）に
  // なってしまい、OGP画像・説明文をタイプごとに出せない。固有のURLに切り替えることで、
  // X・Facebook・LINEでシェアした時にタイプ専用のOGP画像（opengraph-image.tsx）・
  // 説明文が表示されるようにしている。
  //
  // 遷移はnext/navigationのrouter.pushではなく、あえてwindow.location.hrefによる
  // 通常の（フルリロードの）遷移にしている（2026-11-01、「診断結果を見た後、診断
  // トップへ戻っても戻れない」「TOPから行っても結果ページになる」という不具合の対応）。
  // router.pushだとNext.jsのクライアント側ルーターキャッシュに「回答済み（done=true）」
  // の状態のまま/shindan/mimamoriのコンポーネントが保持され、そこへ再度Linkで
  // 戻ってきた時に古い状態のままuseEffectが再発火して即座に結果ページへ押し戻されて
  // いた。フルリロードにすることでそのキャッシュごと消え、次に/shindan/mimamoriへ
  // 来た時は必ずQ1からの新しい状態になる。
  function choose(value: AxisAValue | AxisBValue) {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    setMoving(true);
    const type = resolveMimamoriType(next as Array<AxisAValue | AxisBValue>);
    window.location.href = `/shindan/mimamori/result/${type}`;
  }

  if (moving) {
    return (
      <div className="card" style={{ alignItems: 'center', gap: 10 }}>
        <div className="qtext">診断結果を表示しています…</div>
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
