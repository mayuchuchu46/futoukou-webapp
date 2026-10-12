'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { CATS, Category } from '@/lib/categories';
import { GRADE_OPTIONS, GENDER_OPTIONS } from '@/lib/types';
import { getUid, hasAgreedTerms, setAgreedTerms, getAskDraft, setAskDraft, clearAskDraft } from '@/lib/uid';

const CATEGORY_KEYS = Object.keys(CATS) as Category[];

// カテゴリごとの入力例。以前は全カテゴリ共通で1つの例文（身体的要因向け）しか
// 出ていなかったため、カテゴリと合わない例文が「何を書けばいいか分からない」の
// 原因になっていた。カテゴリ選択に応じて切り替える（2026-10-12、新規ユーザーの
// 離脱対策として追加）。
const CATEGORY_EXAMPLES: Record<Category, string> = {
  body: '例：小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません…',
  social: '例：中1の娘が、クラスの友達との関係がうまくいかず、最近「学校に行きたくない」と言うようになりました…',
  school: '例：担任の先生と合わないようで、小6の息子が学校に行きたがらなくなりました…',
  will: '例：中2の息子が「もう学校には行かない」と自分の意思で言うようになりました…',
  approach: '例：小4の娘が登校を渋っていて、どこまで無理に行かせるべきか声のかけ方に悩んでいます…',
  course: '例：高校に行くかどうか本人も決めきれず、進路の話をするとふさぎこんでしまいます…',
  dev: '例：発達障害の診断を受けている小3の息子が、学校の環境に慣れず行きたがらなくなりました…',
  home: '例：子どもの不登校への対応方針が夫婦で合わず、家庭内でどう関わるか揉めています…',
  other: '例：子どもが不登校気味で、どう対応すればいいか分からず相談したいです…',
};
const DEFAULT_PLACEHOLDER = CATEGORY_EXAMPLES.body;

type RequestedExpert = { id: string; name: string; credential: string };

// useSearchParams()（?expert=指名用）はレンダリング時点でしか値が確定しないため、
// プリレンダーをブロックしないようにSuspenseで囲む。
export default function AskPage() {
  return (
    <Suspense fallback={null}>
      <AskPageContent />
    </Suspense>
  );
}

function AskPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expertIdParam = searchParams.get('expert');
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

  // 離脱してタブを閉じても、書いた内容が消えないようにする下書き保存。
  // マウント時に一度だけ復元し（draftLoadedが立つまでは保存側のeffectを動かさない
  // ことで、復元前の空の状態で上書きしてしまうのを防ぐ）、以後は入力内容の変化に
  // 合わせて自動保存する（2026-10-12、新規ユーザーの離脱対策として追加）。
  useEffect(() => {
    const draft = getAskDraft();
    if (draft) {
      if (draft.category) setCategory(draft.category as Category);
      setText(draft.text || '');
      setGrade(draft.grade || '');
      setGender(draft.gender || '');
    }
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    setAskDraft({ category, text, grade, gender });
  }, [draftLoaded, category, text, grade, gender]);

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
  }, []);

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
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, text, author_id: getUid(), grade: grade || null, gender: gender || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      clearAskDraft();
      router.push(`/result/${data.consultation.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
      setSubmitting(false);
    }
  }

  async function submitToExpert() {
    if (!text.trim() || !category) return;
    setExpertSubmitting(true);
    setError('');
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      if (data.funded) {
        // 無料枠・チケット消費の場合はStripe決済なしでその場で確定しているので、
        // 直接結果ページへ遷移する。
        clearAskDraft();
        router.push(`/result/${data.consultation_id}`);
        return;
      }
      // Stripe決済へ遷移する場合は、途中でキャンセルして戻ってくる可能性があるため
      // ドラフトは消さずに残す。
      if (!data.url) throw new Error('失敗しました');
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
      setExpertSubmitting(false);
    }
  }

  if (needsTerms) {
    return (
      <div className="app-shell">
        <Header supervised={false} />
        <div className="main">
          <h2 className="pagetitle">ご利用前の確認</h2>
          <div className="card">
            <div className="qtext">
              このアプリの回答はAIによる一般的な情報提供であり、医療的・心理的な診断ではありません。
              重大な判断の際は、専門機関（学校・医療機関・公的な相談窓口）に相談してください。
              詳しくは利用規約をご確認ください。
            </div>
          </div>
          <a className="btn-secondary" href="/terms" target="_blank">利用規約を見る</a>
          <a className="btn-secondary" href="/privacy" target="_blank">プライバシーポリシーを見る</a>
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
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
        <h2 className="pagetitle">質問する</h2>
        {/* 書く前に「どんな回答が返ってくるか」を見せて、書く労力をかける前の不安を
            減らす（2026-10-12、新規ユーザーの離脱対策として追加）。実例を1件に固定
            せず「みんなの相談」一覧へのリンクにしているのは、特定の相談IDがデータ
            移行や削除で無くなってもリンク切れにならないため。 */}
        <a href="/" className="muted" style={{ fontSize: 12, textDecoration: 'underline', marginBottom: 4 }}>
          こんな回答が届きます（みんなの相談を見る）
        </a>
        <div className="muted" style={{ marginBottom: 8 }}>どのような内容ですか？当てはまるテーマを選んでください</div>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
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

        <div className="muted" style={{ margin: '14px 0 6px' }}>状況をくわしく教えてください</div>
        {/* 「公開されます」の注意書きは、以前は入力欄の後ろにあり、書き終えてから
            初めて気づく流れになっていた（個人情報を書いてしまってからでは遅い）。
            書き始める前に目に入るよう入力欄の上に移動し、見た目も他の案内文と
            同じ薄い緑から、注意を引くオレンジ系＋アイコン付きに強化した
            （2026-10-12、「もっと目立たせた方がいい？」との指摘を受けて）。 */}
        <div className="privacy-notice">
          <span className="privacy-notice-icon">⚠️</span>
          <span>
            入力いただいた内容はそのまま「みんなの相談」に公開されます。お名前・住所・学校名など個人を特定できる情報は書かないでください。つらい状況のときは、無理に詳しく書かなくて大丈夫です。
          </span>
        </div>
        <textarea
          className="input"
          rows={8}
          placeholder={category ? CATEGORY_EXAMPLES[category] : DEFAULT_PLACEHOLDER}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

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
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
