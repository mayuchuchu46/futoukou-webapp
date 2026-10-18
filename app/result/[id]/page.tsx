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
import { expertDisplayName } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import ResultClient from './ResultClient';
import ViewPing from './ViewPing';
import LikeButton from './LikeButton';
import ReactionButtons from './ReactionButtons';
import ReportButton from '@/components/ReportButton';
import EyeIcon from '@/components/EyeIcon';
import AiUsageUpsell from './AiUsageUpsell';
import SaveConsultationPrompt from './SaveConsultationPrompt';
import FollowupThread from './FollowupThread';
import AskAgainBlock from './AskAgainBlock';
import TagChips from '@/components/TagChips';
import { SEARCH_TAG_CANDIDATES, matchesThemeText } from '@/lib/searchTags';
import { findMentionedSchool } from '@/lib/schoolFacts';

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
  const { count, error } = await supabase
    .from('experts')
    .select('id', { count: 'exact', head: true })
    .eq('verified', true);
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
    .select('*, experts!expert_id(name, display_name, credential)')
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
  const experts = data.experts ? { name: expertDisplayName(data.experts), credential: data.experts.credential } : null;
  const base = { ...data, experts };

  const isExpertAnswered = data.request_type === 'expert' && data.expert_status === 'answered';
  if (isExpertAnswered) {
    return { ...base, answer: '', expert_answer: null, locked: true } as Consultation;
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
  const questionTitle = item.question.replace(/\s+/g, ' ').trim().slice(0, 48);
  const title = `${questionTitle}｜${cat}の相談 - ${SITE_NAME}`;

  const descSource =
    item.request_type === 'ai' && item.answer
      ? item.answer
      : item.question;
  const description = descSource.replace(/\s+/g, ' ').trim().slice(0, 100);

  const url = `${SITE_URL}/result/${item.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
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
          ? `「${questionSnippet}」\n\nどうする先生が出した答えはこちら↓`
          : `「${questionSnippet}」の相談に、どうする先生が出した"今日からできる一手"とは。`,
        url: resultUrl,
        hashtags: 'どうする先生,不登校',
      })}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="share-btn-icon">𝕏</span>
      この回答をシェア
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
          ? `「${questionSnippet}」の相談に、どうする先生は「${answerSnippet}」と回答。`
          : `「${questionSnippet}」の相談に、どうする先生が出した"今日からできる一手"とは。`,
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
  // one_liner（app/api/consult/route.tsで、crisis_detectedな回答以外にだけ生成・保存）が
  // ある相談にだけ出す。この機能の追加前に投稿された相談・crisis_detectedな相談には
  // one_linerが無いため、自然にブロックごと表示されない（isCrisisでの二重チェックはしない）。
  const quoteImageUrl = `${resultUrl}/quote-image`;
  const quoteShareBlock = item.request_type === 'ai' && item.one_liner && (
    <div className="card quote-share-card" style={{ alignItems: 'center', gap: 14 }}>
      <div className="answer-label" style={{ fontSize: 13 }}>この回答を、一言カードでシェア</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={quoteImageUrl}
        alt={item.one_liner}
        width={1080}
        height={1080}
        style={{ width: '100%', maxWidth: 360, height: 'auto', borderRadius: 16, border: '1px solid var(--border)' }}
        loading="lazy"
      />
      <a
        className="share-btn"
        href={`https://twitter.com/intent/tweet?${new URLSearchParams({
          text: `${item.one_liner}\n\nーどうする先生`,
          url: resultUrl,
          hashtags: 'どうする先生,不登校',
        })}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="share-btn-icon">𝕏</span>
        この一言をシェア
      </a>
    </div>
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
    <Link href="/gakko" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>「学びの多様化学校」という選択肢もあります</div>
      <div className="qtext">
        不登校の子どもに合わせた特別な教育課程を組める学校が、文部科学省の指定で全国に84校あります。お住まいの都道府県の指定校を調べられます。
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
            {schoolDetailBlock || gakkoBlock}
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
            </div>

            {!isCrisis && (
              <FollowupThread parentId={item.id} authorId={item.author_id} initialFollowups={followups} />
            )}

            {!isCrisis && (schoolDetailBlock || gakkoBlock)}

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
                #{w}
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
