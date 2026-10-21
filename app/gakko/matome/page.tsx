import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { PAGE_CONTENT, GakkoType } from '../page';

// 「学校以外の学びの場・居場所」のまとめページ（2026-10-21追加）。
//
// /gakkoは「学びの多様化学校／フリースクール／オンラインフリースクール／
// 教育支援センター／通信制高校／助成金・支援制度」の6タブをtype=クエリで
// 切り替える構成だが、全タブの canonical が常にbareの/gakko（＝デフォルトの
// 学びの多様化学校タブ）を指すよう統一されているため（app/gakko/page.tsx
// generateMetadata参照）、他のタブは検索エンジン上では/gakkoの重複扱いになり、
// 個別にインデックスされる設計ではない。
//
// 一方で「学校以外の多様な居場所・学び場を比較したい」という、どの1タブにも
// 絞られない目的で来る人がこのページ単体を目的地にする可能性がある（PCヘッダー
// 「学びの場を探す」のラベルを押した時の遷移先として、件数の少ない学びの多様化
// 学校や、フリースクール以外を探している人に合わないとの指摘を受けて追加）。
// そのため、/gakkoのtype=クエリとは別に、独立したパス・独立したcanonicalを持つ
// 専用ページとして作成した。6カテゴリの説明と件数に依存しないリンクのみを置き、
// 都道府県絞り込み等の具体的な一覧表示はしない（各カテゴリのページ側で行う）。
const CATEGORIES: { type: GakkoType; icon: string; href: string }[] = [
  { type: 'gakko', icon: '🏫', href: '/gakko' },
  { type: 'free', icon: '🏠', href: '/gakko?type=free' },
  { type: 'online', icon: '💻', href: '/gakko?type=online' },
  { type: 'shien', icon: '🧑‍🏫', href: '/gakko?type=shien' },
  { type: 'tsushin', icon: '📮', href: '/gakko?type=tsushin' },
  { type: 'josei', icon: '💴', href: '/gakko?type=josei' },
];

const CATEGORY_LABEL: Record<GakkoType, string> = {
  gakko: '学びの多様化学校（旧：不登校特例校）',
  free: 'フリースクール（地域）',
  online: 'オンラインフリースクール',
  shien: '教育支援センター（適応指導教室）',
  tsushin: '通信制高校（広域）',
  josei: '助成金・支援制度',
};

const PAGE_TITLE = `学校以外の学びの場・居場所をまとめて比較｜${SITE_NAME}`;
const PAGE_DESCRIPTION =
  '不登校のお子さんが学校以外に過ごせる場所・学べる場所を、フリースクール・教育支援センター・通信制高校・学びの多様化学校など種類別にまとめて紹介します。それぞれの特徴を比較して、お子さんに合う選択肢を探せます。';

export async function generateMetadata(): Promise<Metadata> {
  const url = `${SITE_URL}/gakko/matome`;
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: PAGE_TITLE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      images: ['/og-image.png'],
    },
  };
}

export default function GakkoMatomePage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>学校以外の学びの場・居場所まとめ</div>
            <div className="qtext">
              不登校のお子さんが過ごしたり学んだりできる場所は、学校以外にもいくつか種類があります。それぞれ運営主体・費用・対象が異なるため、気になるものから詳しく見てみてください。
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.type}
                href={cat.href}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '16px',
                  borderBottom: i < CATEGORIES.length - 1 ? '1px solid var(--border)' : 'none',
                  textDecoration: 'none',
                  color: 'var(--text)',
                }}
              >
                <span style={{ fontSize: 22, flex: '0 0 auto' }} aria-hidden="true">{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{CATEGORY_LABEL[cat.type]}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{PAGE_CONTENT[cat.type].description}</div>
                </div>
                <div className="muted" style={{ flex: '0 0 auto' }}>›</div>
              </Link>
            ))}
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>どれが合うか迷ったら</div>
            <div className="qtext">
              種類ごとの違いだけでは判断しづらいことも多いです。今のお子さんの状況を伝えていただければ、どうする先生が一緒に考えます。登録不要・匿名で利用できます。
            </div>
            <Link href="/ask" className="btn-primary sidebar-ask-btn-pink" style={{ textDecoration: 'none', width: '100%', textAlign: 'center' }}>
              相談する →
            </Link>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
