'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Child } from '@/lib/types';

type SummaryResponse = {
  loggedIn: boolean;
  active: boolean;
  count: number;
  summary: {
    statusSummary: string;
    advice: string | null;
    phrasingSuggestion: string | null;
    environmentSuggestion: string | null;
    schoolFitPoints: string | null;
    locked: boolean;
  } | null;
};

// 学校ごとの相性診断（実在の学校名を使った具体的な提案）は、学校データが整うまでの
// カミングソーン扱いだった（2026-10-12）が、2026-10-22に学びの多様化学校の詳細ページ
// （/gakko/school/[no]、SchoolFitCard.tsx）で先行して実装した。ここ（伴走ノート）で
// 出しているのは引き続き、実在の学校名を出さない一般的な着眼点の提案（school_fit_points）
// のまま（まだ全ての学校種をカバーしていないため、ノート側に全面展開するのはこの先の
// 課題）。「準備中」のままにせず、今どこで見られるかを案内する。
function SchoolMatchComingSoon() {
  return (
    <div className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className="comingsoon-badge">一部対応</span>
      学校ごとの相性メモは、気になる学校（学びの多様化学校）の詳細ページで見られます
    </div>
  );
}

// まだ中身のない項目を、点線枠の「これから書かれる欄」として見せるプレビュー行。
// 相談0件・未登録の段階では実際の分析内容を出しようがないが、「相談するとここに
// 何が書かれるのか」を先に見せることで、中身を埋めたくなる気持ちを作る狙い
// （2026-10-12、「次に何が書かれるかイメージできるように」との指摘を受けて追加）。
// フル表示の状態でも、AIがその項目を生成できなかった稀なケースでは同じ見た目で
// 「次の相談で書かれるかもしれません」というヒントになる。
function NotebookPlaceholder({ tabClass, label, hint }: { tabClass: string; label: string; hint: string }) {
  return (
    <div className="notebook-entry placeholder">
      <span className={`notebook-tab ${tabClass}`}>{label}</span>
      <div className="notebook-placeholder-text">{hint}</div>
    </div>
  );
}

const PREVIEW_ENTRIES = [
  { tabClass: 'tab-status', label: '今のお子さんの状況', hint: '相談の内容から、今の状況をどうする先生が整理します。' },
  { tabClass: 'tab-advice', label: '次にできそうなこと', hint: '次にできそうな、具体的な一歩の案が書かれます。' },
  { tabClass: 'tab-phrase', label: '言葉かけの提案', hint: 'この子に合いそうな声かけの例が書かれます。' },
  { tabClass: 'tab-env', label: '環境面の工夫', hint: '今日から試せる、環境面の工夫が書かれます。' },
  { tabClass: 'tab-school', label: '学校・居場所選びの着眼点', hint: '学校や居場所を選ぶときの着眼点が書かれます。' },
];

// 「伴走ノート」の見出し部分（タイトル＋相談件数の付箋バッジ＋積み重ね表示の点）。
// どの表示状態（未登録・相談0件・相談あり）でも同じ見出しを出し、ページ全体が
// 一貫して「ノート」に見えるようにする（2026-10-12、ノートらしい見た目にする
// リニューアルで追加）。
function NotebookHead({ count, childId }: { count: number; childId?: string | null }) {
  const dots = Array.from({ length: 5 }, (_, i) => i < Math.min(count, 5));
  // 子どもプロフィールを選んで見ている場合、アカウントページ側もその子の相談だけに
  // 絞って見せる（2026-10-16、lib/consultations.ts childId絞り込み参照。2026-10-21、
  // マイページ統合に伴いリンク先を/accountに変更）。
  const mypageHref = childId ? `/account?child=${childId}` : '/account';
  return (
    <div className="notebook-head">
      <div className="notebook-head-text">
        <div className="answer-label" style={{ fontSize: 14 }}>
          <img src="/assets/icon_book.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 0, border: 'none' }} />
          伴走ノート
        </div>
        <div className="notebook-progress">
          {dots.map((filled, i) => (
            <span key={i} className={`notebook-progress-dot${filled ? ' filled' : ''}`} />
          ))}
          <span className="notebook-progress-label">
            {count > 5 ? `${count}件のメモ` : '相談を重ねるほど増えていきます'}
          </span>
        </div>
      </div>
      {/* 「何件相談したか数字で見るだけでなく、中身も確認したい」との指摘を受けて、
          件数バッジをマイページ（自分の相談一覧）へのリンクにした（2026-10-16）。 */}
      {count > 0 && (
        <Link href={mypageHref} className="notebook-count-badge" style={{ textDecoration: 'none' }}>
          {count}件相談済み
        </Link>
      )}
    </div>
  );
}

