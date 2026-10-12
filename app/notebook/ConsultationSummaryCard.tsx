'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type SummaryResponse = {
  loggedIn: boolean;
  active: boolean;
  count: number;
  summary: {
    statusSummary: string;
    advice: string | null;
    phrasingSuggestion: string | null;
    environmentSuggestion: string | null;
    locked: boolean;
  } | null;
};

// 「分析ノート」ページ（/notebook）の本体カード。自分が投稿した相談の蓄積から
// どうする先生がAIで状況を整理するもの。元はマイページ内のカードだったが、
// 会員登録・課金への導線として独立したタブ（ボトムナビ）に格上げした
// （2026-10-12）。閲覧履歴・いいね等の行動ログは今のところ会員単位で
// 記録していない（匿名ブラウザIDに紐づくのみ）ため、分析材料は
// 「本人が投稿した相談」に絞っている。これは信号としての精度が高いことに
// 加え、「読んだだけのページも見られている」という違和感を避ける意図もある。
// ・未登録：会員登録すると相談の積み重ねからノートが作られることを案内する（この時点の
//   自分のブラウザの相談件数 ownCount を見せて、「相談を重ねるほどノートの中身が詳しくなる」
//   イメージを会員登録前からも持ってもらう）
// ・登録済み・相談0件：まだノートに書く材料がないことを伝える
// ・登録済み・相談あり・読み放題会員ではない：状況整理（無料のお試し）だけ見せ、具体的な
//   アドバイス・言葉かけの提案・環境面の工夫は会員限定であることを案内する
//   （新たな課金ではなく既存の読み放題会員の特典として。2026-10-12 2項目追加）
// ・登録済み・相談あり・読み放題会員：状況整理＋アドバイス＋言葉かけの提案＋環境面の工夫を見せる
// どの状態でも、相談件数を見せることで「質問するほど、ノートの中身が増えていく」という
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
          <img src="/assets/icon_book.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 0, border: 'none' }} />
          分析ノート
        </div>
        <div className="qtext">
          {ownCount > 0
            ? `これまでに${ownCount}件相談しています。会員登録すると、これまでの相談を一つのノートにまとめて、今のお子さんの状況をどうする先生が整理してくれます。相談を重ねるほど、ノートの中身は詳しくなっていきます。`
            : '会員登録すると、相談するたびにどうする先生がそれまでの内容を一つのノートにまとめて、今のお子さんの状況を整理してくれます。相談を重ねるほど、ノートの中身は詳しくなっていきます。'}
        </div>
        <Link className="btn-primary" href="/account/register?next=/notebook">
          無料で分析ノートを始める
        </Link>
      </div>
    );
  }

  if (!data.summary) {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>
          <img src="/assets/icon_book.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 0, border: 'none' }} />
          分析ノート
        </div>
        <div className="qtext">
          まだ相談がありません。相談するたびに、ここにノートとして記録が蓄積され、どうする先生がお子さんの状況をより詳しく整理できるようになります。
        </div>
        <Link className="btn-secondary" href="/ask">
          相談する
        </Link>
      </div>
    );
  }

  const { statusSummary, advice, phrasingSuggestion, environmentSuggestion, locked } = data.summary;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        <img src="/assets/icon_book.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 0, border: 'none' }} />
        分析ノート
      </div>
      <div className="muted" style={{ fontSize: 13 }}>
        これまでの相談：{data.count}件・相談を重ねるほど、ノートの中身は詳しくなります
      </div>
      <div className="answer-label" style={{ fontSize: 12 }}>今のお子さんの状況</div>
      <div className="qtext">{statusSummary}</div>

      {locked ? (
        <>
          <div className="qtext" style={{ filter: 'blur(4px)', userSelect: 'none' }} aria-hidden="true">
            会員になると、ここに次の一手の具体的なアドバイス・この子に合いそうな言葉かけ・環境面の工夫が表示されます。相談を重ねるほど、より具体的な内容になっていきます。
          </div>
          <Link className="btn-primary" href="/account">
            会員になって見る
          </Link>
        </>
      ) : (
        <>
          <div className="answer-label" style={{ fontSize: 13 }}>次にやること</div>
          <div className="qtext">{advice}</div>
          {phrasingSuggestion && (
            <>
              <div className="answer-label" style={{ fontSize: 13 }}>言葉かけの提案</div>
              <div className="qtext">{phrasingSuggestion}</div>
            </>
          )}
          {environmentSuggestion && (
            <>
              <div className="answer-label" style={{ fontSize: 13 }}>環境面の工夫</div>
              <div className="qtext">{environmentSuggestion}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
