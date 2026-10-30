'use client';

import { useEffect, useRef, useState } from 'react';
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
import FeaturedGakkoRanking from '@/components/FeaturedGakkoRanking';
import ExpertsTeaser, { ExpertProfile } from '@/components/ExpertsTeaser';
import { CATS } from '@/lib/categories';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';
import { getThemeDisplayLabel } from '@/lib/searchTags';

function isExpertAnswered(item: Consultation) {
  return item.request_type === 'expert' && item.expert_status === 'answered';
}

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
}: {
  initialItems: Consultation[];
  initialSupervised: boolean;
  initialCounts: Record<string, number>;
  initialTotal: number;
  initialSidebarBanner: SidebarBanner;
  initialExperts: ExpertProfile[];
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
  type ViewTab = 'new' | 'views' | 'likes' | 'expert';
  // 「よく読まれている相談」ランキングの「もっと見る」リンク（2026-10-29追加）から
  // /?sort=views で来た場合に、最初から閲覧数順タブを選択した状態で開けるようにする。
  const initialSort = urlParams.get('sort');
  const [viewTab, setViewTab] = useState<ViewTab>(
    initialSort === 'views' || initialSort === 'likes' || initialSort === 'expert' ? initialSort : 'new'
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
  // バナー・ランキングは絞り込みに関わらず「全体」の集計を出すので、
  // category/q で動く items とは別に保持する。
  const [allItems, setAllItems] = useState<Consultation[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const supervised = initialSupervised;
  const counts = initialCounts;
  const total = initialTotal;
  // サイドバナーは <PcSidebar> が自前でAPIから取得するため、ここでは
  // initialSidebarBanner は使わない（page.tsx側のサーバー取得・prop自体は
  // 後方互換のため残している）。
  // 専門家一覧（initialExperts）は、これまでPC（960px以上、PcSidebar内）
  // でしか表示しておらず、スマホでは専門家の存在を示す場所が無かったため、
  // 2026-10-18に本流（スマホ含む）にも表示するようにした。page.tsx側で
  // サーバー取得済みのverified:trueな専門家をそのまま使う（PcSidebarは
  // 別途クライアント側で同じ/api/experts/listを取得しているため、ここで
  // 二重に取得しない）。

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
    } else if (nextTab !== 'new') {
      params.set('sort', nextTab);
    }
    try {
      const res = await fetch(`/api/consultations?${params.toString()}`);
      const d = await res.json();
      setItems(d.consultations || []);
      if (nextCategory === 'all' && !nextQ.trim() && nextTab === 'new') {
        setAllItems(d.consultations || []);
      }
    } finally {
      if (showLoading) setLoading(false);
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
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      fetchResults('all', '', { showLoading: false });
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

  const expertCount = allItems.filter(isExpertAnswered).length;
  // ランキングは3件固定表示。.rank-listの枠内スクロールを廃止し（2026-10-21）、
  // ページスクロールとの干渉ストレスを解消した。
  // 同一 author_id の投稿は閲覧数が最も多い1件のみをランキングに含める。
  // 相談件数が少ない段階で同一ユーザーの投稿がワンツーを占めるのを防ぐため。
  const ranking = (() => {
    const sorted = [...allItems].sort((a, b) => (b.views || 0) - (a.views || 0));
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
        {/* チャッピー（ChatGPT）に描いてもらったバナー画像（.home-cta、
            /assets/home_cta_banner.jpg）。「TOPの今おいてるチャッピーに作ってもらった
            バナーははずしてね」との指摘を受けて一度スマホ含め全撤去したが、その指摘は
            PCの話（右コラムに「相談する」ボタンを置く方の文脈）で、スマホ側は
            変えなくてよかったとのことで、スマホ分のみ復活させた（2026-10-15）。
            PCでは引き続き.home-cta（CSS側、960px以上でdisplay:none）で非表示にする。 */}
        {showExtras && (
          <Link href="/ask" className="card home-cta">
            <img
              src="/assets/home_cta_banner.jpg"
              alt="「今、どうしたらいい？」どうする先生に相談する。学年や状況をかんたんに入力するだけ。今できることや、次の一手を一緒に整理します。"
              className="home-cta-banner"
            />
          </Link>
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

        {/* 「専門家一覧」。PC（960px以上）では右コラム（PcSidebar内）に同じものが
            出るため、ここはモバイル専用（2026-10-18、home-experts-mobileをCSS側で
            960px以上は非表示にしている）。「専門家の紹介カードをTOPにも出したい」
            との依頼を受けて追加。専門家がまだ0人の間はExpertsTeaser内の空状態
            （「現在、専門家を募集中です」）がそのまま出る＝実在しない専門家を
            でっち上げて見せることはしない。 */}
        {showExtras && (
          <ExpertsTeaser
            experts={initialExperts}
            title="専門家があなたの相談を見てくれます"
            className="home-experts-mobile"
          />
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
            {/* PC（960px以上）左カラムの一番上に出すヒーロー画像（2026-10-17追加、
                ユーザーから提供されたバナー画像を使用）。「左コラムの上でいいんだけど」
                との指摘を受けて、全ページ共通のヘッダーから、ホームの左カラム上部に
                移動した（app/globals.cssの.home-hero-pc参照、スマホ幅では非表示）。
                「バナークリックすると、相談ページに行くようにして、ホバーも入れてね」
                との指摘を受けて、/askへのリンクにし、ホバー時に少し拡大する
                （.home-hero-pc-linkのtransition、globals.css参照）。 */}
            <Link href="/ask" className="home-hero-pc-link">
              <img
                src="/assets/header_hero_pc.jpg"
                alt="不登校のご家庭に、次の一手を一緒に。どうする先生に相談する。"
                className="home-hero-pc"
              />
            </Link>
            {/* 「注目の学び場」ランキング（2026-10-29追加）。「よく読まれている相談」より
                上、ホーム最上部のランキングとして置く（「トップに」との要望）。
                中身がまだ無い（相談件数がまだ少ない）うちはコンポーネント内部でnullを
                返すため、何も表示されない。 */}
            {showExtras && <FeaturedGakkoRanking />}

            {showExtras && allItems.length >= 3 && (
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

            {/* 「不登校に関する最新ニュース」誘導バナー（2026-10-29追加）。ランキングの
                直下、カテゴリ・テーマ用のチップ列より上に置く。PC・モバイル両方で
                同じ位置に出す（home-main-colはPC/モバイル共通の1カラムのため、
                PcSidebar側には別途置いていない）。ニュースが1件もないうちは
                NewsTeaser内部でnullを返し、何も表示されない。 */}
            {showExtras && <NewsTeaser />}

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
            {/* 学び場への入口は、縦に2枚のカードだと場所を取るため、1行2列のコンパクトなタイル
                にまとめた（2026-10-30、「もっとコンパクトにメニューおきたい」との指摘）。
                表示条件は従来のカードと同じ。 */}
            {category === 'course' || category === 'school' || showExtras ? (
              <div className="home-gakko-link" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '0 0 10px' }}>
                {[
                  { href: '/gakko/matome', icon: '🏫', label: '学校・フリースクール', sub: '都道府県別の一覧から見る' },
                  { href: '/gakko/shindan', icon: '🧭', label: '条件から学校をさがす', sub: '学年・通う頻度などで絞り込む' },
                ].map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="card"
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 0, padding: '10px 8px', textDecoration: 'none', color: 'inherit' }}
                  >
                    <span aria-hidden="true" style={{ fontSize: 18 }}>{m.icon}</span>
                    <span>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 13 }}>{m.label}</span>
                      <span className="muted" style={{ display: 'block', fontSize: 11 }}>{m.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}

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
            <div className="viewtabs" ref={viewTabsRef}>
              {([
                { key: 'new', label: '新着順' },
                { key: 'views', label: '閲覧数順' },
                { key: 'likes', label: '参考になった順' },
                { key: 'expert', label: '専門家回答' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  className={`viewtabs-tab ${opt.key === 'expert' ? 'viewtabs-tab--expert' : ''} ${viewTab === opt.key ? 'active' : ''}`}
                  onClick={() => setViewTab(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="home-list home-list--tabbed" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loading && <div className="muted">読み込み中…</div>}
              {!loading && items.length === 0 && (
                <div className="muted">{showExtras ? 'まだ相談がありません。' : '該当する相談が見つかりません。'}</div>
              )}
              {!loading && items.slice(0, visibleCount).map((item) => <ConsultationCard key={item.id} item={item} />)}
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
