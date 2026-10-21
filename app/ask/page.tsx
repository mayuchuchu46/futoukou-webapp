'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { CATS, Category, CATEGORY_EXAMPLES } from '@/lib/categories';
import { GRADE_OPTIONS, GENDER_OPTIONS, Child } from '@/lib/types';
import { getUid, hasAgreedTerms, setAgreedTerms, getAskDraft, setAskDraft, clearAskDraft } from '@/lib/uid';

const CATEGORY_KEYS = Object.keys(CATS) as Category[];

// カテゴリごとの入力例（CATEGORY_EXAMPLES）は、自動投稿機能と共有するため
// lib/categories.tsに移動した（2026-10-14）。以前は全カテゴリ共通で1つの例文
// （身体的要因向け）しか出ていなかったため、カテゴリと合わない例文が
// 「何を書けばいいか分からない」の原因になっていた。カテゴリ選択に応じて
// 切り替える（2026-10-12、新規ユーザーの離脱対策として追加）。
const DEFAULT_PLACEHOLDER = CATEGORY_EXAMPLES.body;

// 相談送信（AI回答生成）のタイムアウト。画面上は「通常20〜30秒ほど」と案内しているため、
// それより十分長い時間を確保しつつ、ハングしたままボタンが永久に押せなくなる事態を防ぐ
// （2026-10-18、「たまにボタンが押せなくなる。戻ってくると直る」との報告を受けて追加）。
const ASK_TIMEOUT_MS = 55000;

type RequestedExpert = { id: string; name: string; credential: string };

// useSearchParams()（?expert=指名用）はレンダリング時点でしか値が確定しないため、
// プリレンダーをブロックしないようにSuspenseで囲む。
// ただし、以前はHeader・PcSidebar・BottomNav（ページ全体の外枠）までこのSuspenseの
// 内側に含めてしまっていたため、再サスペンド時にfallback（何も表示しない）へ
// 一瞬切り替わると、ヘッダーごと画面から消える現象が起きていた（2026-10-18、
// トップページで起きていたのと同じ原因。「別ページに移動するとヘッダーが消える」
// との報告を受けて、ここも外枠をSuspenseの外に出し、影響範囲を本文だけに絞った）。
export default function AskPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <Suspense fallback={null}>
          <AskPageContent />
        </Suspense>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}

function AskPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expertIdParam = searchParams.get('expert');
  // 伴走ノート（/notebook）の子ども切り替えや、お子さんのプロフィール画面から
  // 「この子について相談する」で来た場合に、あらかじめ選択済みにする（2026-10-16追加）。
  const childIdParam = searchParams.get('child');
  // 学校紹介ページ（/gakko/school/[no]）の「相談する」ボタンから来た場合に、
  // 学校名を相談文にあらかじめ入れておく（2026-10-18、「相談するに遷移したら
  // 学校名のテキスト入ってる状態が良くない？」との指摘を受けて追加）。
  // 下書き（getAskDraft）に既に文章がある場合は上書きしない。
  const prefillParam = searchParams.get('prefill');
  // 以前はCATEGORY_KEYS[0]（＝オブジェクトの先頭に書かれているだけの「身体的要因」）が
  // 何もしなくても選択済みになっていた。意図した選択ではないのに、選ばずに送信すると
  // 違うカテゴリで投稿・回答生成されてしまうため、未選択（''）を初期値にし、
  // 選ぶまで送信できないようにした（2026-10-12）。
  const [category, setCategory] = useState<Category | ''>('');
  const [text, setText] = useState('');
  const [grade, setGrade] = useState('');
  const [gender, setGender] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expertSubmitting, setExpertSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [needsTerms, setNeedsTerms] = useState(false);
  const [expertAvailable, setExpertAvailable] = useState(false);
  const [memberActive, setMemberActive] = useState(false);
  const [freeQuestionAvailable, setFreeQuestionAvailable] = useState(false);
  const [expertCredits, setExpertCredits] = useState(0);
  const [expertPriceJpy, setExpertPriceJpy] = useState(600);
  const [requestedExpert, setRequestedExpert] = useState<RequestedExpert | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  // 子どもプロフィール機能（2026-10-16追加）。ログインしていない、またはお子さんの
  // プロフィールを1人も登録していない会員には今まで通り何も表示されない
  // （childrenListが空配列のまま）。
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [childParamApplied, setChildParamApplied] = useState(false);
  // テーマ選択の手間を省くため、相談文の入力に合わせてAIが自動でテーマを判定する
  // （2026-10-13追加）。一度でも自分でテーマを選び直した場合は、それ以降は自動判定で
  // 上書きしない。非同期処理の完了を待つ間に手動で選び直される可能性があるため、
  // 判定中かどうかに関わらず常に最新の値を読めるようref（コールバック内から参照しても
  // 古い値を見てしまわない）で管理する。
  const categoryTouchedRef = useRef(false);
  const [classifying, setClassifying] = useState(false);
  // 今回表示に使ったprefillの値（無ければundefined）。下書き保存時に一緒に
  // 保存しておき、次回「draft.text === draft.prefillText」かどうかで、
  // 「ボタンから入れただけでまだ手を加えていない状態」か「ユーザーが実際に書いた
  // 下書き」かを区別する（2026-10-18追加、下のeffect内コメント参照）。
  const prefillTextRef = useRef<string | undefined>(undefined);
  // 直近に適用したprefillParamの値（まだ何も適用していない最初のレンダリングでの値で
  // 初期化する。useRefの初期値はマウント時の1回しか使われないため、これだけで
  // 「初回マウント時のprefillParam」を安全に固定できる）。
  const lastSeenPrefillRef = useRef<string | null>(prefillParam);

  // 離脱してタブを閉じても、書いた内容が消えないようにする下書き保存。
  // マウント時に一度だけ復元し（draftLoadedが立つまでは保存側のeffectを動かさない
  // ことで、復元前の空の状態で上書きしてしまうのを防ぐ）、以後は入力内容の変化に
  // 合わせて自動保存する（2026-10-12、新規ユーザーの離脱対策として追加）。
  useEffect(() => {
    const draft = getAskDraft();
    if (draft) {
      // 復元した下書きに既にテーマがあれば、それは過去に選ばれた（または自動判定済みの）
      // ものなので、再入力のたびに自動判定で上書きしないよう「選択済み」扱いにする。
      if (draft.category) {
        setCategory(draft.category as Category);
        categoryTouchedRef.current = true;
      }
      setGrade(draft.grade || '');
      setGender(draft.gender || '');
      if (draft.child_id) setSelectedChildId(draft.child_id);
      // 「全部リリーベールのテキスト入ってる」との報告を受けて修正（2026-10-18）。
      // 以前はdraft.textが空でない限りprefillParamを無視していたため、一度どこかの
      // 学校のprefillで下書きが保存されると、別の学校のボタンを押しても古い学校名の
      // ままになってしまっていた。「下書きが無い」か「前回もprefillのまま手を加えて
      // いない」場合は、新しいprefillParamを優先する。ユーザーが実際に書いた下書きは
      // （prefillTextと異なる＝手を加えた状態として）引き続き保護する。
      const draftIsUntouchedPrefill = !!draft.text && draft.text === draft.prefillText;
      if (prefillParam && (!draft.text || draftIsUntouchedPrefill)) {
        setText(prefillParam);
        prefillTextRef.current = prefillParam;
      } else if (!prefillParam && draftIsUntouchedPrefill) {
        // 学校紹介ページ等のprefillを一度も手を加えずに離脱した場合、その下書きは
        // 「ユーザーが書いた内容」ではないため、普通に（prefillなしで）/askに来た
        // 時にまで復元してしまうと、ボトムナビの「相談する」を押すたびに前回見た
        // 学校名が入ったままになってしまう（2026-10-22、「普通に相談するボタン押すと
        // これ出る」との報告を受けて修正）。この場合は空欄から始める。
        setText('');
        prefillTextRef.current = undefined;
      } else {
        setText(draft.text || '');
        prefillTextRef.current = draft.prefillText;
      }
    } else if (prefillParam) {
      setText(prefillParam);
      prefillTextRef.current = prefillParam;
    }
    setDraftLoaded(true);
  }, []);

  // 上のeffectは「マウント時に1回だけ」しか実行されない。しかし、ある学校の紹介
  // ページから「相談する」で/askに来たあと、別の学校の紹介ページに移動してまた
  // 「相談する」を押した場合、Next.jsのルーターキャッシュにより/askページの
  // コンポーネント自体は再マウントされず、useSearchParams()から読んだprefillParamの
  // 値だけが新しくなる（prefillParam自体は再計算されるため、このeffectの依存配列には
  // 載せられる）。そのため、prefillParamの値が変わるたびに動く別のeffectを用意し、
  // 「前回のprefillのまま手を加えていない」場合にだけ新しいprefillで上書きする
  // （2026-10-21、「東京みらい中学校のページから相談するを押したら、別の学校（リリー
  // ベール小学校）のテキストが出てきた」との報告を受けて追加。他の学校・フリースクール
  // でも同様に起きるとのこと）。
  useEffect(() => {
    if (!draftLoaded) return;
    if (!prefillParam) return;
    if (lastSeenPrefillRef.current === prefillParam) return;
    if (!text || text === prefillTextRef.current) {
      setText(prefillParam);
      prefillTextRef.current = prefillParam;
    }
    lastSeenPrefillRef.current = prefillParam;
  }, [draftLoaded, prefillParam]);

  useEffect(() => {
    if (!draftLoaded) return;
    setAskDraft({ category, text, grade, gender, child_id: selectedChildId || undefined, prefillText: prefillTextRef.current });
  }, [draftLoaded, category, text, grade, gender, selectedChildId]);

  // 相談文の入力が一区切りついたタイミング（1.2秒操作がない）で、AIにテーマを
  // 判定してもらい、自動で選んでおく。手動で選び直された後は呼ばない。
  useEffect(() => {
    if (!draftLoaded || categoryTouchedRef.current) return;
    if (text.trim().length < 10) return;
    const timer = setTimeout(async () => {
      setClassifying(true);
      try {
        const res = await fetch('/api/classify-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim(), author_id: getUid() }),
        });
        const data = await res.json();
        // 応答が返ってくるまでの間に手動で選び直された場合は、上書きしない
        // （refなので、このコールバックの中でも常に最新の値を見られる）。
        if (res.ok && data.category && !categoryTouchedRef.current) {
          setCategory(data.category as Category);
        }
      } catch {
        // 自動判定に失敗しても、下の選択欄から手動で選べるので致命的ではない。
      } finally {
        setClassifying(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [text, draftLoaded]);

  useEffect(() => {
    setNeedsTerms(!hasAgreedTerms());
    fetch('/api/experts/available')
      .then((r) => r.json())
      .then((d) => setExpertAvailable(!!d.available))
      .catch(() => setExpertAvailable(false));
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => {
        setMemberActive(!!d.active);
        setFreeQuestionAvailable(!!d.freeQuestionAvailable);
        setExpertCredits(d.expertCredits || 0);
        if (d.expertPriceJpy) setExpertPriceJpy(d.expertPriceJpy);
        setStripeConfigured(!!d.stripeConfigured);
      })
      .catch(() => setMemberActive(false));
    // 子どもプロフィール（2026-10-16追加）。ログインしていない場合はAPI側が
    // {children: []}を返すだけで、他の表示には影響しない。
    fetch('/api/children')
      .then((r) => r.json())
      .then((d) => setChildrenList(d.children || []))
      .catch(() => setChildrenList([]));
  }, []);

  // ?child=IDで来た場合、下書き復元で既に選ばれていなければ、一覧取得後に反映する
  // （一覧が空のうちに即座に当ててしまうと、実在しないIDでも選択扱いになってしまうため、
  // 実際にそのIDの子どもが一覧にあることを確認してから選ぶ）。
  useEffect(() => {
    if (!draftLoaded || childParamApplied) return;
    if (!childIdParam) {
      setChildParamApplied(true);
      return;
    }
    if (!selectedChildId && childrenList.some((c) => c.id === childIdParam)) {
      setSelectedChildId(childIdParam);
    }
    if (childrenList.length > 0) setChildParamApplied(true);
  }, [draftLoaded, childParamApplied, childIdParam, childrenList, selectedChildId]);

  // 専門家一覧の「この専門家に相談する」から来た場合（?expert=ID）、
  // 本人確認済みの専門家であることを確認したうえで、指名表示に切り替える。
  useEffect(() => {
    if (!expertIdParam) {
      setRequestedExpert(null);
      return;
    }
    fetch(`/api/experts/get?id=${encodeURIComponent(expertIdParam)}`)
      .then((r) => r.json())
      .then((d) => setRequestedExpert(d.expert || null))
      .catch(() => setRequestedExpert(null));
  }, [expertIdParam]);

  async function submit() {
    if (!text.trim() || !category) return;
    setSubmitting(true);
    setError('');
    // AIの回答生成が通常より時間がかかった場合（AI側の混雑・サーバー関数のタイムアウト等）に、
    // fetchがエラーにも成功にもならずハングし続け、送信ボタンがグレーアウトしたまま
    // 押せなくなる不具合への対応（2026-10-18、「たまに押せなくなる。戻ってくると
    // 押せた」との報告を受けて追加）。ページを離れて戻ってくると直るのは、
    // コンポーネントが再マウントされてsubmittingが初期値に戻るため。
    // 一定時間で明示的にリクエストを中断し、必ずエラー状態に戻してボタンを再度押せるようにする。
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ASK_TIMEOUT_MS);
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          text,
          author_id: getUid(),
          grade: grade || null,
          gender: gender || null,
          child_id: selectedChildId || null,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      clearAskDraft();
      // 「もう一度相談する」で/askに戻ってきたとき、Next.jsのルーターキャッシュにより
      // このページのコンポーネント自体が再マウントされず（マウント時のuseEffectが
      // 再実行されず）、入力欄のReact state（text等）がそのまま残ってしまうことがある。
      // localStorageの下書きを消すだけでは不十分なため、ここでstateも明示的に空にする
      // （2026-10-16、「前回入れたテキストがそのまま入ってる」との指摘を受けて）。
      setText('');
      setCategory('');
      setGrade('');
      setGender('');
      categoryTouchedRef.current = false;
      router.push(`/result/${data.consultation.id}`);
    } catch (e: unknown) {
      setError(
        e instanceof Error && e.name === 'AbortError'
          ? '回答の生成に時間がかかりすぎたため中断しました。お手数ですが、もう一度お試しください。'
          : e instanceof Error
          ? e.message
          : 'エラーが発生しました'
      );
    } finally {
      clearTimeout(timeoutId);
      // setSubmitting(false)をcatchではなくfinallyに移動（2026-10-22）。
      // 以前はcatchにしか書いていなかったため、router.push()後に何らかの例外が
      // 起きるなど想定外のパスを通った場合にfinallyしか実行されず、
      // submittingがtrueのまま固まる（ボタンが永久に押せない）症状の原因になっていた。
      setSubmitting(false);
    }
  }

  async function submitToExpert() {
    if (!text.trim() || !category) return;
    setExpertSubmitting(true);
    setError('');
    // submit()と同じ理由（ハングしたまま固まる不具合対策）でタイムアウトを設ける（2026-10-18）。
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ASK_TIMEOUT_MS);
    try {
      const res = await fetch('/api/expert-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          text,
          author_id: getUid(),
          grade: grade || null,
          gender: gender || null,
          requested_expert_id: requestedExpert?.id || null,
          child_id: selectedChildId || null,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      if (data.funded) {
        // 無料枠・チケット消費の場合はStripe決済なしでその場で確定しているので、
        // 直接結果ページへ遷移する。
        clearAskDraft();
        // submit()と同じ理由で、ルーターキャッシュによりstateが残るのを防ぐため
        // 明示的に空にする（2026-10-16）。
        setText('');
        setCategory('');
        setGrade('');
        setGender('');
        categoryTouchedRef.current = false;
        router.push(`/result/${data.consultation_id}`);
        return;
      }
      // Stripe決済へ遷移する場合は、途中でキャンセルして戻ってくる可能性があるため
      // ドラフトは消さずに残す。
      if (!data.url) throw new Error('失敗しました');
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(
        e instanceof Error && e.name === 'AbortError'
          ? '送信に時間がかかりすぎたため中断しました。お手数ですが、もう一度お試しください。'
          : e instanceof Error
          ? e.message
          : 'エラーが発生しました'
      );
    } finally {
      clearTimeout(timeoutId);
      // submit()と同じ理由でfinallyに移動（2026-10-22）。
      setExpertSubmitting(false);
    }
  }

  if (needsTerms) {
    return (
        <div className="page-main">
          <h2 className="pagetitle">ご利用前の確認</h2>
          <div className="card">
            <div className="qtext">
              このアプリの回答はAIによる一般的な情報提供であり、医療的・心理的な診断ではありません。
              重大な判断の際は、専門機関（学校・医療機関・公的な相談窓口）に相談してください。
              {/* 「同意して相談をはじめる」ボタンを目立たせたいとの要望を受けて、各リンクは
                  個別のボタン・行として並べず、案内文中のテキストリンクに統合した（2026-10-13）。
                  グローバルCSSでaタグの下線・色付けが解除されているため、リンクだとわかるよう
                  下線＋ブランドカラーをここで明示している。別タブ（target="_blank"）で開くと
                  このページへ戻る導線が無かったため同タブ遷移に変更し、遷移先（/terms・/privacy・
                  /support）側にヘッダー上部・固定ナビ直上の「戻る」を用意した（同日、追加指摘を受けて）。 */}
              詳しくは
              <a href="/terms" style={{ color: 'var(--main)', textDecoration: 'underline' }}>利用規約</a>
              ・
              <a href="/privacy" style={{ color: 'var(--main)', textDecoration: 'underline' }}>プライバシーポリシー</a>
              ・
              <a href="/support" style={{ color: 'var(--main)', textDecoration: 'underline' }}>相談窓口の一覧</a>
              をご確認ください。
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setAgreedTerms();
              setNeedsTerms(false);
              fetch('/api/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author_id: getUid() }),
              }).catch(() => {});
            }}
          >
            同意して相談をはじめる
          </button>
        </div>
    );
  }

  return (
        <div className="page-main">
        <h2 className="pagetitle">相談する</h2>
        {/* 書く前に「どんな回答が返ってくるか」を見せて、書く労力をかける前の不安を
            減らす（2026-10-12、新規ユーザーの離脱対策として追加）。実例を1件に固定
            せず「みんなの相談」一覧へのリンクにしているのは、特定の相談IDがデータ
            移行や削除で無くなってもリンク切れにならないため。 */}
        <a href="/" className="muted" style={{ fontSize: 12, textDecoration: 'underline', marginBottom: 4 }}>
          こんな回答が届きます（みんなの相談を見る）
        </a>
        {/* 登録不要・匿名で相談できることを、書き始める前に安心材料として一文に
            含めて伝える（2026-10-13、独立した行だと座りが悪かったため統合した）。 */}
        <div className="muted" style={{ marginBottom: 6 }}>
          状況をくわしく教えてください（登録不要・匿名のまま相談できます）
        </div>
        {/* 「公開されます」の注意書きは、以前は入力欄の後ろにあり、書き終えてから
            初めて気づく流れになっていた（個人情報を書いてしまってからでは遅い）。
            書き始める前に目に入るよう入力欄の上に移動し、見た目も他の案内文と
            同じ薄い緑から、注意を引くオレンジ系＋アイコン付きに強化した
            （2026-10-12、「もっと目立たせた方がいい？」との指摘を受けて）。 */}
        <div className="privacy-notice">
          <span className="privacy-notice-icon">⚠️</span>
          <span>
            入力いただいた内容はそのまま「みんなの相談」に公開されます。お名前・住所・学校名など個人を特定できる情報は書かないでください。
          </span>
        </div>
        <textarea
          className="input"
          rows={8}
          placeholder={category ? CATEGORY_EXAMPLES[category] : DEFAULT_PLACEHOLDER}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 子どもプロフィール（2026-10-16追加）。お子さんのプロフィールを1人も登録していない
            会員・未ログインの人には表示されず、今まで通りの画面のまま（childrenListが
            空配列）。2人以上いる場合に「どの子のことか」を選べるようにし、選んだ内容は
            伴走ノート側の同じ子のノートに積み上がる。 */}
        {childrenList.length > 0 && (
          <>
            <div className="muted" style={{ margin: '14px 0 2px' }}>どのお子さんのことですか？</div>
            {/* 「ここも名前は公開されないことを書いておきたい」との要望を受けて追加
                （2026-10-16）。/account/childrenの説明と同じ文言。 */}
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              お子さんの名前は、ここ（ご自身の画面）にのみ表示され、「みんなの相談」など公開ページには表示されません。
            </div>
            <div className="chip-row chip-row-wrap">
              {childrenList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`chip chip-tag${selectedChildId === c.id ? ' active' : ''}`}
                  onClick={() => setSelectedChildId(selectedChildId === c.id ? '' : c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* テーマは、以前は書く前に手動で選んでもらっていたが、相談文を書き終えた
            タイミングでAIが自動判定して選んでおく方式に変更（2026-10-13、
            「選ぶ手間を省きたい」との要望を受けて）。判定結果はガイドラインの
            dos/dontsの選択に関わる重要な項目のため、間違っていたら選び直せるよう
            選択欄自体は残している。 */}
        <div className="muted" style={{ margin: '14px 0 6px' }}>
          テーマ
          {classifying
            ? '（AIが判定中…）'
            : category
            ? '（AIが自動で選びました。違う場合はこちらで選び直してください）'
            : '（相談文を入力すると自動で選ばれます。先に選んでもかまいません）'}
        </div>
        <select
          className="input"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as Category);
            categoryTouchedRef.current = true;
          }}
        >
          <option value="" disabled>選択してください</option>
          {CATEGORY_KEYS.map((key) => (
            <option key={key} value={key}>{CATS[key].label}</option>
          ))}
        </select>

        <div className="muted" style={{ margin: '14px 0 6px' }}>お子さんの学年（任意）</div>
        <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">選択しない</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <div className="muted" style={{ margin: '14px 0 6px' }}>性別（任意）</div>
        <div className="genderrow">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              className={`genderbtn ${gender === g ? 'selected' : ''}`}
              onClick={() => setGender(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}

        <button className="btn-primary" disabled={!text.trim() || !category || submitting || expertSubmitting} onClick={submit}>
          {submitting ? 'どうする先生が考えています…' : 'どうする先生に相談する（無料・AIが回答）'}
        </button>
        {/* 待ち時間の目安を出すことで、「固まった？」と思ってタブを閉じる離脱を防ぐ
            （2026-10-12、新規ユーザーの離脱対策として追加）。 */}
        {submitting && (
          <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
            通常20〜30秒ほどで回答が出ます。このままお待ちください。
          </div>
        )}

        <div className="expertteaser">
          <div className="expertteaser-title">
            {requestedExpert
              ? `${requestedExpert.credential}・${requestedExpert.name}さんに相談する（有料）`
              : '専門家に相談する（有料）'}
            {(!stripeConfigured || (!expertAvailable && !requestedExpert)) && (
              <span className="comingsoon-badge">準備中・近日公開</span>
            )}
          </div>
          {!stripeConfigured ? (
            <div className="expertteaser-desc">
              現在、決済機能の準備中のため、専門家への有料相談はまだご利用いただけません。準備が整い次第、こちらからご利用いただけるようになります。
            </div>
          ) : !expertAvailable && !requestedExpert ? (
            <div className="expertteaser-desc">
              現在、本人確認が完了した専門家（公認心理師など）がまだ登録されていないため、準備中です。登録が整い次第、こちらからご利用いただけるようになります。
            </div>
          ) : memberActive ? (
            <>
              <div className="expertteaser-desc">
                {requestedExpert ? <>ご指名の専門家が、</> : <>登録している専門家が、</>}
                数日以内にテキストで直接回答します。
                {freeQuestionAvailable ? (
                  <>読み放題会員は月1回、無料で質問できます（今月はまだ利用可）。</>
                ) : expertCredits > 0 ? (
                  <>質問チケットが残り{expertCredits}枚あります（1枚消費します）。</>
                ) : (
                  <>今月の無料分は使用済みのため、都度払いとなります。<a href="/account">まとめ買いチケット</a>だと割安です。</>
                )}
                {!requestedExpert && (
                  <>
                    <br />
                    <a href="/experts">どんな専門家が回答していますか？</a>
                  </>
                )}
              </div>
              <button className="btn-secondary" disabled={!text.trim() || !category || submitting || expertSubmitting} onClick={submitToExpert}>
                {expertSubmitting
                  ? '送信中…'
                  : freeQuestionAvailable
                  ? `無料で${requestedExpert ? `${requestedExpert.name}さんに相談する` : '専門家に相談する'}`
                  : expertCredits > 0
                  ? `チケットを使って${requestedExpert ? `${requestedExpert.name}さんに相談する` : '専門家に相談する'}`
                  : `${requestedExpert ? `${requestedExpert.name}さんに相談する` : '専門家に相談する'}`}
              </button>
            </>
          ) : (
            <>
              <div className="expertteaser-desc">
                専門家への質問は、読み放題会員限定です。会員になると、他の利用者への専門家回答もすべて読み放題になります。
              </div>
              <a className="btn-secondary" href="/account">
                読み放題会員に登録する
              </a>
            </>
          )}
        </div>
        </div>
  );
}
