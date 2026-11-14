'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import ConsultationCard from '@/components/ConsultationCard';
import EyeIcon from '@/components/EyeIcon';
import TagChips from '@/components/TagChips';
import PcSidebar from '@/components/PcSidebar';
import TodayQuestionTeaser from '@/components/TodayQuestionTeaser';
import NewsTeaser from '@/components/NewsTeaser';
import FutoukouDataTeaser from '@/components/FutoukouDataTeaser';
import KotobaTeaser from '@/components/KotobaTeaser';
import GohoubiTeaser from '@/components/GohoubiTeaser';
import GohoubiFeedCard from '@/components/GohoubiFeedCard';
import MimamoriShindanTeaser from '@/components/MimamoriShindanTeaser';
import FeaturedGakkoRanking from '@/components/FeaturedGakkoRanking';
import ExpertsTeaser, { ExpertProfile } from '@/components/ExpertsTeaser';
import MyRegionCard from '@/components/MyRegionCard';
import HomeHeroCarousel, { HeroSlide } from '@/components/HomeHeroCarousel';
import { CATS } from '@/lib/categories';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';
import { getThemeDisplayLabel } from '@/lib/searchTags';
import { SENPAI_CREDENTIAL } from '@/lib/config';

// 「専門家が回答した相談」はブランディング上「専門家」専用の集計のため、
// 経験者の回答は含めない（2026-11-01、/expertlistの一覧で同じ
// 区別が抜けていたのに合わせて、ここのバナー件数でも修正。「保護者の解答
// 載ってるね」との指摘を受けて）。
function isExpertAnswered(item: Consultation) {
  return item.request_type === 'expert' && item.expert_status === 'answered' && item.experts?.credential !== SENPAI_CREDENTIAL;
}

// トップページ（モバイルの本文側）の「全国の学び場・居場所を掲載」件数バッジ
// （2026-11-07追加、app/gakko/page.tsxに置いたものと同じ内容をトップページにも設置）。
// 2026-11-08、「PCの数おいてるところ、サイドでもいいがね」との指摘を受けて、
// PC版はこちらの本文側から撤去しPcSidebar.tsx側に移設（テキストサイズもそちらで
// 小さく調整）。モバイル用はこれまで通りこの位置に残す。
// 同日、「この数字おすと、学び場のトップ行くといいリンクつけて」との指摘を受けて、
// バッジ全体を/gakko/matome（学び場トップ・都道府県から探す）へのリンクにした。
// 2026-11-08、「数字の下の内訳、テキストじゃなく小さなカードにしてそれぞれリンク
// できるようにするといい？」との相談を受けて、内訳をチップ状の個別リンクに変更。
// その後「高さの幅とりすぎ」「もっとセンス良く」との指摘を受けて、チップが
// 折り返して何段も重なる見た目から、2列の静かなミニ統計リスト（.facility-count-grid、
// app/globals.css）に変更した。さらに「地味すぎる（テキストだけで映えがない）」との
// 指摘を受けて、種類ごとに絵文字アイコン＋パステル背景色（既存のカラートークンを
// 再利用）を付けて視覚的に区別できるようにした（2026-11-08）。ラベル・件数とも
// 最初から件数の多い順に並んでいるため、そのままの並び順を使っている。
const FACILITY_COUNT_ITEMS: {
  key: keyof FacilityCountBadgeProps['breakdown'];
  label: string;
  href: string;
  icon: string;
  bg: string;
  text: string;
}[] = [
  { key: 'free', label: 'フリースクール', href: '/gakko?type=free', icon: '🏠', bg: 'var(--moss-bg)', text: 'var(--moss-text)' },
  { key: 'teiji', label: '定時制高校', href: '/gakko?type=teiji', icon: '🌙', bg: 'var(--slate-bg)', text: 'var(--slate-text)' },
  { key: 'shien', label: '教育支援センター', href: '/gakko?type=shien', icon: '🏛️', bg: 'var(--teal-bg)', text: 'var(--teal-text)' },
  { key: 'tsushin', label: '通信制高校', href: '/gakko?type=tsushin', icon: '📮', bg: 'var(--clay-bg)', text: 'var(--clay-text)' },
  { key: 'gakko', label: '学びの多様化学校', href: '/gakko', icon: '🏫', bg: 'var(--orange-bg)', text: 'var(--orange-text)' },
  { key: 'alternative', label: 'オルタナティブスクール', href: '/gakko?type=alternative', icon: '🎨', bg: 'var(--lilac-bg)', text: 'var(--lilac-text)' },
  { key: 'innovative', label: '独自教育の私立学校', href: '/gakko?type=innovative', icon: '🌱', bg: 'var(--rose-bg)', text: 'var(--rose-text)' },
  { key: 'online', label: 'オンラインフリースクール', href: '/gakko?type=online', icon: '💻', bg: 'var(--yellow-bg)', text: 'var(--yellow-text)' },
];

type FacilityCountBadgeProps = {
  total: number;
  breakdown: {
    free: number;
    teiji: number;
    shien: number;
    tsushin: number;
    gakko: number;
    alternative: number;
    innovative: number;
    online: number;
  };
  className: string;
};

