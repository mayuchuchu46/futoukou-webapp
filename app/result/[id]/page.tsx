import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cacheLife } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { CATS } from '@/lib/categories';
import { Consultation, metaLabel } from '@/lib/types';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getConsultationsList } from '@/lib/consultations';
import { expertDisplayName, schoolAwareAnswererName, answerFirstLineSnippet } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { SENPAI_CREDENTIAL, EXPERT_VOLUNTEER_MODE } from '@/lib/config';
import ResultClient from './ResultClient';
import QuoteShareCard from './QuoteShareCard';
import ViewPing from './ViewPing';
import LikeButton from './LikeButton';
import ReactionButtons from './ReactionButtons';
import ReportButton from '@/components/ReportButton';
import EyeIcon from '@/components/EyeIcon';
import AiUsageUpsell from './AiUsageUpsell';
import SaveConsultationPrompt from './SaveConsultationPrompt';
import FollowupThread from './FollowupThread';
import AskAgainBlock from './AskAgainBlock';
import AskSimilarBlock from './AskSimilarBlock';
import TagChips from '@/components/TagChips';
import { SEARCH_TAG_CANDIDATES, matchesThemeText, getThemeDisplayLabel } from '@/lib/searchTags';
import { findMentionedSchool } from '@/lib/schoolFacts';
import { findMentionedFreeSchool, findMentionedCorrespondenceSchool, findMentionedOnlineFreeSchool } from '@/lib/facilityLinkMatch';
import { stripSchoolAskBoilerplate } from '@/lib/schoolAskPrefill';

// データベースの最新状態を毎回サーバー側で取得して表示するページなので、
// ビルド時の静的化（prerender）はせず、リクエストごとに生成する。
export const instant = false;

// 専門家回答つきの相談は、サーバー側では「会員ではない匿名の訪問者」として扱う
// （= 本文を伏せたロック状態）。これは今のAPI(/api/consultations)が
// viewer_idなしのアクセスに対して返しているものと同じ状態なので、
// クローラーや未ログインの初回表示として正しい。
// 本人・会員かどうかの判定はブラウザのlocalStorageのIDに依存するため、
// それはクライアント側（ResultClient）で追加取得して表示を更新する。
// 専門家サービスへの導線を出す場所（AI回答直下の免責文など）で、実際にまだ
// 本人確認済みの専門家がいない間は「準備中」と明示するための判定。
// app/api/experts/available/route.ts と同じ条件をサーバーコンポーネント内で直接見る。
// 2026-10-16:「もっとサクサクいけないか」との指摘を受け、専門家の本人確認（verified化）は
// 管理画面での手作業で頻度が低いため'use cache'化し、相談詳細ページ表示ごとの往復を減らす。
async function getExpertAvailable() {
  'use cache';
  cacheLife('minutes');
  const supabase = getSupabaseAdmin();
  // app/api/experts/available/route.tsと同じ条件（EXPERT_VOLUNTEER_MODE中は
  // 先輩保護者も含める。2026-10-31）。
  let query = supabase
    .from('experts')
    .select('id', { count: 'exact', head: true })
    .eq('verified', true);
  if (!EXPERT_VOLUNTEER_MODE) {
    query = query.neq('credential', SENPAI_CREDENTIAL);
  }
  const { count, error } = await query;
  if (error) return false;
  return (count || 0) > 0;
}

