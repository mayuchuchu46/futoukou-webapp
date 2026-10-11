'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type SummaryResponse = {
  loggedIn: boolean;
  active: boolean;
  count: number;
  summary: { statusSummary: string; advice: string | null; locked: boolean } | null;
};

// マイページ上部に出す「今のお子さんの状況」AIサマリー。
// ・未登録：会員登録すると相談の積み重ねから状況整理が受けられることを案内する（この時点の
//   自分のブラウザの相談件数 ownCount を見せて、「相談を重ねるほど分析が詳しくなる」イメージを
//   会員登録前からも持ってもらう）
// ・登録済み・相談0件：まだ分析できる材料がないことを伝える
// ・登録済み・相談あり・読み放題会員ではない：状況整理（無料のお試し）だけ見せ、具体的な
//   アドバイスは会員限定であることを案内する（新たな課金ではなく既存の月¥800会員の特典として）
// ・登録済み・相談あり・読み放題会員：状況整理＋アドバイスの両方を見せる
// どの状態でも、相談件数を見せることで「質問するほど、どうする先生の理解が深くなる」という
// 積み重ねの価値を伝える。
export default function ConsultationSummaryCard({ ownCount }: { ownCount: number }) {
  const [data, setData] = useState<SummaryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/member-summary')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData({ loggedIn: false, active: false, count: 0, summary: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  if (!data.loggedIn) {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>
          <img src="/assets/sensei_logo.png" alt="" />
          今のお子さんの状況をAIがまとめます
        </div>
        <div className="qtext">
          {ownCount > 0
            ? `これまでに${ownCount}件相談しています。会員登録すると、これまでの相談を一つにまとめて、今のお子さんの状況をどうする先生が整理してくれます。相談を重ねるほど、分析はより詳しくなっていきます。`
            : '会員登録すると、相談を重ねるたびにどうする先生がそれまでの内容をまとめて、今のお子さんの状況を整理してくれます。相談を重ねるほど、分析はより詳しくなっていきます。'}
        </div>
        <Link className="btn-primary" href="/account/register?next=/mypage">
          無料で登録する
        </Link>
      </div>
    );
  }

  if (!data.summary) {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>
          <img src="/assets/sensei_logo.png" alt="" />
          今のお子さんの状況をAIがまとめます
        </div>
        <div className="qtext">
          まだ相談がありません。相談を重ねるほど、どうする先生がお子さんの状況をより詳しく整理できるようになります。
        </div>
      </div>
    );
  }

  const { statusSummary, advice, locked } = data.summary;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        <img src="/assets/sensei_logo.png" alt="" />
        今のお子さんの状況
      </div>
      <div className="muted" style={{ fontSize: 13 }}>
        これまでの相談：{data.count}件・相談を重ねるほど、分析はより詳しくなります
      </div>
      <div className="qtext">{statusSummary}</div>

      {locked ? (
        <>
          <div className="qtext" style={{ filter: 'blur(4px)', userSelect: 'none' }} aria-hidden="true">
            会員になると、ここに次の一手の具体的なアドバイスが表示されます。会員になると、ここに次の一手の具体的なアドバイスが表示されます。
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            次の一手の具体的なアドバイスは、読み放題会員（月¥800）の特典です。
          </div>
          <Link className="btn-primary" href="/account">
            会員になってアドバイスを見る
          </Link>
        </>
      ) : (
        <>
          <div className="answer-label" style={{ fontSize: 13 }}>次にやること</div>
          <div className="qtext">{advice}</div>
        </>
      )}
    </div>
  );
}