function FacilityCountBadge({ total, breakdown, className }: FacilityCountBadgeProps) {
  return (
    <div className={`card ${className}`} style={{ alignItems: 'center', gap: 6, textAlign: 'center' }}>
      <Link
        href="/gakko/matome"
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div className="muted" style={{ fontSize: 12 }}>全国の不登校の進路選択肢を掲載</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--orange-text)', lineHeight: 1.2 }}>
          {total.toLocaleString()}件
        </div>
      </Link>
      <div className="facility-count-grid" style={{ fontSize: 11 }}>
        {FACILITY_COUNT_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="facility-count-item"
            style={{ background: item.bg, color: item.text }}
          >
            <span className="facility-count-item-icon">{item.icon}</span>
            <span className="facility-count-item-label">{item.label}</span>
            <span className="facility-count-item-count">{breakdown[item.key]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// スマホトップの自動スライドバナー（2026-11-03追加、4枚とも画像差し替え済み）。
// 1枚目：相談する（AI＋専門家）訴求、2枚目：学びの場を探す訴求、3枚目：伴走ノートの
// 訴求、4枚目：経験者・専門家の募集訴求、という順番（2026-11-03、「2番目に学び場の
// バナーが来るように」との指示で並び替え）。
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'ask',
    href: '/ask',
    src: '/assets/home_cta_banner.jpg',
    alt: '不登校のご家庭に、AI＋専門家から、次の一手を。今の悩みを相談できる、状況を整理できる、学び場の選択肢が見つかる、経験者・専門家の知恵がもらえる。どうする先生で相談してみる。',
  },
  {
    id: 'gakko',
    href: '/gakko/matome',
    src: '/assets/home_hero_gakko.jpg',
    alt: 'お子さんに合う、学びの場を探そう。フリースクール・学びの多様化学校・通信制高校などをまとめて検索。学びの場を探してみる。',
  },
  {
    id: 'notebook',
    href: '/notebook',
    src: '/assets/home_hero_notebook.jpg',
    alt: '伴走ノートで、今の状況を整理しよう。AIとの対話を通して、子どものこと・家庭のこと・今できることを一緒に整理できます。伴走ノートで状況を整理する。',
  },
  {
    id: 'recruit',
    href: '/recruit',
    src: '/assets/home_hero_recruit.jpg',
    alt: '経験者・専門家として、不登校のご家庭を一緒に支えませんか？不登校の経験者も歓迎、心理・教育・福祉の専門家、オンラインで無理なく参加、ご家庭の安心につながる。経験者・専門家として参加する。',
  },
  {
    // 専門家専用のバナー（2026-11-03追加）。PC版（PC_HERO_SLIDESの'pc-expert'）と
    // 同じ内容・リンク先をスマホ用にも追加。上の'recruit'（経験者・専門家どちらにも
    // 向けた統合バナー）とは別に、専門家向けの訴求をピンポイントで出す枠。
    id: 'expert',
    href: '/expert/recruit',
    src: '/assets/home_hero_expert.jpg',
    alt: 'どうする先生を一緒に育てる。専門家の方を募集しています！公認心理師・臨床心理士、スクールカウンセラー、社会福祉士・保健師など。専門家として参加する。',
  },
];

// PC（960px以上）左カラム上部の自動スライドバナー（2026-11-03追加）。
// 「PCも同じようにカルーセルバナーにする」との依頼を受けて、以前の1枚固定の
// 静的バナー（/assets/header_hero_pc.jpg、.home-hero-pc-link）をカルーセルに
// 置き換えた。5枚：相談する→学びの場を探す→伴走ノート→経験者・専門家募集（統合）
// →専門家専用の募集、という順番（2026-11-03、「学び場のバナーを2番目に」との
// 指示で並び替え）。
const PC_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'pc-ask',
    href: '/ask',
    src: '/assets/home_hero_pc_ask.jpg',
    alt: '不登校のご家庭に、AI＋専門家から、次の一手を。子どもの状況に合わせて、今できる具体的なアクションをご提案します。どうする先生に相談してみる。',
  },
  {
    id: 'pc-gakko',
    href: '/gakko/matome',
    src: '/assets/home_hero_pc_gakko.jpg',
    alt: 'お子さんに合う、学びの場を探そう。フリースクール・学びの多様化学校・通信制高校などをまとめて検索。学びの場を探してみる。',
  },
  {
    id: 'pc-notebook',
    href: '/notebook',
    src: '/assets/home_hero_pc_notebook.jpg',
    alt: '相談のあとも、ずっとそばで。あなたのペースで気持ちと変化を記録できる伴走ノート。伴走ノートを使ってみる。',
  },
  {
    id: 'pc-recruit',
    href: '/recruit',
    src: '/assets/home_hero_pc_recruit.jpg',
    alt: 'どうする先生を一緒に育てる。専門家の方・不登校の経験をもつ保護者の方を募集しています！専門家・経験者として参加する。',
  },
  {
    // 専門家専用のバナー（2026-11-03追加）。上の'pc-recruit'（/recruit、
    // 専門家・経験者どちらにも向けた統合バナー）とは別に、専門家向けの訴求を
    // ピンポイントで出す枠として追加。リンク先は専門家専用の登録入り口
    // （/expert/recruit）にする。
    id: 'pc-expert',
    href: '/expert/recruit',
    src: '/assets/home_hero_pc_expert.jpg',
    // 2026-11-03、画像を専門家専用の内容（経験者の文言を除き、資格の例をフォームの
    // 実際の選択肢に合わせたもの）に差し替えたのに合わせて、alt文言も変更。
    alt: 'どうする先生を一緒に育てる。専門家の方を募集しています！公認心理師・臨床心理士、スクールカウンセラー、社会福祉士・保健師など。専門家として参加する。',
  },
];

type SidebarBanner = {
  enabled: boolean;
  image_url: string;
  link_url: string;
  alt_text: string;
} | null;

