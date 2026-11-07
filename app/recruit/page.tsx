import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import BackButton from '@/components/BackButton';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// 「経験者・専門家募集」の統合ランディングページ（2026-11-03追加）。
//
// もともと専門家向け（/expert/recruit）と経験者向け（/senpai/recruit）は、
// 「保護者と、専門家の入り口とページは別にしたい」という方針（2026-10-30）で
// 入り口ページ自体を分けていた。
// ただし、スマホトップの自動スライドバナー（3枚目）は「経験者・専門家として、
// 不登校のご家庭を一緒に支えませんか？」という、どちらの立場の人にも向けた
// 1枚の訴求になっているため、このバナーのリンク先としては、まずどちらで
// 協力したいかを選んでもらう中間ページが必要になった。/expert/recruit・
// /senpai/recruit という元の2ページ自体は変更せず、そこへの入り口を
// 1枚にまとめたものをこのページとして新設する。

export const metadata: Metadata = {
  title: `経験者・専門家募集｜${SITE_NAME}`,
  description: '不登校のご家庭を一緒に支える経験者・専門家を募集しています。資格をお持ちの専門家の方、不登校を経験されたご家庭ご自身（経験者）、どちらのお立場でもご協力いただけます。',
  alternates: { canonical: `${SITE_URL}/recruit` },
};

export default function RecruitPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main">
        {/* トップバナー・/about・学校ページ等、複数の経路から来る可能性があるため、
            行き先固定のLinkではなくBackButton（router.back()）にしている
            （他の募集系ページと同じ考え方、2026-11-03）。 */}
        <BackButton />
        <h1 className="pagetitle">経験者・専門家として、不登校のご家庭を一緒に支えませんか？</h1>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="qtext">
            「どうする先生」は、不登校のご家庭に向けたAI相談サービスです。AIの回答とは別に、公認心理師・臨床心理士など資格をお持ちの専門家、そして不登校を経験されたご家庭ご自身（経験者）に、利用者からの相談へ直接回答していただく機能があります。ご自身の経験や専門性を活かして、悩むご家庭の力になりませんか？
          </div>
        </div>

        {/* トップバナー（HeroSlide: recruit）の特徴チップと同じ内容を、文章としても
            載せておく（2026-11-03）。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 6 }}>
          <div className="qtext">✓ 不登校の経験者も歓迎</div>
          <div className="qtext">✓ 心理・教育・福祉の専門家</div>
          <div className="qtext">✓ オンラインで無理なく参加</div>
          <div className="qtext">✓ ご家庭の安心につながる</div>
        </div>

        {/* 専門家と経験者は、これまでどおり入り口・登録フォームを分ける
            （2026-10-30の方針を維持）。このページはその手前で、どちらの
            お立場かを選んでもらうための分岐先。 */}
        <Link href="/expert/recruit" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>専門家としてご協力いただける方へ</div>
          <div className="qtext">
            公認心理師・臨床心理士・保健師など、不登校のご家庭への対応について専門知識をお持ちの方を募集しています。登録後、運営が内容を確認したうえで、相談への回答をお願いします。
          </div>
          <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
            専門家募集ページへ ›
          </div>
        </Link>

        <Link href="/senpai/recruit" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>経験者としてご協力いただける方へ</div>
          <div className="qtext">
            資格は不要です。不登校を経験されたご家庭ご自身を募集しています。登録後、運営が内容を確認したうえで、ご自身の体験に基づいた相談への回答をお願いします。
          </div>
          <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
            経験者募集ページへ ›
          </div>
        </Link>

        <Link href="/expert/login" className="backlink" style={{ margin: '-10px 0 14px', fontSize: 13 }}>
          すでに登録済みの方はこちらからログイン →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