// 子どもプロフィールを複数作っている会員向けの切り替えタブ（2026-10-16追加）。
// 「兄弟で不登校のパターンが多い」ため、1アカウントで複数の子どもを分けて記録できる
// ようにした機能のUI部分。子どもプロフィールを1人も作っていない会員には出さない
// （呼び出し側で判定）。
function ChildSwitcher({
  children: childrenList,
  selectedChildId,
  onSelect,
}: {
  children: Child[];
  selectedChildId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="chip-row chip-row-wrap" style={{ marginBottom: 2 }}>
      <button
        type="button"
        className={`chip chip-tag${selectedChildId === null ? ' active' : ''}`}
        onClick={() => onSelect(null)}
      >
        全体
      </button>
      {childrenList.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`chip chip-tag${selectedChildId === c.id ? ' active' : ''}`}
          onClick={() => onSelect(c.id)}
        >
          {c.name}
        </button>
      ))}
      <Link href="/account/children" className="chip chip-tag" style={{ textDecoration: 'none' }}>
        ＋ 子どもを追加
      </Link>
    </div>
  );
}

// 「伴走ノート」ページ（/notebook）の本体カード。自分が投稿した相談の蓄積から
// どうする先生がAIで状況を整理するもの。元はマイページ内のカードだったが、
// 会員登録・課金への導線として独立したタブ（ボトムナビ）に格上げした
// （2026-10-12）。閲覧履歴・いいね等の行動ログは今のところ会員単位で
// 記録していない（匿名ブラウザIDに紐づくのみ）ため、分析材料は
// 「本人が投稿した相談」に絞っている。これは信号としての精度が高いことに
// 加え、「読んだだけのページも見られている」という違和感を避ける意図もある。
// 見た目は、紙のノート（横罫線＋左の赤線）＋項目ごとに色分けしたタブ付き
// カードで統一し、相談を重ねるほどノートが「書き足されて」整理されていく
// 感覚を出している（.notebook-*、2026-10-12リニューアル）。
// ・未登録：会員登録すると相談の積み重ねからノートが作られることを案内する（この時点の
//   自分のブラウザの相談件数 ownCount を見せて、「相談を重ねるほどノートの中身が詳しくなる」
//   イメージを会員登録前からも持ってもらう）
// ・登録済み・相談0件：まだノートに書く材料がないことを伝える
// ・登録済み・相談あり：状況整理＋アドバイス＋言葉かけの提案＋環境面の工夫＋学校選びの着眼点、
//   全部を見せる。
//   【2026-10-12 方針変更】以前はここを読み放題会員（有料）限定にしていたが、今の段階では
//   無料会員（ログインのみ）にも開放し、まずは「相談を重ねるほどノートが詳しくなる」体験
//   そのものを知ってもらう方針にした。locked状態のUI（下のlocked分岐）は、将来「相談件数が
//   一定を超えて分析が詳しくなった先は有料会員限定にする」という課金導線を作る際に再度使う
//   想定で残してあるが、現状はAPI側（/api/member-summary）が常にlocked:falseを返すため
//   表示されない（未実装）。
// どの状態でも、相談件数を見せることで「質問するほど、ノートの中身が増えていく」という
// 積み重ねの価値を伝える。
export default function ConsultationSummaryCard({ ownCount }: { ownCount: number | null }) {
  const [data, setData] = useState<SummaryResponse | null>(null);
  // 子どもプロフィール機能（2026-10-16追加）。未ログインの間はAPIが常に空配列を
  // 返すだけなので、ログイン状態を気にせず取得してよい。
  const [childrenList, setChildrenList] = useState<Child[] | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/children')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setChildrenList(d.children || []);
      })
      .catch(() => {
        if (!cancelled) setChildrenList([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const qs = selectedChildId ? `?child_id=${encodeURIComponent(selectedChildId)}` : '';
    fetch(`/api/member-summary${qs}`)
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
  }, [selectedChildId]);

  // data（/api/member-summary）とownCount（親側の/api/consultations、自分の相談件数）は
  // 親コンポーネント側で並列に取得している。未ログイン分岐の文言がownCountを使うため、
  // 両方そろうまでは表示しない（どちらか一方が遅れても、取得自体は並列で進む）。
  if (!data || ownCount === null) return null;

  // 子どもを複数登録している会員だけに出す切り替えタブ。ログインしていない・
  // 子どもプロフィールが0〜1人の会員には今まで通り何も表示しない
  // （1人の場合に出しても「全体」と変わらず意味がないため2人以上で判定）。
  const childSwitcher =
    data.loggedIn && childrenList && childrenList.length > 1 ? (
      <ChildSwitcher children={childrenList} selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
    ) : null;
  // 特定の子どもを選んでいる場合、「相談する」の遷移先にも引き継いで、/askで
  // その子が選ばれた状態から始められるようにする（2026-10-16）。
  const askHref = selectedChildId ? `/ask?child=${encodeURIComponent(selectedChildId)}` : '/ask';

  if (!data.loggedIn) {
    // 相談が0件の段階では、会員登録してもノートに書く材料が無く空のままになってしまう
    // ため、先に「会員登録」を主役にすると「登録したのに何も無い」という空振りを招く。
    // この段階では「相談する」こそが次にやるべきことだと分かるよう、CTAの主役を
    // 「相談する」に入れ替え、会員登録はその先の話として控えめに案内する（2026-10-13、
    // 「まず相談しないとここが見れないと分かるようにしたい」との指摘を受けて）。
    // 既に相談がある場合は、引き続き「会員登録してノートを見る」を主役にする。
    if (ownCount === 0) {
      return (
        <div className="card notebook-card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <NotebookHead count={0} />
          {/* 説明文が長いと誘導ボタンまで読んでもらえないとの指摘を受けて、一文に
              短縮し、ボタンを直後に置いて迷わず押せるようにした（2026-10-13）。 */}
          <div className="qtext">
            伴走ノートは、相談するとここに作られます。
          </div>
          <Link className="btn-primary" href="/ask">
            まずは相談してみる（無料）
          </Link>
          {PREVIEW_ENTRIES.map((entry) => (
            <NotebookPlaceholder key={entry.label} {...entry} />
          ))}
          <Link href="/account/register?next=/notebook" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
            会員登録について見る
          </Link>
        </div>
      );
    }
    return (
      <div className="card notebook-card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <NotebookHead count={ownCount} />
        <div className="qtext">
          {`これまでに${ownCount}件相談しています。会員登録すると、これまでの相談を一つのノートにまとめて、今のお子さんの状況をどうする先生が整理してくれます。相談を重ねるほど、ノートの中身は詳しくなっていきます。`}
        </div>
        {/* ここに何が書かれていくのかを先に見せる「目次」プレビュー。相談はあるがまだ未登録の
            段階では実際の分析内容はまだ出せないが、「相談するとこの5項目が埋まっていく」
            という完成イメージを先に見せることで、埋めたくなる気持ちを作る
            （2026-10-12、「次に何が書かれるかイメージできるように」との指摘を受けて追加）。 */}
        {PREVIEW_ENTRIES.map((entry) => (
          <NotebookPlaceholder key={entry.label} {...entry} />
        ))}
        <Link className="btn-primary" href="/account/register?next=/notebook">
          会員登録（無料）で伴走ノートを見る
        </Link>
        <Link href="/ask" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
          さらに相談してから登録する
        </Link>
      </div>
    );
  }

  if (!data.summary) {
    return (
      <div className="card notebook-card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <NotebookHead count={0} childId={selectedChildId} />
        {childSwitcher}
        <div className="qtext">
          {selectedChildId
            ? 'まだこの子についての相談がありません。相談するときに、この子を選んでみてください。'
            : 'まだ相談がありません。相談するたびに、ここにノートとして記録が蓄積され、どうする先生がお子さんの状況をより詳しく整理できるようになります。'}
        </div>
        {PREVIEW_ENTRIES.map((entry) => (
          <NotebookPlaceholder key={entry.label} {...entry} />
        ))}
        <Link className="btn-primary" href={askHref}>
          相談してノートを作り始める
        </Link>
      </div>
    );
  }

  const { statusSummary, advice, phrasingSuggestion, environmentSuggestion, schoolFitPoints, locked } = data.summary;

  return (
    <div className="card notebook-card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <NotebookHead count={data.count} childId={selectedChildId} />
      {childSwitcher}

      <div className="notebook-entry">
        <span className="notebook-tab tab-status">今のお子さんの状況</span>
        <div className="qtext">{statusSummary}</div>
      </div>

      {locked ? (
        <>
          <div className="notebook-entry">
            <span className="notebook-tab tab-advice">次にできそうなこと</span>
            <div className="qtext" style={{ filter: 'blur(4px)', userSelect: 'none' }} aria-hidden="true">
              会員になると、ここに次にできそうなことの具体的な案・この子に合いそうな言葉かけ・環境面の工夫が表示されます。相談を重ねるほど、より具体的な内容になっていきます。
            </div>
          </div>
          <Link className="btn-primary" href="/account">
            会員になって見る
          </Link>
          {/* 課金導線（会員になって見る）を一番手にしつつ、まだ相談するか迷っている人にも
              「相談を増やす」という選択肢を出しておく。相談が増えるほど状況整理の精度が
              上がり、会員になったときに見える内容も充実するため、ここで相談を離脱させない
              ための導線。最初は小さいテキストリンクにしていたが目立たなすぎたため、
              btn-primaryと並ぶ実際のボタン（btn-secondary）に変更した（2026-10-12）。 */}
          <Link href={askHref} className="btn-secondary" style={{ width: '100%' }}>
            さらに相談して、ノートの材料を増やす
          </Link>
          <SchoolMatchComingSoon />
        </>
      ) : (
        <>
          <div className="notebook-entry">
            <span className="notebook-tab tab-advice">次にできそうなこと</span>
            <div className="qtext">{advice}</div>
          </div>
          {phrasingSuggestion ? (
            <div className="notebook-entry">
              <span className="notebook-tab tab-phrase">言葉かけの提案</span>
              <div className="qtext">{phrasingSuggestion}</div>
            </div>
          ) : (
            // AIがこの項目を生成できなかった稀なケース。消してしまうと「埋まるはずの
            // 欄」が見えなくなるので、次に相談したときにここが埋まるというヒントとして
            // プレースホルダーのまま残す（2026-10-12 追加）。
            <NotebookPlaceholder {...PREVIEW_ENTRIES[2]} />
          )}
          {environmentSuggestion ? (
            <div className="notebook-entry">
              <span className="notebook-tab tab-env">環境面の工夫</span>
              <div className="qtext">{environmentSuggestion}</div>
            </div>
          ) : (
            <NotebookPlaceholder {...PREVIEW_ENTRIES[3]} />
          )}
          {schoolFitPoints ? (
            // 学校・居場所選びの着眼点（簡易版）。実在の学校名は出さない、一般的な
            // チェックポイントの提案。本格的な学校ごとの相性診断はデータが揃うまでの
            // カミングソーンとして下にバッジで案内する（2026-10-12 追加）。
            <div className="notebook-entry">
              <span className="notebook-tab tab-school">学校・居場所選びの着眼点</span>
              <div className="qtext">{schoolFitPoints}</div>
            </div>
          ) : (
            <NotebookPlaceholder {...PREVIEW_ENTRIES[4]} />
          )}
          {/* フル表示になった後も、相談を重ねるたびにノートが更新・充実していくことが
              伝わるよう、次の相談への導線を必ず置く（2026-10-12 追加）。以前は小さな
              muted文字だけだったが、「この誘導はもっと強化したい」との指摘を受けて、
              アイコン付きの帯に格上げし、文言も「書き足される」という具体的な動作を
              示す形に強めた（2026-10-12）。 */}
          <div className="notebook-nudge">
            <span className="notebook-nudge-icon">✏️</span>
            相談を重ねるほど、ノートの中身はさらに詳しくなります。次の相談で、ここに新しいページが書き足されます。
          </div>
          <Link href={askHref} className="btn-primary">
            新しく相談して、ノートを書き足す
          </Link>
          <SchoolMatchComingSoon />
        </>
      )}

      {/* 結果ページのAI回答に付けている免責文と同じ考え方を、伴走ノートにも適用。
          ノートの中身（状況整理・次の一手・言葉かけ等）は全てAI生成であり、相談結果
          ページと同じく「一つの見方」「間違えることもある」「最終判断は保護者自身」
          という前提と、専門家・相談窓口への導線をここにもまとめて置く。見出し直下では
          目に入りすぎるとの指摘を受けて、ノートの内容を読んだ後に目に入るよう、
          カードの一番下に移動した（2026-10-13）。 */}
      <div className="muted" style={{ fontSize: 12 }}>
        ⚠️ このノートの内容はAIが相談内容をもとに整理した一つの見方で、間違えることもあります。実際にどうするかはご家庭の状況に合わせてご判断ください。
        <Link href="/ask" style={{ color: 'var(--orange-text)', fontWeight: 700, textDecoration: 'underline' }}>
          専門家
        </Link>
        や
        <Link href="/support" style={{ color: 'var(--orange-text)', fontWeight: 700, textDecoration: 'underline' }}>
          相談窓口
        </Link>
        もあわせてご活用ください。
      </div>
    </div>
  );
}