export default function HomeClient({
  initialItems,
  initialSupervised,
  initialCounts,
  initialTotal,
  initialSidebarBanner,
  initialExperts,
  initialSenpai,
  facilityTotalCount,
  facilityCountBreakdown,
}: {
  initialItems: Consultation[];
  initialSupervised: boolean;
  initialCounts: Record<string, number>;
  initialTotal: number;
  initialSidebarBanner: SidebarBanner;
  initialExperts: ExpertProfile[];
  initialSenpai: ExpertProfile[];
  facilityTotalCount: number;
  facilityCountBreakdown: {
    free: number;
    teiji: number;
    shien: number;
    tsushin: number;
    gakko: number;
    alternative: number;
    innovative: number;
    online: number;
  };
}) {
  const router = useRouter();
  const urlParams = useSearchParams();
  const [category, setCategory] = useState(urlParams.get('category') || 'all');
  const [q, setQ] = useState(urlParams.get('q') || '');
  // 一覧の並び替え・「専門家回答のみ」フィルター（2026-10-15追加）。
  // 当初は「並び替え（単一選択）」＋「専門家回答のみ（独立したON/OFF）」の
  // 組み合わせにしていたが、「専門家回答のみを押した後、他の並び替えを押しても
  // 専門家回答のみの絞り込みが外れない」という分かりにくさの指摘を受け、
  // 4つを排他的なタブ1列にまとめた（押したものだけが効く・タブの見た目にする）。
  type ViewTab = 'new' | 'views' | 'senpai' | 'expert';
  // 「よく読まれている相談」ランキングの「もっと見る」リンク（2026-10-29追加）から
  // /?sort=views で来た場合に、最初から閲覧数順タブを選択した状態で開けるようにする。
  const initialSort = urlParams.get('sort');
  const [viewTab, setViewTab] = useState<ViewTab>(
    initialSort === 'views' || initialSort === 'senpai' || initialSort === 'expert' ? initialSort : 'new'
  );
  const [items, setItems] = useState<Consultation[]>(initialItems);
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // 「読み込み中…」での出し入れで一覧末尾のsentinel要素が一度消えて作り直される
  // （loadingがtrueの間はDOMから外れる）ため、useRefではなくstateで持ち、
  // 要素が新しく作られるたびにIntersectionObserverを張り直す。
  const [loadMoreEl, setLoadMoreEl] = useState<HTMLDivElement | null>(null);
  // 「よく読まれている相談」ランキングの「もっと見る」クリック時に、タブ切り替え＋一覧
  // （viewtabsのすぐ下）までスクロールするために参照する（2026-10-29追加。タブ切り替え
  // だけだと一覧が画面下の方にあるため、クリックしても何も起きていないように見えると
  // の指摘を受けて修正）。
  const viewTabsRef = useRef<HTMLDivElement | null>(null);
  // 「よく読まれている相談」ランキング専用のstate。
  // allItems（以前は新着50件をクライアントソート）だと古い人気記事が入らなかった問題を
  // 解消するため、mount時に sort=views で別途APIを叩いてサイト全体上位を取得する
  // （2026-11-02修正）。
  const [rankingItems, setRankingItems] = useState<Consultation[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const supervised = initialSupervised;
  // チップの件数（「身体面（19）」等）。サーバー側の初期値（検索語を考慮しないサイト
  // 全体の件数）から始め、検索語（q）が変わるたびにその検索語で絞り込んだ件数に
  // 更新する（2026-11-01追加。以前はinitialCountsを常にそのまま使っていたため、
  // 検索中でもチップの件数がサイト全体のままだった）。
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [total, setTotal] = useState<number>(initialTotal);
  // サイドバナーは <PcSidebar> が自前でAPIから取得するため、ここでは
  // initialSidebarBanner は使わない（page.tsx側のサーバー取得・prop自体は
  // 後方互換のため残している）。
  // 専門家一覧（initialExperts）は、これまでPC（960px以上、PcSidebar内）
  // でしか表示しておらず、スマホでは専門家の存在を示す場所が無かったため、
  // 2026-10-18に本流（スマホ含む）にも表示するようにした。page.tsx側で
  // サーバー取得済みのverified:trueな専門家をそのまま使う（PcSidebarは
  // 別途クライアント側で同じ/api/experts/listを取得しているため、ここで
  // 二重に取得しない）。

  // mount時にサイト全体の閲覧数上位をランキング専用で取得する。
  // 新着50件のクライアントソートでは古い人気記事が反映されなかったため（2026-11-02修正）。
  useEffect(() => {
    fetch(`/api/consultations?sort=views&viewer_id=${getUid()}`)
      .then((r) => r.json())
      .then((d) => { if (d.consultations?.length) setRankingItems(d.consultations); })
      .catch(() => {/* ランキング取得失敗時はinitialItemsのままにする */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 旧「さがす」ページのタグ・ランキングなど、別のリンクから ?q= / ?category= 付きで
  // ホームに遷移してきたときに、URLの変化を拾って絞り込みを反映する。
  useEffect(() => {
    const urlQ = urlParams.get('q') || '';
    const urlCategory = urlParams.get('category') || 'all';
    setQ((prev) => (prev === urlQ ? prev : urlQ));
    setCategory((prev) => (prev === urlCategory ? prev : urlCategory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParams]);

  async function fetchResults(
    nextCategory: string,
    nextQ: string,
    { showLoading }: { showLoading: boolean },
    nextTab: ViewTab = viewTab
  ) {
    if (showLoading) setLoading(true);
    const params = new URLSearchParams({ viewer_id: getUid() });
    if (nextCategory !== 'all') params.set('category', nextCategory);
    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (nextTab === 'expert') {
      params.set('expert_answered', '1');
    } else if (nextTab === 'senpai') {
      params.set('senpai_answered', '1');
    } else if (nextTab !== 'new') {
      params.set('sort', nextTab);
    }
    try {
      const res = await fetch(`/api/consultations?${params.toString()}`);
      const d = await res.json();
      setItems(d.consultations || []);
    } finally {
      if (showLoading) setLoading(false);
    }

    // チップの件数（身体面（19）等）も、検索語に合わせて更新する。検索語が無い
    // （＝サーバーが最初に返したサイト全体の件数のままでよい）場合は、余計な
    // リクエストを増やさないようinitialCounts/initialTotalに戻すだけにする
    // （2026-11-01追加）。
    if (!nextQ.trim()) {
      setCounts(initialCounts);
      setTotal(initialTotal);
      return;
    }
    try {
      const countsRes = await fetch(`/api/consultations/counts?q=${encodeURIComponent(nextQ.trim())}`);
      const countsData = await countsRes.json();
      setCounts(countsData.counts || {});
      setTotal(countsData.total || 0);
    } catch {
      // 件数取得に失敗しても一覧自体は表示できているので、黙って諦める。
    }
  }

  function selectCategory(next: string) {
    setCategory(next);
  }

  // 初回表示はサーバー側（匿名扱い）の一覧をそのまま見せ、マウント後に本当の
  // viewer_id（本人・会員かどうか）で静かに再取得してロック解除などの表示を
  // 正しいものに差し替える。以前はこれとは別に「category/q/viewTabが変わったら
  // 取得する」effectも用意していたが、どちらも初回マウント時に発火するため、
  // 同じ一覧を2回リクエストしてしまっていた（2026-10-15、「全体的に動きが遅い」
  // との指摘を受けて発覚・修正）。1つのeffectにまとめ、初回だけは静かに
  // （ローディング表示なし）、2回目以降（絞り込み変更時）はローディング表示ありで
  // 取得するようにした。
  //
  // 【2026-11-01修正】初回のこの「静かな再取得」は、サーバー側（app/page.tsx）の
  // 取得条件に合わせるつもりで固定で 'all'・'' を渡していたが、他ページのタグ
  // （テーマ）リンクから ?q=自閉スペクトラム症 のようなクエリ付きでホームに来た
  // 場合、category/qのstate自体はurlParamsから正しく初期化されているのに、この
  // 初回fetchだけ強制的に「すべて・検索なし」を取得してしまい、検索欄やチップの
  // 見た目は絞り込み済みなのに一覧だけ無関係な全件のままになる不具合があった
  // （「タグ選定してるのに全部でてくる」との指摘を受けて発覚）。サーバー側は
  // 常に全カテゴリ・匿名のクローラー向け一覧を返すだけなので、初回の再取得では
  // 固定値ではなく、urlParamsから初期化済みの実際のcategory/q/viewTabを使う。
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      fetchResults(category, q, { showLoading: false }, viewTab);
      return;
    }
    fetchResults(category, q, { showLoading: true }, viewTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q, viewTab]);

  // 絞り込み（カテゴリ・検索・タブ）が変わったら、表示件数を最初の分だけに戻す。
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, q, viewTab]);

  // 一覧の下端に近づいたら、表示件数を少しずつ増やす（全件を一度に並べない）。
  // ただし自動で増やし続けると、特にスマホで「みんなの相談」がどこまでも長くなり
  // 終わりが見えないとの指摘（2026-10-18）があったため、AUTO_LOAD_MAXまでは
  // スクロールで自動読み込みし、それ以降は手動の「もっと見る」ボタンに切り替える。
  const AUTO_LOAD_MAX = PAGE_SIZE * 3; // 24件まではスクロールで自動読み込み
  useEffect(() => {
    if (!loadMoreEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, items.length, AUTO_LOAD_MAX));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(loadMoreEl);
    return () => observer.disconnect();
  }, [loadMoreEl, items.length]);

  const expertCount = rankingItems.filter(isExpertAnswered).length;
  // ランキングは3件固定表示。.rank-listの枠内スクロールを廃止し（2026-10-21）、
  // ページスクロールとの干渉ストレスを解消した。
  // 同一 author_id の投稿は閲覧数が最も多い1件のみをランキングに含める。
  // 相談件数が少ない段階で同一ユーザーの投稿がワンツーを占めるのを防ぐため。
  const ranking = (() => {
    // rankingItems は mount 時に sort=views で取得済みなので、クライアントソートは
    // 同一author_id の重複排除のためだけ（順序はAPIの降順のままでよい）。
    const sorted = [...rankingItems].sort((a, b) => (b.views || 0) - (a.views || 0));
    const seen = new Set<string>();
    const deduped: typeof sorted = [];
    for (const item of sorted) {
      if (!seen.has(item.author_id)) {
        seen.add(item.author_id);
        deduped.push(item);
      }
      if (deduped.length >= 3) break;
    }
    return deduped;
  })();
  const showExtras = category === 'all' && !q.trim();

  return (
    <div className="app-shell">
      <Header supervised={supervised} />
      <div className="main">
        {/* サイト全体に<h1>が1つも無かったため追加（2026-11-08）。デザインは崩さず、
            スクリーンリーダー・検索エンジン向けのみ（.sr-only、globals.css）。
            既存のヒーローバナー等はあくまで装飾画像のため、ページの主題を示す
            本来のh1としてここに置く。 */}
        <h1 className="sr-only">不登校のお子さんの次の一手をAI・専門家に相談、フリースクールなど学びの場・居場所も検索できる｜どうする先生</h1>
        {/* チャッピー（ChatGPT）に描いてもらったバナー画像（.home-cta、
            /assets/home_cta_banner.jpg）。「TOPの今おいてるチャッピーに作ってもらった
            バナーははずしてね」との指摘を受けて一度スマホ含め全撤去したが、その指摘は
            PCの話（右コラムに「相談する」ボタンを置く方の文脈）で、スマホ側は
            変えなくてよかったとのことで、スマホ分のみ復活させた（2026-10-15）。
            PCでは引き続き.home-cta（CSS側、960px以上でdisplay:none）で非表示にする。
            2026-11-03、「自動スライドで3枚くらい動くようにして」との依頼を受けて、
            1枚固定表示からHomeHeroCarousel（自動スライド）に変更。スライドの中身は
            HERO_SLIDES（このファイル冒頭）参照。 */}
        {showExtras && <HomeHeroCarousel slides={HERO_SLIDES} />}

        {/* 「この数もうちょっとアピールした方がいいかな」との指摘を受けて追加
            （2026-11-07）。モバイル用。PC用は左カラム側（home-main-col内、
            PC版ヒーローの直後）に同じ内容を別途置いている。 */}
        {showExtras && (
          <FacilityCountBadge
            total={facilityTotalCount}
            breakdown={facilityCountBreakdown}
            className="home-count-badge-mobile"
          />
        )}

        {/* 「専門家が回答した相談」のモバイル用バナーは、この位置（検索・一覧より上）
            からは削除した（2026-10-16、「トップのこの場所はいらない」との指摘）。
            PC（960px以上）の右コラム（PcSidebar）側には引き続き表示する。 */}

        {/* 「みんなのデータ」のTOPページ誘導カード（2026-10-16追加）。「今日の質問」
            のような見た目で、一覧より上の目立つ位置に置く（「誘導しやすくしたい」との
            要望を受けて追加）。PC・モバイル共通（expertbannerと違いPC右コラムには
            出していない。日々の内容が変わるため、サイド固定よりメインの導線に置く方が
            自然という判断）。 */}
        {/* PC（960px以上）では右コラム（PcSidebar）側に出すので、ここはモバイル専用
            （2026-10-16、「今日の質問は右コラムの中においてみて」との指摘を受けて）。 */}
        {showExtras && (
          <div className="home-tags-mobile">
            <TodayQuestionTeaser />
          </div>
        )}

        {/* PCの広い画面では、左右を完全に独立した縦積み（flex column）の
            2カラムにする（app/globals.cssの.home-layout参照）。検索ボックスや
            バナーなど高さの違う要素同士を同じ行に揃えようとすると謎の空白が
            できてしまうため、行を揃える作りはやめている。
            モバイルでは今まで通りの1カラム（ランキング→タグ→検索→カテゴリ→一覧の順）。
            以前はshowExtras（カテゴリ「すべて」・検索なしの時だけ）でこのクラスと
            PcSidebarの表示を切っていたため、PCでテーマ・カテゴリ絞り込み中だけ
            サイドバーが消えて1カラムに戻ってしまっていた。ランキング・専門家募集
            バナーなど「すべて」専用のコンテンツは引き続きshowExtras時だけ出すが、
            2カラムのレイアウト自体・サイドバー（ランキングはサイド側では隠す）は
            絞り込み中でも常に出すようにした（2026-10-12、「各テーマ・カテゴリーの
            ページもPCは2コラムに統一して」との指摘を受けて修正）。 */}
        <div className="home-layout home-layout--with-side">
          <div className="home-main-col">
            {/* PC（960px以上）左カラムの一番上に出すヒーロー画像（2026-10-17追加）。
                もとは1枚固定の静的バナーだったが、「PCも同じようにカルーセルバナーに
                する」との依頼を受けて、スマホと同じHomeHeroCarouselコンポーネントを
                variant="pc"で使う形に変更した（2026-11-03）。スマホ幅では
                .home-hero-carousel--pc側（globals.css）で非表示にする。 */}
            <HomeHeroCarousel slides={PC_HERO_SLIDES} variant="pc" />

            {/* 掲載件数バッジのPC版は2026-11-08にPcSidebar.tsxへ移設した
                （「PCの数おいてるところ、サイドでもいいがね」との指摘）。
                モバイル用は上の showExtras && <HomeHeroCarousel slides={HERO_SLIDES} />
                の直後に同じ内容を別途置いている（2026-11-07）。 */}

            {/* 「注目の学び場」ランキング（2026-10-29追加）。「よく読まれている相談」より
                上、ホーム最上部のランキングとして置く（「トップに」との要望）。
                中身がまだ無い（相談件数がまだ少ない）うちはコンポーネント内部でnullを
                返すため、何も表示されない。 */}
            {showExtras && <FeaturedGakkoRanking />}

            {showExtras && rankingItems.length >= 3 && (
              <div className="ranking home-ranking">
                {/* タイトル文字（緑字）自体も「もっと見る」と同じ操作で押せるように
                    （2026-10-29、「緑の字おしてもいけるといいかも」との指摘を受けて）。 */}
                <button
                  type="button"
                  className="ranking-title"
                  style={{ background: 'none', border: 'none', padding: 0, margin: '0 0 4px', cursor: 'pointer', textAlign: 'left', display: 'block', width: '100%' }}
                  onClick={() => {
                    setViewTab('views');
                    viewTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  よく読まれている相談
                </button>
                <div className="rank-list">
                  {ranking.map((item, i) => (
                    <div key={item.id} className="rank-item" role="button" tabIndex={0} onClick={() => router.push(`/result/${item.id}`)}>
                      <span className="rank-num">{i + 1}</span>
                      <span className="rank-q">{item.question.slice(0, 42)}{item.question.length > 42 ? '…' : ''}</span>
                      <span className="rank-views"><EyeIcon /> {item.views || 0}</span>
                    </div>
                  ))}
                </div>
                {/* 「もっと見る」リンク（2026-10-29追加、「よく読まれてる相談のところも、
                    リンクはれるといいなぁ」との指摘を受けて）。注目の学び場ランキングと
                    違い専用ページは作らず、既にある「閲覧数順」タブにそのまま繋ぐ
                    （下の一覧が全件の閲覧数順リストになる）。同じページ内のタブ切り替え
                    なので、通常の<Link>（同一URLへの遷移は再マウントされずtabが
                    切り替わらない）ではなくタブ自体を直接切り替える。
                    タブ切り替えだけだと一覧（viewtabsのすぐ下）が画面下の方にあり、
                    押しても何も起きていないように見えるとの指摘（2026-10-29）を受けて、
                    クリック時にviewtabsまでスムーズスクロールするようにした。 */}
                <button
                  type="button"
                  className="muted"
                  style={{
                    fontSize: 12,
                    textDecoration: 'underline',
                    display: 'inline-block',
                    marginTop: 8,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setViewTab('views');
                    viewTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  もっと見る →
                </button>
              </div>
            )}

            {/* 「不登校に関する最新ニュース」「データで見る不登校」の2つの誘導バナー
                （ニュースは2026-10-29追加、データは2026-11-08追加）。ランキングの
                直下、カテゴリ・テーマ用のチップ列より上に置く。
                2026-11-10、「PCの場合、ニュースの横に2つ並べられない？毎日変わるから
                更新性高いし」との指摘を受けて、PC（960px以上）ではこの2つを
                .home-news-data-rowで横並び（2カラム）表示にした
                （どちらも更新性の高いコンテンツという共通点があるため）。
                モバイルでは引き続き縦積み（.home-news-data-rowがブロック要素のまま
                流れるため、特別なCSSなしで単純に縦に並ぶ）。
                ニュースが1件もないうちはNewsTeaser内部でnullを返し、何も表示されない。
                データ側（.home-datateaser-pc）はPC専用の表示で、モバイルでは
                下の.home-datateaser-mobile側のみ表示する（CSSで出し分け）。 */}
            {showExtras && (
              <div className="home-news-data-row">
                <NewsTeaser />
                <div className="home-datateaser-pc">
                  <FutoukouDataTeaser />
                </div>
              </div>
            )}

            {/* 「データで見る不登校」誘導バナーのモバイル版。PC（960px以上）では
                上の.home-news-data-row内（.home-datateaser-pc）に出すため、
                モバイル専用にしてある（他の見守り力診断・自分の地域登録等と同じ
                PC／モバイル出し分けパターン）。 */}
            {showExtras && (
              <div className="home-datateaser-mobile">
                <FutoukouDataTeaser />
              </div>
            )}

            {/* 拡散をメインに置いた「見守り力タイプ診断」への誘導バナー（2026-11-01追加）。
                ニュースバナーの直下、専門家一覧の上に置く。
                2026-11-01、PC（960px以上）ではPcSidebar側（.home-mimamori-side）に
                移動したため、こちらはモバイル専用にした（「PCはサイドバナーに置いて」
                との指摘を受けて対応）。 */}
            {showExtras && (
              <div className="home-mimamori-mobile">
                <MimamoriShindanTeaser />
              </div>
            )}

            {/* 「専門家一覧」。PC（960px以上）では右コラム（PcSidebar内）に同じものが
                出るため、ここはモバイル専用（2026-10-18、home-experts-mobileをCSS側で
                960px以上は非表示にしている）。「専門家の紹介カードをTOPにも出したい」
                との依頼を受けて追加。専門家がまだ0人の間はExpertsTeaser内の空状態
                （「現在、専門家を募集中です」）がそのまま出る＝実在しない専門家を
                でっち上げて見せることはしない。
                以前はTodayQuestionTeaserの直後（ページ上部）に置いていたが、
                「もうちょい下の方にのせておいてもいいかも、もうちょいコンパクトで」
                との指摘を受け、ニュース誘導の下・タグ絞り込みの上に移動し、
                compactバリアント（ExpertsTeaser側・CSS側のhome-experts--compact）に
                変更した（2026-10-31）。 */}
            {showExtras && (
              <ExpertsTeaser
                experts={initialExperts}
                senpai={initialSenpai}
                title="専門家があなたの相談を見てくれます"
                className="home-experts-mobile home-experts--compact"
                compact
              />
            )}

            {/* 「自分の地域登録」カード（2026-11-01追加、「自分の自治体を登録すると、
                その自治体の情報が優先的に表示されるようにしたい」との要望を受けて）。
                最初はヒーロー画像の直下（ページ最上部）に置いていたが、「この位置
                じゃなくていいかも」との指摘を受けて移動した（2026-11-02）。注目の
                学び場ランキング・ニュース・専門家一覧など、初回訪問者にまず見せたい
                コンテンツより下、タグ絞り込みの上に配置。絞り込み中（showExtrasが
                falseの時）でも地域登録・確認はできた方がよいため、showExtrasの
                ゲートに関わらず常に表示する。未登録時は登録を促す小さなカード、
                登録済みならその地域の学びの場をここに優先表示する
                （components/MyRegionCard.tsx参照。ログイン不要・localStorageのみ）。
                PC（960px以上）では右コラム（PcSidebar内、.home-myregion-side）に
                同じものを出すので、ここはモバイル専用にした（2026-11-03、「PCの場合
                右サイドでよくない？」との指摘を受けて、他の専門家一覧・見守り力診断
                等と同じモバイル／PC出し分けパターンに合わせた）。 */}
            <MyRegionCard className="home-myregion-mobile" />

            {/* PCではサイド側に同じものを出すので、ここはモバイル専用（960px以上では非表示）。
                見出しテキスト「気になるテーマから探す」は、スマホでは無くても
                チップ列だけで用途がわかるとのことで省略した（2026-10-15）。 */}
            {showExtras && (
              <div className="home-tags home-tags-mobile">
                <TagChips />
              </div>
            )}

            <input
              className="input home-search"
              placeholder="キーワードで検索…"
              /* 検索自体はcanonical word（q、例：不登校特例校）のまま行うが、
                 画面に見せる文言だけはTagChipsと同じgetThemeDisplayLabelで
                 新名称に置き換える（2026-10-20、「#学びの多様化学校」タグから
                 遷移した検索ボックスに古い名称「不登校特例校」がそのまま表示
                 されてしまう、との指摘を受けて修正）。 */
              value={getThemeDisplayLabel(q)}
              onChange={(e) => setQ(e.target.value)}
            />

            {/* テーマの絞り込みチップ。選んでいるテーマが背景色の変化だけだとわかりにくいとの
                指摘を受けて、選択中のものにチェックマークを付けた（2026-10-12）。 */}
            <div className="catmenu-row home-chips">
              <button
                className={`catmenu-chip catmenu-all ${category === 'all' ? 'active' : ''}`}
                onClick={() => selectCategory('all')}
              >
                {category === 'all' && <span className="catmenu-check">✓</span>}
                すべて（{total}）
              </button>
              {Object.entries(CATS).map(([key, c]) => (
                <button
                  key={key}
                  className={`catmenu-chip ${c.cls} ${category === key ? 'active' : ''}`}
                  onClick={() => selectCategory(key)}
                >
                  {category === key && <span className="catmenu-check">✓</span>}
                  {c.short}（{counts[key] || 0}）
                </button>
              ))}
            </div>

            {/* /theme（テーマから探す）・/gakko/matome（学びの多様化学校・フリースクールを
                探す）へのテキストリンクは、2026-10-29「この二つのテキストリンクは削除で
                いい」との指摘を受けて削除した。
                /gakko/matomeへのアイコン付きカードは、以前は「進路・勉強」「学校との関係」
                カテゴリに絞り込んだ時だけ表示していたが、「学び場のトップに行く導線も
                強化してね」との指摘を受けて、デフォルトの「すべて」表示（showExtras）でも
                出すようにした（2026-10-29）。検索中・他カテゴリ絞り込み中は出さない
                （文脈とずれるため）。 */}
            {/* 学び場への入口。「条件から学校を探す」（/gakko/shindan）を主役として目立たせ、
                都道府県別の一覧（/gakko/matome）は同じカード内の副リンクにした
                （2026-10-30、「条件から探すを売り出していきたい」との指摘）。
                表示条件は従来のカードと同じ。 */}
            {category === 'course' || category === 'school' || showExtras ? (
              <div
                className="card home-gakko-link"
                style={{ alignItems: 'stretch', gap: 8, margin: '0 0 10px', padding: '12px 14px', border: '2px solid var(--main)', background: 'var(--sub)' }}
              >
                <Link href="/gakko/shindan" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'var(--main)' }}>学び場マッチング</span>
                    <span style={{ display: 'block', fontSize: 12 }}>学年・好きなこと・通う頻度を選ぶだけ。お子さんに合う学校を絞り込めます</span>
                  </span>
                  <span style={{ color: 'var(--main)', fontWeight: 700 }}>›</span>
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <Link href="/gakko/matome" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
                    都道府県別の一覧から探す ›
                  </Link>
                  {/* 助成金・支援制度（/gakko?type=josei）はPC版グローバルメニュー
                      （Header.tsx）には単独リンクがあるが、スマホではそのメニュー自体が
                      非表示（CSS側でPC限定）のため、トップページから辿る手段が無かった。
                      「トップからいける？」との指摘を受けて追加（2026-11-02）。 */}
                  <Link href="/gakko?type=josei" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
                    💴 助成金・支援制度を見る ›
                  </Link>
                  {/* /supportへのテキストリンクはここに追加したが、学び場マッチング
                      （/gakko/shindan）側に入口を移したため削除（2026-11-09）。 */}
                </div>
              </div>
            ) : null}

            {/* 「子供の言葉、ほんとはこう」への入口バナー（2026-11-06追加）。入力の心理的
                障壁が低い（状況説明不要、子の一言をそのまま入れるだけ）ため、学び場
                マッチングと並ぶ主要な入口として、同じ見た目で学び場マッチングの直下に置く。
                相談フォーム（/ask）への自然なブリッジとしても機能させる狙い。
                2026-11-07、class名を学び場マッチングと同じ「home-gakko-link」にしていた
                ため、PC（960px以上）ではapp/globals.cssの
                「.home-main-col .home-gakko-link { display: none !important; }」
                （学び場マッチングはPCヘッダー・サイドに重複導線があるためPCで隠す
                ルール）に巻き込まれ、このバナーごとPCで非表示になっていた
                （「PCからだと入り口がどこにある？」との指摘を受けて発覚）。kotobaには
                PC側に代わりの導線が無いため、別クラス名にしてPCでも表示されるようにした。
                2026-11-07、「デザインをもうちょっとよくして、幅とりすぎるかも」との指摘を
                受けて再調整。.cardのflex-direction: columnが上書きされておらず、中の
                テキストとチェバロンが縦積みになって不必要に背が高くなっていたのが主因
                だったため、flexDirectionを明示的にrow指定。合わせてアイコンを添えて
                視認性を上げつつ、paddingと説明文を短くして全体の占有を抑えた。
                同日、「誘導のテキストがわかりにくい」との指摘を受けて機能名
                「子どもの本音翻訳」を導入し、タイトルをそれに差し替えた。さらに
                「もっとそのネーミングが目立つように」との指摘を受け、名称部分だけ
                色文字から塗りつぶしバッジ（var(--main)背景＋白文字）に変え、他の
                テキストより一段強いコントラストを持たせた。
                2026-11-09、見た目・文言はそのままcomponents/KotobaTeaser.tsxへ
                切り出した。「PCはこの２つはサイドにおくのでいいかも」との指摘を
                受けて、PC（960px以上）ではPcSidebar側（.home-kotoba-side）に
                移動したため、こちらはモバイル専用にした（FutoukouDataTeaserと
                同じ出し分けパターン）。 */}
            {showExtras && (
              <div className="home-kotoba-mobile">
                <KotobaTeaser />
              </div>
            )}

            {/* 「親のご褒美クラブ」（/gohoubi）への入口バナー（2026-11-10追加）。保護者への
                ねぎらい・自己開示のハードルが低いミニツールとして、子どもの本音翻訳の
                直下に同じ見た目で置く。PC（960px以上）ではPcSidebar側
                （.home-gohoubi-side）に出すため、こちらはモバイル専用にする
                （FutoukouDataTeaser・KotobaTeaserと同じ出し分けパターン）。 */}
            {showExtras && (
              <div className="home-gohoubi-mobile">
                <GohoubiTeaser />
              </div>
            )}

            {/* 一覧の並び替え・「専門家回答のみ」絞り込み（2026-10-15追加）。
                「参考になった順」は各カードの「参考になった◯人」と同じlikesで並べている。
                専門家回答の絞り込みは、以前は/expertlistへの別バナーのみで案内していたが、
                ここに統合した。
                当初は「並び替え（単一選択のチップ）」＋「専門家回答のみ（独立ON/OFF）」の
                組み合わせにしていたが、専門家回答のみをONにした後に他のチップを押しても
                絞り込みが外れず分かりにくいとの指摘を受け、4つを排他的なタブ1列に変更。
                見た目も「タブで切り替えている」感が伝わるよう、下線インジケーター付きの
                タブバーにし、すぐ下の一覧（.home-list）と背景・枠を共有してそのまま
                地続きになるようにした（.home-list側はapp/globals.css参照）。 */}
            <div className="viewtabs-card">
            <div className="viewtabs" ref={viewTabsRef}>
              {([
                { key: 'new', label: '新着' },
                { key: 'views', label: '閲覧' },
                { key: 'senpai', label: '経験者回答' },
                { key: 'expert', label: '専門家回答' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  className={`viewtabs-tab ${opt.key === 'expert' ? 'viewtabs-tab--expert' : ''} ${opt.key === 'senpai' ? 'viewtabs-tab--senpai' : ''} ${viewTab === opt.key ? 'active' : ''}`}
                  onClick={() => setViewTab(opt.key)}
                >
                  {opt.key === 'senpai' && (
                    /* 経験者回答アイコン：ぽってり顔 + 吹き出し */
                    <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4, marginTop: -1 }}>
                      <circle cx="8" cy="6" r="3.2" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="6.6" cy="5.5" r="0.55" fill="currentColor"/>
                      <circle cx="9.4" cy="5.5" r="0.55" fill="currentColor"/>
                      <path d="M6.2 7.4c.4.7 1 1.1 1.8 1.1s1.4-.4 1.8-1.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      <path d="M5 10.5c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {opt.key === 'views' && (
                    /* 閲覧アイコン：ぽってりまつ毛目 */
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4, marginTop: -1 }}>
                      {/* まつ毛 */}
                      <path d="M5 5.2L4.3 3.8M8 4.8V3.3M11 5.2L11.7 3.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      {/* 目の輪郭（ぽってり） */}
                      <path d="M1.5 8.5C3.5 5 12.5 5 14.5 8.5C12.5 12 3.5 12 1.5 8.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      {/* 瞳 */}
                      <circle cx="8" cy="8.5" r="2.3" fill="currentColor"/>
                      {/* ハイライト */}
                      <circle cx="9.1" cy="7.4" r="0.7" fill="white"/>
                    </svg>
                  )}
                  {opt.key === 'expert' && (
                    /* 専門家回答アイコン：星バッジ */
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4, marginTop: -1 }}>
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 3.5l1.1 3.3H12.5l-2.8 2 1.1 3.3L8 10.1l-2.8 2 1.1-3.3-2.8-2H6.9z" fill="currentColor"/>
                    </svg>
                  )}
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="home-list home-list--tabbed" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loading && <div className="muted">読み込み中…</div>}
              {!loading && items.length === 0 && (
                <div className="muted">{showExtras ? 'まだ相談がありません。' : '該当する相談が見つかりません。'}</div>
              )}
              {!loading &&
                items.slice(0, visibleCount).map((item, i) => (
                  <Fragment key={item.id}>
                    <ConsultationCard item={item} />
                    {/* 「TOPのフィードにもさりげなくこの投稿の回答だけのせたい」との要望
                        （2026-11-14）。相談本体の並び替え・フィルタ・ページングには
                        一切影響させず、デフォルト表示（カテゴリ絞り込み・検索語なし＝
                        showExtras）の3件目の位置にだけ、最新の「親のご褒美クラブ」
                        投稿を1件差し込む。絞り込み中は出さない（文脈と無関係な投稿が
                        紛れ込むのを避けるため）。 */}
                    {showExtras && i === 1 && <GohoubiFeedCard />}
                  </Fragment>
                ))}
              {/* AUTO_LOAD_MAXまではスクロールで自動読み込み（sentinel要素）。
                  それ以降は手動の「もっと見る」ボタンに切り替える（2026-10-18）。 */}
              {!loading && visibleCount < items.length && visibleCount < AUTO_LOAD_MAX && (
                <div ref={setLoadMoreEl} style={{ height: 1 }} />
              )}
              {!loading && visibleCount >= AUTO_LOAD_MAX && visibleCount < items.length && (
                <button
                  className="btn-secondary"
                  style={{ alignSelf: 'center', marginTop: 4 }}
                  onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, items.length))}
                >
                  もっと見る
                </button>
              )}

              {showExtras && !loading && (
                <img
                  className="recruitnote-banner"
                  src="/assets/recruit_banner.png"
                  alt="専門家の方を募集しています。公認心理師・臨床心理士など、相談への回答を担当していただける方を募集中"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push('/expert/recruit')}
                />
              )}
            </div>
            </div>{/* /viewtabs-card */}
          </div>

          {/* PCではサイド（右カラム）に表示。中身はPcSidebar側で自前取得する
              （ランキングだけは左カラムに出すので、ここでは出さない）。絞り込み中
              でも2カラムのレイアウトは保つため、showExtrasに関わらず常に表示する。
              「専門家が回答した相談」は、絞り込みなし（showExtras）の時だけ出す
              元の挙動に合わせ、showExtrasの時だけexpertCountを渡す
              （2026-10-15、PCでは右コラムに配置するよう修正）。 */}
          <PcSidebar hideRanking expertCount={showExtras ? expertCount : undefined} />
        </div>
      </div>

      {/* コピーライト・特商法等への導線（2026-10-19追加）。固定下部タブバー
          （BottomNav）と重ならないよう、Footer側で下に余白を確保している。 */}
      <Footer />

      <BottomNav />
    </div>
  );
}
