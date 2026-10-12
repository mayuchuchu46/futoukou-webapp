import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { CATS } from '@/lib/categories';
import { Consultation, metaLabel } from '@/lib/types';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getConsultationsList } from '@/lib/consultations';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import ResultClient from './ResultClient';
import ViewPing from './ViewPing';
import EyeIcon from '@/components/EyeIcon';
import AiUsageUpsell from './AiUsageUpsell';
import SaveConsultationPrompt from './SaveConsultationPrompt';
import TagChips from '@/components/TagChips';

// データベースの最新状態を毎回サーバー側で取得して表示するページなので、
// ビルド時の静的化（prerender）はせず、リクエストごとに生成する。
export const instant = false;

// 専門家回答つきの相談は、サーバー側では「会員ではない匿名の訪問者」として扱う
// （= 本文を伏せたロック状態）。これは今のAPI(/api/consultations)が
// viewer_idなしのアクセスに対して返しているものと同じ状態なので、
// クローラーや未ログインの初回表示として正しい。
// 本人・会員かどうかの判定はブラウザのlocalStorageのIDに依存するため、
// それはクライアント側（ResultClient）で追加取得して表示を更新する。
async function getConsultation(id: string): Promise<Consultation | null> {
  const supabase = getSupabaseAdmin();
  // consultationsからexpertsへの参照はexpert_id（回答した専門家）とrequested_expert_id
  // （指名した専門家）の2つあるため、experts!expert_id と明示して参照先をはっきりさせる
  // （指定しないとPostgRESTがどちらか判断できずエラーになる）。
  const { data, error } = await supabase
    .from('consultations')
    .select('*, experts!expert_id(name, credential)')
    .eq('id', id)
    .eq('hidden', false)
    .single();

  if (error || !data) return null;

  const isExpertAnswered = data.request_type === 'expert' && data.expert_status === 'answered';
  if (isExpertAnswered) {
    return { ...data, answer: '', expert_answer: null, locked: true } as Consultation;
  }
  return { ...data, locked: false } as Consultation;
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
      card: 'summary',
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
  const item = await getConsultation(id);

  // 存在しない相談IDは、検索エンジンに「見つかった薄いページ」として
  // 評価されないよう、ソフト404ではなく正式な404ステータスを返す。
  if (!item) {
    notFound();
  }

  const cat = CATS[item.category] || CATS.other;

  // 回答のすぐ下に出す「似たような相談」。同じカテゴリの他の相談から新しい順に数件。
  const similarPool = await getConsultationsList({ category: item.category, limit: 5 });
  const similarItems = similarPool.filter((d) => d.id !== item.id).slice(0, 4);

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
          author: { '@type': 'Person', name: metaLabel(item) || '保護者' },
          acceptedAnswer: {
            '@type': 'Answer',
            text: answerTextForJsonLd,
            dateCreated: item.created_at,
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
      <Header supervised={false} />
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
        </div>

        <div className="card">
          <div className="qtext qtext-main">💬 {item.question}</div>
        </div>

        {item.request_type === 'expert' ? (
          <Suspense fallback={null}>
            <ResultClient id={id} initialItem={item} />
          </Suspense>
        ) : (
          <>
            <div className="card">
              <div className="answer-label">
                <img src="/assets/sensei_logo.png" alt="" />
                どうする先生の回答・次にやること
              </div>
              <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
                {item.answer}
              </div>
            </div>
            <Suspense fallback={null}>
              <SaveConsultationPrompt id={item.id} authorId={item.author_id} />
            </Suspense>
            <Suspense fallback={null}>
              <AiUsageUpsell />
            </Suspense>
          </>
        )}

        {/* SNS拡散導線の第一弾（2026-10-12）：Xの投稿画面を開くだけの単純なシェア
            リンク。クライアント側の状態を持たないので、サーバー側でそのまま
            リンクを組み立てられる（JSは不要）。 */}
        <a
          className="share-btn"
          href={`https://twitter.com/intent/tweet?${new URLSearchParams({
            text: answerSnippet
              ? `「${item.question.replace(/\s+/g, ' ').trim().slice(0, 40)}」\n\nどうする先生の回答はこうはじまります。\n「${answerSnippet}」\n\n続きはこちら。`
              : `「${item.question.replace(/\s+/g, ' ').trim().slice(0, 40)}」\n\nこの相談に、どうする先生が出した"今日からできる一手"とは。`,
            url: `${SITE_URL}/result/${item.id}`,
            hashtags: 'どうする先生,不登校',
          })}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="share-btn-icon">𝕏</span>
          相談→回答をシェアする
        </a>

        {similarItems.length > 0 && (
          <div className="card">
            <div className="answer-label" style={{ fontSize: 13 }}>似たような相談</div>
            <div className="similarq">
              {similarItems.map((d) => (
                <Link key={d.id} href={`/result/${d.id}`} className="similar-item">
                  <span className="similar-q">
                    {d.question.slice(0, 42)}
                    {d.question.length > 42 ? '…' : ''}
                  </span>
                  <span className="similar-arrow">›</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <TagChips title="他にもこんなテーマの相談があります" />
        </Suspense>

        <Link href="/" className="backlink" style={{ margin: '4px 0 14px' }}>← もどる</Link>

        {/* 閲覧数カウントはSEOに関係ない副作用なので、どちらの種別でもクライアント側で送る */}
        <ViewPing id={id} />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
