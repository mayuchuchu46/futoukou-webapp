'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import EyeIcon from './EyeIcon';
import TagChips from './TagChips';
import ExpertsTeaser, { ExpertProfile } from './ExpertsTeaser';
import TodayQuestionTeaser from './TodayQuestionTeaser';
import MimamoriShindanTeaser from './MimamoriShindanTeaser';
import MyRegionCard from './MyRegionCard';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';
import { TOTAL_FACILITY_COUNT, FACILITY_COUNT_BREAKDOWN } from '@/lib/facilityCount';

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
  const [senpai, setSenpai] = useState<ExpertProfile[]>([]);
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
        // 3件固定表示。枠内スクロール廃止（2026-10-21、HomeClient.tsxと合わせた）。
        setRanking([...items].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3));
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

    fetch('/api/experts/senpai-list')
      .then((r) => r.json())
      .then((d) => setSenpai(d.senpai || []))
      .catch(() => {});
  }, [isDesktop]);

  const showBanner = !!(banner && banner.enabled && banner.image_url && banner.link_url);

  // 「不登校お悩み辞典」と「学校・フリースクール等を探す」への導線。以前は/gakkoへの
  // 1本のリンクにまとめていたが、/gakkoが「学びの多様化学校／フリースクール／
  // 教育支援センター／オンラインフリースクール／通信制高校」の5カテゴリに増えたため、
  // それぞれへ直接飛べるようにカテゴリ別のリンクに分けた（2026-10-18、「PCはカテゴリ
  // ごとにメニュー出してもいいのでは」との指摘を受けて）。
  // その後、PCではヘッダーのグローバルメニュー（学びの場を探す／お悩み辞典の
  // プルダウン）にも同じ内容を追加したが、「PCのサイドのメニューも残してね」との
  // 指摘を受け、こちらのPCサイド版は削除せず残す（ヘッダーのプルダウンと重複する形に
  // なるが、両方に導線を置く方針）（2026-10-18）。
  const gakkoLinks = (
    <div className="card" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
      <Link
        href="/theme"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)' }}
      >
        <span style={{ fontSize: 18 }} aria-hidden="true">📖</span>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>不登校お悩み辞典</span>
        <span className="muted">›</span>
      </Link>
      {/* 「学び場トップ（/gakko/matome、都道府県別に全カテゴリを横断して探せるまとめ
          ページ）」への導線（2026-10-29追加）。このカード自体には元々カテゴリ別の
          個別リンクしか無く、まとめページ自体への行き方が無かった（ホーム側の
          テキストリンクが唯一の入り口だったが、「この二つのテキストリンクは削除で
          いい」との指摘で撤去済み）。「学び場のトップに行く導線も強化してね」との
          指摘を受けて、カテゴリ一覧の一番上にまとめページへの行を追加した。 */}
      <Link
        href="/gakko/matome"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)' }}
      >
        <span style={{ fontSize: 18 }} aria-hidden="true">🧭</span>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>学び場トップ（都道府県から探す）</span>
        <span className="muted">›</span>
      </Link>
      {[
        { href: '/gakko', icon: '🏫', label: '学びの多様化学校' },
        { href: '/gakko?type=free', icon: '🏠', label: 'フリースクール（地域）' },
        { href: '/gakko?type=shien', icon: '🧑‍🏫', label: '教育支援センター' },
        { href: '/gakko?type=online', icon: '💻', label: 'オンラインフリースクール' },
        { href: '/gakko?type=tsushin', icon: '📮', label: '通信制高校（広域）' },
        { href: '/gakko?type=teiji', icon: '🌙', label: '定時制高校' },
        { href: '/gakko?type=josei', icon: '💴', label: '助成金・支援制度' },
        // 「ニュース一覧への導線が弱い」との指摘を受けて追加（2026-10-29）。
        // このカード（gakkoLinks）はPC右サイド・モバイル本文下の両方、
        // ほぼ全ページに出るため、ホーム限定のNewsTeaserバナーよりも
        // 恒常的な導線になる。
        { href: '/news', icon: '📰', label: 'ニュース' },
      ].map((item, i, arr) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '13px 16px',
            borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            textDecoration: 'none',
            color: 'var(--text)',
          }}
        >
          <span style={{ fontSize: 18 }} aria-hidden="true">{item.icon}</span>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{item.label}</span>
          <span className="muted">›</span>
        </Link>
      ))}
    </div>
  );

  return (
    <>
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

      {/* 掲載件数バッジ（2026-11-08追加）。もとはホーム本文側（PC・モバイル共通）に
          置いていたが、「PCの数おいてるところ、サイドでもいいがね」との指摘を受けて
          PC版はこちらに移設。幅が狭いサイド向けに本文版より一回り小さい文字サイズに
          している。「この数字おすと、学び場のトップ行くといいリンクつけて」との
          指摘を受けて、カード全体を/gakko/matome（学び場トップ）へのリンクにした。
          当初はgakkoLinksの直前（サイド最下部）に置いていたが、「上の方において」
          との指摘を受けて、スクロールせず見える「相談する」ボタン直下に移動した。
          2026-11-08、HomeClient.tsx側と同じ理由で、内訳をそれぞれの学び場タブへ
          直接飛べるリンクに変更した（件数＋タイトル部分は引き続き/gakko/matomeへの
          リンク）。その後「高さの幅とりすぎ」「もっとセンス良く」との指摘を受けて、
          HomeClient.tsx側と同じ2列のミニ統計リスト（.facility-count-grid、
          app/globals.css）に変更し、さらに「地味すぎる」との指摘を受けて
          種類ごとにアイコン＋パステル背景色を付けた（2026-11-08）。 */}
      <div className="card" style={{ alignItems: 'center', gap: 4, textAlign: 'center' }}>
        <Link href="/gakko/matome" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div className="muted" style={{ fontSize: 10 }}>全国の不登校の進路選択肢を掲載</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--orange-text)', lineHeight: 1.2 }}>
            {TOTAL_FACILITY_COUNT.toLocaleString()}件
          </div>
        </Link>
        <div className="facility-count-grid" style={{ fontSize: 10 }}>
          <Link href="/gakko?type=free" className="facility-count-item" style={{ background: 'var(--moss-bg)', color: 'var(--moss-text)' }}>
            <span className="facility-count-item-icon">🏠</span>
            <span className="facility-count-item-label">フリースクール</span>
            <span className="facility-count-item-count">{FACILITY_COUNT_BREAKDOWN.free}</span>
          </Link>
          <Link href="/gakko?type=teiji" className="facility-count-item" style={{ background: 'var(--slate-bg)', color: 'var(--slate-text)' }}>
            <span className="facility-count-item-icon">🌙</span>
            <span className="facility-count-item-label">定時制高校</span>
            <span className="facility-count-item-count">{FACILITY_COUNT_BREAKDOWN.teiji}</span>
          </Link>
          <Link href="/gakko?type=shien" className="facility-count-item" style={{ background: 'var(--teal-bg)', color: 'var(--teal-text)' }}>
            <span className="facility-count-item-icon">🏛️</span>
            <span className="facility-count-item-label">教育支援センター</span>
            <span className="facility-count-item-count">{FACILITY_COUNT_BREAKDOWN.shien}</span>
          </Link>
          <Link href="/gakko?type=tsushin" className="facility-count-item" style={{ background: 'var(--clay-bg)', color: 'var(--clay-text)' }}>
            <span className="facility-count-item-icon">📮</span>
            <span className="facility-count-item-label">通信制高校</span>
            <span className="facility-count-item-count">{FACILITY_COUNT_BREAKDOWN.tsushin}</span>
          </Link>
          <Link href="/gakko" className="facility-count-item" style={{ background: 'var(--orange-bg)', color: 'var(--orange-text)' }}>
            <span className="facility-count-item-icon">🏫</span>
            <span className="facility-count-item-label">学びの多様化学校</span>
            <span className="facility-count-item-count">{FACILITY_COUNT_BREAKDOWN.gakko}</span>
          </Link>
          <Link href="/gakko?type=alternative" className="facility-count-item" style={{ background: 'var(--lilac-bg)', color: 'var(--lilac-text)' }}>
            <span className="facility-count-item-icon">🎨</span>
            <span className="facility-count-item-label">オルタナティブスクール</span>
            <span className="facility-count-item-count">{FACILITY_COUNT_BREAKDOWN.alternative}</span>
          </Link>
          <Link href="/gakko?type=innovative" className="facility-count-item" style={{ background: 'var(--rose-bg)', color: 'var(--rose-text)' }}>
            <span className="facility-count-item-icon">🌱</span>
            <span className="facility-count-item-label">独自教育の私立学校</span>
            <span className="facility-count-item-count">{FACILITY_COUNT_BREAKDOWN.innovative}</span>
          </Link>
          <Link href="/gakko?type=online" className="facility-count-item" style={{ background: 'var(--yellow-bg)', color: 'var(--yellow-text)' }}>
            <span className="facility-count-item-icon">💻</span>
            <span className="facility-count-item-label">オンラインフリースクール</span>
            <span className="facility-count-item-count">{FACILITY_COUNT_BREAKDOWN.online}</span>
          </Link>
        </div>
      </div>

      {/* 「今日の質問」。以前はホーム左カラム上部にあったが、PC（960px以上）では
          この右コラムに移動した（2026-10-16、「今日の質問は右コラムの中においてみて」
          との指摘を受けて）。モバイルではHomeClient.tsx側に残している。 */}
      {isDesktop && <TodayQuestionTeaser />}

      {/* 拡散をメインに置いた「見守り力タイプ診断」への誘導バナー（2026-11-01追加）。
          以前はHomeClient.tsx本文側（PC・モバイル共通）にのみ出していたが、
          「PCはサイドバナーに置いて」との指摘を受けてこちらに移動。本文側は
          モバイル専用（.home-mimamori-mobile）にした。このコンポーネントは
          ホーム以外のページのPcSidebarにも出る（他の導線と同様の扱い）。 */}
      {isDesktop && (
        <div className="home-mimamori-side">
          <MimamoriShindanTeaser />
        </div>
      )}

      {/* 「専門家が回答した相談」。以前はホーム画面の一番上（2カラムの外）に
          全幅で表示していたが、PC（960px以上）ではこちらの右コラムに出すよう
          変更した（2026-10-15、「専門家が回答した相談の箇所は右コラムに配置して」
          との指摘を受けて）。expertCountはホーム（app/HomeClient.tsx）からのみ
          渡され、他ページのPcSidebarでは渡されない（undefinedなら非表示）。 */}
      {typeof expertCount === 'number' && (
        <div className="expertbanner" role="button" tabIndex={0} onClick={() => router.push('/expertlist')} style={{ cursor: 'pointer' }}>
          <Image src="/assets/icon_lock.png" alt="" className="expertbanner-icon" width={22} height={22} />
          <div className="expertbanner-body">
            <div className="expertbanner-title">専門家が回答した相談{expertCount ? `（${expertCount}件）` : ''}</div>
            <div className="expertbanner-desc">専門家（公認心理師など）本人が直接回答。読み放題会員限定</div>
          </div>
          <span className="expertbanner-cta">›</span>
        </div>
      )}

      {showBanner && (
        <a className="home-adbanner" href={banner!.link_url} target="_blank" rel="noopener sponsored">
          {/* これは管理画面から設定する外部URL（Supabaseストレージ等）の画像で、
              next/imageを使うにはnext.config.tsのimages.remotePatternsに
              そのホストを登録する必要がある（未設定だと実行時エラーになる）。
              2026-11-08、他のアイコン（ローカルファイル）をnext/image化した際に、
              設定変更が必要なこの画像だけは安全のため対象外にした。 */}
          <img src={banner!.image_url} alt={banner!.alt_text} />
        </a>
      )}

      {ranking.length >= 3 && (
        <div className="ranking home-ranking">
          {/* タイトル文字（緑字）自体も押せるように（2026-10-29、「緑の字おしても
              いけるといいかも」との指摘を受けて）。HomeClient.tsx側と違いこのコンポーネントは
              ホーム以外のページにも出るため、タブ切り替えではなく通常のページ遷移にする。 */}
          <Link href="/?sort=views" className="ranking-title" style={{ display: 'block', textDecoration: 'none' }}>
            よく読まれている相談
          </Link>
          <div className="rank-list">
            {ranking.map((item, i) => (
              <div key={item.id} className="rank-item" role="button" tabIndex={0} onClick={() => router.push(`/result/${item.id}`)}>
                <span className="rank-num">{i + 1}</span>
                <span className="rank-q">{item.question.slice(0, 28)}{item.question.length > 28 ? '…' : ''}</span>
                <span className="rank-views"><EyeIcon /> {item.views || 0}</span>
              </div>
            ))}
          </div>
          {/* 「もっと見る」リンク（2026-10-29追加）。このコンポーネントはホーム以外の
              ページにも出るため、HomeClient.tsx側（同一ページ内でタブを直接切り替える）
              とは違い、通常のページ遷移としてホームの閲覧数順タブへ飛ばす。 */}
          <Link
            href="/?sort=views"
            className="muted"
            style={{ fontSize: 12, textDecoration: 'underline', display: 'inline-block', marginTop: 8 }}
          >
            もっと見る →
          </Link>
        </div>
      )}

      {/* TagChips自体が内部でAPIを叩くため、isDesktopがtrueになるまで
          マウントしない（スマホで見えないのに裏でfetchするのを防ぐ）。 */}
      {isDesktop && (
        <div className="home-tags">
          <TagChips title="気になるテーマから探す" />
        </div>
      )}

      {!hideExperts && <ExpertsTeaser experts={experts} senpai={senpai} className="home-experts-side" />}

      {/* 「自分の地域登録」カード。以前はホーム本文（.home-main-col）に
          PC・モバイル共通で出していたが、PCでは本文の相談一覧を押し下げてしまう
          との指摘（2026-11-03）を受けて、他の専門家一覧・見守り力診断と同じ
          パターンでこちらの右コラムに移動した。本文側（HomeClient.tsx）は
          モバイル専用（.home-myregion-mobile）にしてある。gakkoLinks（学びの場
          カテゴリ一覧）の直前に置き、学びの場関連の導線同士を隣接させる。
          localStorageのみの読み出しでAPIを叩かないため、isDesktopでの
          ゲーティングは必須ではないが、他のサイド専用コンポーネントとの
          一貫性のため揃えておく。 */}
      {isDesktop && (
        <div className="home-myregion-side">
          <MyRegionCard />
        </div>
      )}

      {gakkoLinks}
    </div>

    {/* スマホ幅では.pc-sidebar自体が非表示になるため、カテゴリ一覧は本文の下に
        別途表示する（2026-10-18）。PCではCSS側（.gakko-links-mobile）で隠す。
        PC側（.pc-sidebar内）にも同じ一覧をそのまま残している（上記、ヘッダーの
        プルダウンと両方に導線を置く方針）。 */}
    <div className="gakko-links-mobile" style={{ marginTop: 4 }}>
      {gakkoLinks}
    </div>
    </>
  );
}
