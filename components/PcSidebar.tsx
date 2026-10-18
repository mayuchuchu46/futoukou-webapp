'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EyeIcon from './EyeIcon';
import TagChips from './TagChips';
import ExpertsTeaser, { ExpertProfile } from './ExpertsTeaser';
import TodayQuestionTeaser from './TodayQuestionTeaser';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

type SidebarBanner = {
  enabled: boolean;
  image_url: string;
  link_url: string;
  alt_text: string;
} | null;

// ホーム以外のページでも、PCの広い画面では右サイドに
// 「よく読まれている相談」「気になるテーマから探す」「専門家一覧」
// （とサイドバナー）を出す。中身はホームのサイドと同じもので、
// このコンポーネントが自前でAPIから取得する（各ページのサーバー側を
// 変更せずに済むよう、クライアント側で完結させている）。
export default function PcSidebar({
  hideExperts = false,
  hideRanking = false,
  expertCount,
}: { hideExperts?: boolean; hideRanking?: boolean; expertCount?: number } = {}) {
  const router = useRouter();
  const [ranking, setRanking] = useState<Consultation[]>([]);
  const [banner, setBanner] = useState<SidebarBanner>(null);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  // このコンポーネント自体はPC（960px以上）だけ見た目に表示される
  // （app/globals.cssの.pc-sidebar参照）が、以前はスマホでも常にマウントされて
  // 裏でAPIを3つ（ランキング・サイドバナー・専門家一覧。下の<TagChips>内の
  // タグ一覧も含めると4つ）叩いていた。見えないデータのためにスマホの読み込みを
  // 遅くしていたので、matchMediaで実際にPC幅かどうかを判定し、PC幅の時だけ
  // 取得するようにした（2026-10-15、「全体的に動きが遅い」との指摘を受けて修正）。
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 960px)');
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isDesktop || hideRanking) return;
    fetch(`/api/consultations?viewer_id=${encodeURIComponent(getUid())}`)
      .then((r) => r.json())
      .then((d) => {
        const items: Consultation[] = d.consultations || [];
        // .rank-listがスクロール領域になっているので、10件まで取得してスクロールで
        // 10位まで見られるようにする（HomeClient.tsxのランキングと合わせた。2026-10-12）。
        setRanking([...items].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10));
      })
      .catch(() => {});
  }, [isDesktop, hideRanking]);

  useEffect(() => {
    if (!isDesktop) return;
    fetch('/api/sidebar-banner')
      .then((r) => r.json())
      .then((d) => setBanner(d.banner || null))
      .catch(() => {});

    fetch('/api/experts/list')
      .then((r) => r.json())
      .then((d) => setExperts(d.experts || []))
      .catch(() => {});
  }, [isDesktop]);

  const showBanner = !!(banner && banner.enabled && banner.image_url && banner.link_url);

  return (
    <div className="pc-sidebar">
      {/* PC（960px以上）の右カラムにも、目立つ「相談する」への導線を置く
          （2026-10-15、「右コラムにも、相談誘導へのボタンを目立つように置きたい」
          との指摘を受けて追加）。サイドの一番上、常にスクロールせず見える位置に
          大きめのボタンとして配置する。 */}
      {/* .btn-primaryはアプリ全体で使う共通の緑ボタンなので、クラスの色自体は
          変えず、ここだけピンクにする専用クラスを重ねた（2026-10-15、「右コラムの
          相談するボタンの緑はピンク色に統一して」との指摘を受けて）。 */}
      <Link href="/ask" className="btn-primary sidebar-ask-btn-pink" style={{ textDecoration: 'none' }}>
        どうする先生に相談する →
      </Link>

      {/* 「今日の質問」。以前はホーム左カラム上部にあったが、PC（960px以上）では
          この右コラムに移動した（2026-10-16、「今日の質問は右コラムの中においてみて」
          との指摘を受けて）。モバイルではHomeClient.tsx側に残している。 */}
      {isDesktop && <TodayQuestionTeaser />}

      {/* 「専門家が回答した相談」。以前はホーム画面の一番上（2カラムの外）に
          全幅で表示していたが、PC（960px以上）ではこちらの右コラムに出すよう
          変更した（2026-10-15、「専門家が回答した相談の箇所は右コラムに配置して」
          との指摘を受けて）。expertCountはホーム（app/HomeClient.tsx）からのみ
          渡され、他ページのPcSidebarでは渡されない（undefinedなら非表示）。 */}
      {typeof expertCount === 'number' && (
        <div className="expertbanner" role="button" tabIndex={0} onClick={() => router.push('/expertlist')} style={{ cursor: 'pointer' }}>
          <img src="/assets/icon_lock.png" alt="" className="expertbanner-icon" />
          <div className="expertbanner-body">
            <div className="expertbanner-title">専門家が回答した相談{expertCount ? `（${expertCount}件）` : ''}</div>
            <div className="expertbanner-desc">専門家（公認心理師など）本人が直接回答。読み放題会員限定</div>
          </div>
          <span className="expertbanner-cta">›</span>
        </div>
      )}

      {showBanner && (
        <a className="home-adbanner" href={banner!.link_url} target="_blank" rel="noopener sponsored">
          <img src={banner!.image_url} alt={banner!.alt_text} />
        </a>
      )}

      {ranking.length >= 3 && (
        <div className="ranking home-ranking">
          <div className="ranking-title">よく読まれている相談</div>
          <div className="rank-list">
            {ranking.map((item, i) => (
              <div key={item.id} className="rank-item" role="button" tabIndex={0} onClick={() => router.push(`/result/${item.id}`)}>
                <span className="rank-num">{i + 1}</span>
                <span className="rank-q">{item.question.slice(0, 28)}{item.question.length > 28 ? '…' : ''}</span>
                <span className="rank-views"><EyeIcon /> {item.views || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TagChips自体が内部でAPIを叩くため、isDesktopがtrueになるまで
          マウントしない（スマホで見えないのに裏でfetchするのを防ぐ）。 */}
      {isDesktop && (
        <div className="home-tags">
          <TagChips title="気になるテーマから探す" />
        </div>
      )}

      {/* PC（960px以上）のサイドに「お悩み辞典」（/theme・/dictionary/[category]）への
          導線を追加（2026-10-15、「サイドバナーのほうに、お悩み辞典への誘導できる
          見せ方の何かをいれたい」との指摘を受けて）。/theme・/dictionary/[category]は
          これまでアプリ内のどこからもリンクされていなかった孤立ページだったため、
          ホーム画面の「テーマから探す・お悩み辞典を見る」リンクに続き、常時表示される
          PCサイドにも入り口を作る。見た目は既存の.home-expert-cardと揃え、
          新しい見た目を増やさないようにした。 */}
      <div className="home-expert-card" role="button" tabIndex={0} onClick={() => router.push('/theme')} style={{ cursor: 'pointer' }}>
        <div style={{ fontSize: 22, flex: '0 0 auto' }} aria-hidden="true">📖</div>
        <div className="home-expert-body">
          <div className="home-expert-name">不登校お悩み辞典</div>
          <div className="home-expert-desc">テーマ別に、実際の相談とよくある傾向をまとめました</div>
        </div>
        <span className="expertbanner-cta">›</span>
      </div>

      {/* 学びの多様化学校（旧：不登校特例校）の都道府県別一覧（/gakko）への導線。
          上の「不登校お悩み辞典」カードと同じ見た目で、常時表示されるPCサイドにも
          入り口を作る（2026-10-18、元は進路・学校カテゴリの相談結果ページのみだった）。 */}
      <div className="home-expert-card" role="button" tabIndex={0} onClick={() => router.push('/gakko')} style={{ cursor: 'pointer' }}>
        <div style={{ fontSize: 22, flex: '0 0 auto' }} aria-hidden="true">🏫</div>
        <div className="home-expert-body">
          <div className="home-expert-name">学びの多様化学校を探す</div>
          <div className="home-expert-desc">お住まいの都道府県の指定校（旧：不登校特例校）を調べられます</div>
        </div>
        <span className="expertbanner-cta">›</span>
      </div>

      {!hideExperts && <ExpertsTeaser experts={experts} className="home-experts-side" />}
    </div>
  );
}