async function getConsultation(id: string): Promise<Consultation | null> {
  const supabase = getSupabaseAdmin();
  // consultationsからexpertsへの参照はexpert_id（回答した専門家）とrequested_expert_id
  // （指名した専門家）の2つあるため、experts!expert_id と明示して参照先をはっきりさせる
  // （指定しないとPostgRESTがどちらか判断できずエラーになる）。
  const { data, error } = await supabase
    .from('consultations')
    .select('*, experts!expert_id(id, name, display_name, credential, experienced_school_names)')
    .eq('id', id)
    .eq('hidden', false)
    .single();

  if (error || !data) return null;
  // 続き（parent_idあり）は単独の詳細ページとしては成立しない（元の質問・回答の
  // 文脈がないと意味が分からないため）。呼び出し側（ResultPage）でparent_idへ
  // リダイレクトする（2026-10-16追加）。
  if (data.parent_id) {
    return { ...data, parent_id: data.parent_id } as Consultation;
  }

  // 専門家の本名（experts.name）は本人確認用のため、相談者には表示名のみを渡す
  // （2026-10-13、本名と表示名を分離）。
  const experts = data.experts
    ? {
        // プロフィールページへのリンク用。本人確認用の本名（name）とは違い、idは
        // 公開しても問題ない（2026-10-31、「誰が回答したかプロフィールへの誘導も
        // ほしい」との依頼を受けて追加）。
        id: data.experts.id,
        name: expertDisplayName(data.experts),
        credential: data.experts.credential,
        experienced_school_names: data.experts.experienced_school_names || [],
      }
    : null;
  const base = { ...data, experts };

  const isExpertAnswered = data.request_type === 'expert' && data.expert_status === 'answered';
  if (isExpertAnswered) {
    // 本文は見せないが、最初の1行だけはそのまま見せる（2026-10-31、lib/consultations.ts
    // と同じ対応。「ボカシは最初の1行だけみせるのどう？」との提案を受けて追加）。
    const snippet = data.expert_answer ? answerFirstLineSnippet(data.expert_answer) : null;
    return { ...base, answer: '', expert_answer: null, expert_answer_snippet: snippet, locked: true } as Consultation;
  }
  return { ...base, locked: false } as Consultation;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getConsultation(id);

  if (!item) {
    return { title: `相談が見つかりません | ${SITE_NAME}` };
  }

  const cat = CATS[item.category]?.label || CATS.other.label;
  // 学校詳細ページの「相談する」ボタンは「「◯◯学校」がうちの子に合うかどうか
  // 知りたいです。子どもの特徴：（…）」という定型文をprefillする（lib/schoolAskPrefill.ts
  // 参照）。この定型文部分だけで48文字近くに達するため、そのまま先頭48文字を使うと、
  // 同じ学校に複数の保護者が相談するたびに、実際に書き足した内容（本来ページごとに
  // 差が出るはずの部分）が削られ、title・descriptionがほぼ同一文になってしまっていた
  // （2026-10-29、「聞き方が毎回同じだとSEO的によくない？」との指摘を受けて修正）。
  // 定型文部分を取り除き、保護者が実際に書いた内容を優先してtitle・descriptionに使う。
  const questionForMeta = stripSchoolAskBoilerplate(item.question);
  // 学校の相談は冒頭の「「◯◯学校」がうちの子に合うかどうか知りたいです。」だけで
  // 30文字前後を使うため、そのあとに保護者が書き足した内容が入る余地を残せるよう、
  // 通常の48文字よりやや長めに取る（2026-10-29）。
  const questionTitle = questionForMeta.replace(/\s+/g, ' ').trim().slice(0, 64);
  const title = `${questionTitle}｜${cat}の相談 - ${SITE_NAME}`;

  // 以前はAI回答のあるページだけdescSourceに回答本文を使っていたが、Xでシェアした際の
  // カードプレビュー（og:description）にまで回答の中身が出てしまい、「シェアボタンは
  // 回答ではなく質問をシェアするパターンにしたい（答えは見せず続きを気にさせたい）」
  // というこのページ自体の設計意図（下のshareButtonのtext組み立て部分のコメント参照）と
  // 食い違っていた（2026-10-19、指摘を受けて修正）。常に質問文を使うようにする。
  const description = questionForMeta.replace(/\s+/g, ' ').trim().slice(0, 100);

  const url = `${SITE_URL}/result/${item.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // 希死念慮・自傷等の安全上書きが発動した相談は、一覧・サイトマップから外すのに加えて、
    // 直リンクで来た検索エンジン・クローラーにも「索引しないでほしい」と明示しておく
    // （2026-10-31、lib/consultations.ts・app/sitemap.tsと合わせて対応）。
    ...(item.crisis_detected ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
    },
    twitter: {
      // 相談ごとのOGP画像（opengraph-image.tsx）を大きく表示するため、summaryから変更
      // （2026-10-13）。
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // getConsultation（本体）とgetExpertAvailable（専門家在籍判定、'use cache'済み）は
  // 互いに依存しないため並列に取得する。以前は直列（getConsultation→似た相談→
  // getExpertAvailable）だったため、本来不要な往復1回分の待ち時間が乗っていた
  // （2026-10-16、「もっとサクサクいけないか」との指摘を受けて修正）。
  const [item, expertAvailable] = await Promise.all([getConsultation(id), getExpertAvailable()]);

  // 存在しない相談IDは、検索エンジンに「見つかった薄いページ」として
  // 評価されないよう、ソフト404ではなく正式な404ステータスを返す。
  if (!item) {
    notFound();
  }

  // 「もう一度相談する」で作られた続き（parent_idあり）への直接アクセスは、
  // 元の相談の詳細ページへ飛ばす（続きは単独では文脈が分からないため）。
  if (item.parent_id) {
    redirect(`/result/${item.parent_id}`);
  }

  const cat = CATS[item.category] || CATS.other;

  // 回答のすぐ下に出す「似たような相談」。同じカテゴリの他の相談から新しい順に数件。
  // item.categoryが必要なため、これはgetConsultationの後でしか取得できない。
  const similarPool = await getConsultationsList({ category: item.category, limit: 9 });
  const similarItems = similarPool.filter((d) => d.id !== item.id).slice(0, 8);

  // この相談に対する「その場での返信（ラリー）」の続き一覧（2026-10-16追加）。
  // AIの回答のみが対象（専門家回答・安全上書き回答には出さない）なので、ここでは
  // 常に取得しておき、表示するかどうかはJSX側でrequest_type/isCrisisを見て判断する。
  const { data: followupRows } = await getSupabaseAdmin()
    .from('consultations')
    .select('id, question, answer')
    .eq('parent_id', item.id)
    // 元の相談本体の取得（getConsultation）と同じく、管理画面で非表示にした行は
    // 除外する（2026-10-21、ここにだけ.eq('hidden', false)が抜けており、非表示に
    // したはずの返信がページには表示され続けてしまう不具合があった）。
    .eq('hidden', false)
    .order('created_at', { ascending: true });
  const followups = (followupRows || []) as { id: string; question: string; answer: string }[];

  // クローラー・初回表示用のJSON-LD（QAPage）。
  // 専門家回答がロック中の場合は本文がまだ無いので、AI回答か、
  // ロック解除済みの専門家回答がある場合だけ付与する。
  const answerTextForJsonLd =
    item.request_type === 'ai' ? item.answer : !item.locked ? item.expert_answer : null;

  // シェア文に回答の冒頭を少しだけ見せて続きを気にさせるための抜粋。
  // 専門家回答がロック中など本文が無い場合は抜粋を作らず、質問文のみのテキストにする。
  const answerSnippetSource = answerTextForJsonLd
    ? answerTextForJsonLd.replace(/\s+/g, ' ').trim()
    : '';
  const answerSnippet =
    answerSnippetSource.length > 40 ? `${answerSnippetSource.slice(0, 40)}…` : answerSnippetSource;

  // シェア文中の質問文の抜粋。40文字で切った時に「その子も」のように文が
  // 唐突に終わって見えるとの指摘を受け、answerSnippetと同じく省略時は「…」を
  // 付けるようにした（2026-10-15）。
  // 「質問の方をもう少し長く見せた方が続きを見たくなるのでは」との指摘を受け、
  // Xのシェア文からは回答の抜粋（answerSnippet）自体を削り、「どうする先生が
  // 出した答えは」で止めて続きを気にさせる構成に変更。回答を見せない分、
  // 質問の抜粋は90文字まで見せられるようにした（LINEのシェア文は引き続き
  // answerSnippetも見せる構成なので、こちらも90文字まで伸びた形で使われる）。
  const questionSnippetSource = item.question.replace(/\s+/g, ' ').trim();
  const questionSnippet =
    questionSnippetSource.length > 90 ? `${questionSnippetSource.slice(0, 90)}…` : questionSnippetSource;

  // SNS拡散導線の第一弾（2026-10-12）：Xの投稿画面を開くだけの単純なシェアリンク。
  // クライアント側の状態を持たないので、サーバー側でそのままリンクを組み立てられる
  // （JSは不要）。AI回答・専門家回答の両方から同じ場所に出せるよう、JSX変数として
  // 共通化した（2026-10-12、「もっと詳しく相談してみませんか？」より上に出す配置に
  // 変更した際に、両方の分岐で同じボタンを使い回せるようにするため）。
  const resultUrl = `${SITE_URL}/result/${item.id}`;

  // SNSシェア文中の「◯◯が出した答え」の主語。AI回答は「どうする先生」のままだが、
  // 専門家・先輩保護者が回答した相談を「どうする先生が出した」と書くのは実態と
  // 違う（2026-10-31、「保護者だからそこら辺のテキストかえてみて」との指摘を
  // 受けて修正）。先輩保護者が、質問文に出てくる学校を「話せる学校」として登録して
  // いる場合は、「先輩保護者」ではなく「〇〇の先輩保護者」のように、その学校を
  // 知っている人だと伝わる呼び方にする（「その先輩保護者がその学校のことを知ってる
  // 人だという感じがわかるテキストにしたい」との指摘を受けて追加）。
  const answererLabel =
    item.request_type === 'expert'
      ? schoolAwareAnswererName(item.question, item.experts?.credential, item.experts?.experienced_school_names)
      : 'どうする先生';

  // 「今日からできる一手」は、AI・専門家の回答フォーマット（具体的な行動提案を
  // 1つ出す）には合うが、先輩保護者の回答は「次の一手」の提示というより実体験の
  // 共有なので、同じ言い回しだと実態と合わない（2026-10-31、「今日からできる一手、
  // というのが違う気が！」との指摘を受けて変更。さらに「実体験に基づく答え」でも
  // しっくりこないとのことで、「実体験に基づく回答は？」という問いかけ型の文に
  // 作り直した）。
  const isSenpaiAnswer = item.request_type === 'expert' && item.experts?.credential === SENPAI_CREDENTIAL;
  const noAnswerShareText = isSenpaiAnswer
    ? `「${questionSnippet}」に、${answererLabel}の実体験に基づく回答は？`
    : `「${questionSnippet}」の相談に、${answererLabel}が出した"今日からできる一手"とは。`;

  const shareButton = (
    <a
      className="share-btn"
      href={`https://twitter.com/intent/tweet?${new URLSearchParams({
        // Xで拡散されやすい文に変更（2026-10-15）。具体的な悩みをそのまま見せて
        // 共感を引き、答えを全部見せずに「続きが気になる」余白を作る型。
        // 改行は詰めすぎず、かといって多用もせず1箇所だけに絞っている。
        // 当初は回答の抜粋（answerSnippet）も文中に入れ、「〜というお悩みに、
        // どうする先生が出した答えは…」と繋げる形にしていたが、「質問の引用」
        // 「どうする先生が出した答えはこちら↓」をシンプルに2行で分ける形の方が
        // 読みやすいとのことで変更。回答抜粋は引き続き見せず、質問の抜粋
        // （questionSnippet）だけで悩みの具体性を出す。
        text: answerSnippet
          ? `「${questionSnippet}」\n\n${answererLabel}が出した答えはこちら↓`
          : noAnswerShareText,
        url: resultUrl,
        hashtags: 'どうする先生,不登校',
      })}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="share-btn-icon">𝕏</span>
      {/* 回答本文は見せず、質問（相談内容）だけを見せて続きを気にさせる作りなので、
          ボタンの文言も「回答をシェア」ではなく「相談をシェア」が実態に合っている
          （2026-10-19、「回答シェアじゃなくて相談をシェアってことになるね」との
          指摘を受けて変更）。 */}
      この相談をシェア
    </a>
  );

  // Facebookは投稿文を事前に渡すAPIを提供していない（urlのみ）ため、OGPタグ
  // （og:title・og:description・og:image。個別ページ分はresult/[id]/opengraph-image.tsx
  // 等で既に設定済み）がそのままシェアカードの見た目になる。Xのボタンと並べて置けるよう、
  // 同じ.share-btnを使い、ブランドカラーのみFacebookの青に変えた
  // （2026-10-14、「Facebookシェアボタンも同じやり方で」との要望を受けて追加）。
  const facebookShareButton = (
    <a
      className="share-btn share-btn-facebook"
      href={`https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: resultUrl })}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="share-btn-icon">f</span>
      Facebookでシェア
    </a>
  );

  // LINEは日本の子育て世代の共有先として特に使われるため追加（2026-10-14）。
  // LINE It!のシェアリンクはurlとtext（任意）を受け付ける。
  const lineShareButton = (
    <a
      className="share-btn share-btn-line"
      href={`https://social-plugins.line.me/lineit/share?${new URLSearchParams({
        url: resultUrl,
        text: answerSnippet
          ? `「${questionSnippet}」の相談に、${answererLabel}は「${answerSnippet}」と回答。`
          : noAnswerShareText,
      })}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="share-btn-icon">L</span>
      LINEでシェアする
    </a>
  );

  const shareButtons = (
    <div className="share-btn-row">
      {shareButton}
      {facebookShareButton}
      {lineShareButton}
    </div>
  );

  // 回答を一言に要約した「格言カード」シェア機能（2026-10-17追加）。
  // one_linerの生成は、2026-10-30からオンデマンド化（QuoteShareCard参照）。
  // crisis_detectedな回答・専門家回答（request_type !== 'ai'）には出さない方針は変わらず。
  const quoteShareBlock = item.request_type === 'ai' && !item.crisis_detected && (
    <QuoteShareCard id={item.id} resultUrl={resultUrl} initialOneLiner={item.one_liner ?? null} />
  );

  // 回答を見た後、「このまま終わり」にならないよう、もう一度（別の内容で）相談できる
  // ことを案内するブロック。AI回答・専門家回答どちらでも、同じ場所で使い回せるよう
  // 共通化した（2026-10-14、「相談して回答を見た後の誘導があってもいいかも」との
  // 指摘を受けて追加）。投稿者本人にだけ表示するため、本人確認が必要でクライアント
  // コンポーネント化したAskAgainBlock（2026-10-16）を使う。
  const askAgainBlock = <AskAgainBlock authorId={item.author_id} />;

  // 「進路・勉強」「学校との関係」の相談には、学びの多様化学校（旧：不登校特例校）の
  // 都道府県別一覧ページ（/gakko）への案内を出す（2026-10-18追加）。相談内容からは
  // 居住都道府県が分からないため、都道府県選択は/gakko側で利用者自身に行ってもらう
  // 最小実装（Supabaseにテーブルは作らず、文科省公表データを静的に保持）。
  const gakkoBlock = (item.category === 'course' || item.category === 'school') && (
    <Link href="/gakko/matome" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>学校以外の学びの場という選択肢もあります</div>
      <div className="qtext">
        文部科学省指定の「学びの多様化学校」（全国約84校）のほか、フリースクール・教育支援センター・通信制高校など、お住まいの都道府県で選べる学びの場・居場所をまとめて調べられます。
      </div>
      <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
        都道府県から探す ›
      </div>
    </Link>
  );

  // 相談文（・AI回答）に、学びの多様化学校一覧に載っている具体的な学校名が含まれている
  // 場合は、都道府県一覧へのgakkoBlockより一歩進んだ、その学校自体の紹介ページへの
  // 案内を出す（2026-10-19、「この回答ページから、この学校の詳細ページに飛ばしてあげると
  // よくない？」との指摘を受けて追加）。lib/schoolFacts.tsのfindMentionedSchoolは
  // どうする先生の回答プロンプトへの事実注入と同じ判定ロジックを使っているので、
  // AIが学校の確認済み情報を使って答えたのと同じ学校がここでもリンクされる。
  const mentionedSchool = findMentionedSchool([item.question, answerTextForJsonLd]);
  const schoolDetailBlock = mentionedSchool && (
    <Link href={`/gakko/school/${mentionedSchool.no}`} className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {mentionedSchool.name}{mentionedSchool.branchName ? `（${mentionedSchool.branchName}）` : ''}の詳細情報
      </div>
      <div className="qtext">
        所在地・設置形態・指定年度など、このサイトで確認できている情報をまとめています。
      </div>
      <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
        学校の詳細を見る ›
      </div>
    </Link>
  );

  // 上と同じ考え方を、フリースクール一覧（freeSchools.ts）・通信制高校一覧
  // （correspondenceHighSchools.ts）にも広げたもの（2026-10-21追加）。きっかけ：
  // 「学校法人角川ドワンゴ学園N中等部秋葉原キャンパスについて相談したいです」という
  // 相談で、同校はfreeSchools.ts側のデータだったため、学びの多様化学校専用の
  // mentionedSchoolでは検出できず、詳細ページへのリンクが出ていなかった。
  // 学びの多様化学校の判定で既に一致している場合は、同じ相談に複数の案内カードを
  // 並べて出す必要はないため判定自体をスキップする。
  const mentionedFreeSchool = !mentionedSchool
    ? findMentionedFreeSchool([item.question, answerTextForJsonLd])
    : null;
  const freeSchoolDetailBlock = mentionedFreeSchool && (
    <Link href={`/gakko/free/${mentionedFreeSchool.no}`} className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {mentionedFreeSchool.name}の詳細情報
      </div>
      <div className="qtext">
        所在地など、このサイトで確認できている情報をまとめています。
      </div>
      <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
        施設の詳細を見る ›
      </div>
    </Link>
  );

  const mentionedTsushinSchool =
    !mentionedSchool && !mentionedFreeSchool
      ? findMentionedCorrespondenceSchool([item.question, answerTextForJsonLd])
      : null;
  const tsushinDetailBlock = mentionedTsushinSchool && (
    <Link href={`/gakko/tsushin/${mentionedTsushinSchool.no}`} className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {mentionedTsushinSchool.name}の詳細情報
      </div>
      <div className="qtext">
        本校所在地・設置者など、このサイトで確認できている情報をまとめています。
      </div>
      <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
        学校の詳細を見る ›
      </div>
    </Link>
  );

  // オンラインフリースクール一覧に載っている施設名が含まれていれば詳細ページへ案内する。
  // 他カテゴリと同じ排他チェックは省略（オンラインと地域フリースクールが同時に出ることは
  // まずないため、すべて一致しない場合にのみ検索する形にしてもよいが、シンプルに常に
  // 独立して検索する（2026-10-29追加）。
  const mentionedOnlineFreeSchool = findMentionedOnlineFreeSchool([item.question, answerTextForJsonLd]);
  const onlineSchoolDetailBlock = mentionedOnlineFreeSchool && (
    <Link href={`/gakko/online/${mentionedOnlineFreeSchool.no}`} className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {mentionedOnlineFreeSchool.name}の詳細情報
      </div>
      <div className="qtext">
        運営・対象・特徴など、このサイトで確認できている情報をまとめています。
      </div>
      <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
        詳細を見る ›
      </div>
    </Link>
  );

  // 学びの多様化学校・フリースクール・通信制高校・オンラインフリースクールのどれかが
  // 一致していれば、それをgakkoBlock（都道府県一覧への汎用案内）より優先して出す。
  const anySchoolDetailBlock = schoolDetailBlock || freeSchoolDetailBlock || tsushinDetailBlock || onlineSchoolDetailBlock;

  // lib/prompt.tsの安全上書き（希死念慮・自傷等を検知した場合、具体的な助言をせず
  // ホットライン案内のみを返す指示）が発動した回答かどうか。consultations.crisis_detected
  // （app/api/consult/route.tsで保存）を正とし、その列の追加前に投稿された古い行のために
  // 回答本文そのものからも同じ判定をフォールバックで行う（2026-10-14追加。「希死念慮の相談は
  // 多いので、専門家や公的支援につなげる流れを隠すのではなくしっかり作りたい」との要望を受けて、
  // これまで回答カード下の小さな注意書き1行だけだった案内を、専用の目立つカードに変更する）。
  const isCrisis =
    item.request_type === 'ai' && (!!item.crisis_detected || item.answer.includes('0120-0-78310'));

  // この相談に関連する「不登校お悩み辞典」（カテゴリ・テーマ）への内部リンク。
  // 辞典ページ同士の回遊だけでなく、相談ページ→辞典ページの導線も作る目的で追加
  // （2026-10-15、「各投稿ページの下に、関連ワードの辞典の記載があってもいいかもね」
  // との指摘を受けて）。専門家回答がロック中の場合は本文がまだ無いため、質問文だけで
  // テーマ語の一致を判定する（answerTextForJsonLdはロック中はnullになる）。
  const dictionaryMatchSource = `${item.question} ${answerTextForJsonLd || ''}`;
  const relatedThemeWords = SEARCH_TAG_CANDIDATES.filter((w) => matchesThemeText(dictionaryMatchSource, w));

  // Search ConsoleでQAPage構造化データの非重大エラー（url/author/upvoteCountの欠落）が
  // 検出されたための対応（2026-10-17追加）。このアプリには質問者個人の公開プロフィール
  // ページが無いため、mainEntity.author.url（質問者）はこの相談自体のページを指す形にした
  // （Google側が求めているのは「著者を特定できるURL」で、個人ページが無いサイトでは相談
  // ページ自体を指すのが一般的な代替策）。acceptedAnswer.author（回答者）は、AI回答なら
  // サイト運営者（どうする先生）のOrganization、専門家回答ならexperts/[id]の公開プロフィール
  // ページを持つPersonにした。upvoteCountは既存のlikes（「参考になった」等の件数とは別の、
  // ハートで押す「いいね」カウント）をそのまま使う。
  const answerAuthor =
    item.request_type === 'expert' && item.experts
      ? {
          '@type': 'Person' as const,
          name: item.experts.name,
          ...(item.expert_id ? { url: `${SITE_URL}/experts/${item.expert_id}` } : {}),
        }
      : { '@type': 'Organization' as const, name: SITE_NAME, url: SITE_URL };

  const jsonLd = answerTextForJsonLd
    ? {
        '@context': 'https://schema.org',
        '@type': 'QAPage',
        mainEntity: {
          '@type': 'Question',
          name: item.question,
          text: item.question,
          answerCount: 1,
          dateCreated: item.created_at,
          author: { '@type': 'Person', name: metaLabel(item) || '保護者', url: resultUrl },
          acceptedAnswer: {
            '@type': 'Answer',
            text: answerTextForJsonLd,
            dateCreated: item.created_at,
            url: resultUrl,
            author: answerAuthor,
            upvoteCount: item.likes || 0,
          },
        },
      }
    : null;

  return (
    <div className="app-shell">
      {jsonLd && (
        // eslint-disable-next-line react/no-danger
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
        <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

        <div className="row">
          <div className={`cat-badge ${cat.cls}`} style={{ alignSelf: 'flex-start' }}>
            {cat.label}
          </div>
          <span className="muted">
            {metaLabel(item) ? `${metaLabel(item)}・` : ''}
            <EyeIcon /> {item.views || 0}
          </span>
          {/* 個人情報の混入・不適切な内容などを閲覧者が運営に知らせる手段（2026-10-12追加）。
              自動非表示はせず、運営が管理画面で件数を見て確認する。「参考になった」が
              下の定型リアクション行に移ったので、ここに上げた（2026-10-16）。 */}
          <ReportButton id={item.id} />
        </div>

        <div className="card">
          <div className="qtext qtext-main">💬 {item.question}</div>
        </div>

        {/* 「参考になった」「わかる・うちも同じ・応援」の4つを同じ行にまとめて表示
            （2026-10-16、「4つ表示どう？」との相談を受けて統合）。自由記述のコメント欄は、
            このサービスのテーマ（不登校・希死念慮など）と今の運営体制（モニタリング要員が
            実質いない）だと荒れた時のリスクが大きいため見送り、タップするだけの定型
            リアクションにした。質問の内容への共感・連帯を示すものなので、AI回答・
            専門家回答どちらでも同じ場所（質問カードの直後）に置く。 */}
        <div className="reaction-row">
          <LikeButton id={item.id} initialLikes={item.likes} initialLikedBy={item.liked_by || []} pill />
          <ReactionButtons
            id={item.id}
            initialReactions={item.reactions || {}}
            initialReactedBy={item.reacted_by || {}}
          />
        </div>

        {item.request_type === 'expert' ? (
          <>
            <Suspense fallback={null}>
              <ResultClient id={id} initialItem={item} />
            </Suspense>
            {anySchoolDetailBlock || gakkoBlock}
            {shareButtons}
            {askAgainBlock}
          </>
        ) : (
          <>
            <div className="card">
              <div className="answer-label">
                <img src="/assets/sensei_logo.png" alt="" />
                {isCrisis ? 'どうする先生からのお返事' : 'どうする先生の回答・次にできそうなこと'}
              </div>
              <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
                {item.answer}
              </div>
              {/* AIは一般論ベースの回答で外れることもあるという前提を明示しつつ、
                  「個別の状況は専門家へ」という差別化の文脈で専門家相談への導線も
                  兼ねる一文。AiUsageUpsell（利用回数の閾値後に出る導線）とは別に、
                  AI回答には毎回必ず表示する（2026-10-13追加）。安全上書き（isCrisis）の
                  場合は、この1行の注意書きの代わりに下の専用カードで案内するため、
                  ここでは出さない（2026-10-14）。 */}
              {!isCrisis && (
                <div
                  className="muted"
                  style={{ fontSize: 12, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}
                >
                  {/* 2026-10-13: AIの提案通りに動いて状況が悪化するケースもあり得るため、
                      「あくまで一つの案」「最終判断は保護者自身」というニュアンスを一言添えた。
                      あわせて、専門家（有料・現在準備中）だけでなく、公的な相談機関（/support）
                      にも導線を出すよう変更。上に薄い区切り線を追加し、回答本文との境目を
                      分かりやすくした（2026-10-13）。 */}
                  ⚠️ AIの回答は一つの案で、間違えることもあります。実際にどうするかはご家庭の状況に合わせてご判断ください。重要なことは
                  <Link href="/ask" style={{ color: 'var(--orange-text)', fontWeight: 700, textDecoration: 'underline' }}>
                    専門家に相談する
                  </Link>
                  こともできます{!expertAvailable && '（現在、準備中）'}。
                  <Link href="/support" style={{ color: 'var(--orange-text)', fontWeight: 700, textDecoration: 'underline' }}>
                    公的な相談機関
                  </Link>
                  もご活用ください。
                </div>
              )}
              {/* 学校名が出てくる相談では、lib/schoolFacts.tsのbuildSchoolFactsBlockが学校の
                  校風・教育方針についての回答を含みうる（2026-10-26導入、2026-10-28に
                  web検索ツール前提から静的データ（note欄）前提の指示に書き換え済み）。
                  静的データも移転・制度変更等で最新の状況と異なる可能性があるため、
                  app/support/page.tsx等と同じ文言のパターンで、学校の公式サイトでの確認を
                  促す注記を添える。 */}
              {!isCrisis && mentionedSchool && (
                <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  学校に関する情報は公開情報をもとにしたもので、最新の状況と異なる場合があります。最新の正確な情報は
                  {mentionedSchool.officialUrl ? (
                    <a
                      href={mentionedSchool.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--orange-text)', fontWeight: 700, textDecoration: 'underline' }}
                    >
                      学校の公式サイト
                    </a>
                  ) : (
                    '学校の公式サイト等'
                  )}
                  でご確認ください。
                </div>
              )}
            </div>

            {!isCrisis && (
              <FollowupThread parentId={item.id} authorId={item.author_id} initialFollowups={followups} />
            )}

            {/* 投稿者本人以外には「自分の状況で相談してみる」ボタンを出す（2026-10-22追加）。
                AIがありきたりの回答しか出せない場合でも、自分の子の特徴を追加して
                相談するよう促す導線。FollowupThread（本人向け）と対になる位置に置く。 */}
            {!isCrisis && (
              <AskSimilarBlock authorId={item.author_id} question={item.question} />
            )}

            {!isCrisis && (anySchoolDetailBlock || gakkoBlock)}

            {isCrisis ? (
              // 希死念慮・自傷等の安全上書きが発動した相談専用の案内カード。以前は回答カード下の
              // 小さな注意書き1行だけだったが、「このテーマは相談でかなり多い。隠すのではなく、
              // 専門家や公的支援、相談につなげる流れをしっかり作りたい」との要望を受けて、
              // 目立つ専用カードに変更した（2026-10-14）。番号・文言は/support・CrisisModalと
              // 揃えている。有料導線（AiUsageUpsell）・会員登録導線（SaveConsultationPrompt）・
              // SNSシェアは、命に関わる場面にはふさわしくないため、この相談では出さない。
              <div className="card" style={{ alignItems: 'flex-start', gap: 10, borderLeft: '4px solid #C0392B' }}>
                <div className="answer-label" style={{ fontSize: 14, color: '#C0392B' }}>
                  一人で抱え込まないでください
                </div>
                <div className="qtext" style={{ fontSize: 13 }}>
                  お子さんの安全に関わる内容です。AIの回答だけで終わらせず、下記の窓口にもぜひご連絡ください。すべて無料で、匿名でも相談できます。
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>24時間子供SOSダイヤル</div>
                  <div className="qtext">
                    <a href="tel:0120078310" style={{ fontWeight: 700 }}>0120-0-78310</a>（24時間・無料）
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>よりそいホットライン</div>
                  <div className="qtext">
                    <a href="tel:0120279338" style={{ fontWeight: 700 }}>0120-279-338</a>（無料）
                  </div>
                </div>
                <Link href="/support" className="btn-secondary">
                  ほかの相談窓口も見る
                </Link>
                {/* 以前はテキストリンク1本だけだったが、「専門家への誘導をもっと強化してもいいのでは」
                    との指摘を受け、他の導線（ほかの相談窓口を見る／もう一度相談する）と並ぶ
                    ボタンに変更した。準備中の間もボタン自体は出し、注記で正確な状態を添える
                    （2026-10-14）。
                    リンク先は、新規相談を書く通常の/askではなく、専門家を紹介する/experts
                    にした。「専門家に相談するのリンク先が通常の相談ページに飛ぶのは違和感」
                    との指摘を受けた変更（2026-10-14）。/expertsは専門家未登録の間も
                    「準備が整い次第掲載されます」という案内付きの紹介ページとして機能する。 */}
                <Link href="/experts" className="btn-primary">
                  専門家に相談する
                </Link>
                {!expertAvailable && (
                  <div className="muted" style={{ fontSize: 12 }}>
                    現在、本人確認済みの専門家の登録待ちのため準備中です。登録が整い次第ご利用いただけます。
                  </div>
                )}
              </div>
            ) : (
              <Suspense fallback={null}>
                <SaveConsultationPrompt id={item.id} authorId={item.author_id} />
              </Suspense>
            )}
            {askAgainBlock}
            {!isCrisis && (
              <>
                {/* 「もっと詳しく相談してみませんか？」（AiUsageUpsell、有料導線）より上に
                    シェアボタンを置く。無料でできる行動（シェア）を、課金に近い案内より
                    先に提示する並び（2026-10-12）。 */}
                {shareButtons}
                {quoteShareBlock}
                <Suspense fallback={null}>
                  <AiUsageUpsell />
                </Suspense>
              </>
            )}
          </>
        )}

        {similarItems.length > 0 && (
          <div className="card">
            <div className="answer-label" style={{ fontSize: 13 }}>似たような相談</div>
            <div className="similarq">
              {similarItems.map((d) => {
                const dCat = CATS[d.category] || CATS.other;
                const answerPreview = d.locked
                  ? null
                  : d.answer
                    ? d.answer.replace(/\s+/g, ' ').trim().slice(0, 56) +
                      (d.answer.replace(/\s+/g, ' ').trim().length > 56 ? '…' : '')
                    : null;
                return (
                  <Link key={d.id} href={`/result/${d.id}`} className="similar-item">
                    <div className="similar-item-main">
                      <div className="row" style={{ marginBottom: 4 }}>
                        <span className={`cat-badge ${dCat.cls}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                          {dCat.label}
                        </span>
                      </div>
                      <div className="similar-q">
                        {d.question.slice(0, 60)}
                        {d.question.length > 60 ? '…' : ''}
                      </div>
                      {d.locked ? (
                        <div className="similar-a similar-a-locked">🔒 専門家が回答済み</div>
                      ) : answerPreview ? (
                        <div className="similar-a">💬 {answerPreview}</div>
                      ) : null}
                      <div className="similar-cta">続きを読む ›</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <TagChips title="他にもこんなテーマの相談があります" wrap />
        </Suspense>

        {/* この相談のカテゴリ・一致したテーマ語の「不登校お悩み辞典」ページへのリンク。
            カテゴリは必ず1つあるのでリンクも必ず1つ以上出る（2026-10-15追加）。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="muted" style={{ fontSize: 13 }}>関連する「不登校お悩み辞典」</div>
          <div className="chip-row chip-row-wrap">
            <Link
              href={`/dictionary/${item.category}`}
              className="chip chip-tag"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              {cat.label}
            </Link>
            {relatedThemeWords.map((w) => (
              <Link
                key={w}
                href={`/dictionary/theme/${encodeURIComponent(w)}`}
                className="chip chip-tag"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                {/* 検索・URL用のcanonical word（例：不登校特例校）と画面表示名
                    （学びの多様化学校）を分けるため、getThemeDisplayLabelを通す
                    （2026-10-19、「#不登校特例校というタグ、これは違うよね」との
                    指摘を受けて修正。/gakko/RelatedConsultations.tsxでは既に
                    この置き換えをしていたが、ここだけ生の語を出していた）。 */}
                #{getThemeDisplayLabel(w)}
              </Link>
            ))}
          </div>
        </div>

        {/* 2026-10-13: ここにあった末尾の「← もどる」は、BottomNav側に全ページ共通で
            追加した「戻る」（固定ナビの直上）と位置・役割が重複するため削除した。 */}
        {/* 閲覧数カウントはSEOに関係ない副作用なので、どちらの種別でもクライアント側で送る */}
        <ViewPing id={id} />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
