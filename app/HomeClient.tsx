'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ConsultationCard from '@/components/ConsultationCard';
import EyeIcon from '@/components/EyeIcon';
import TagChips from '@/components/TagChips';
import PcSidebar from '@/components/PcSidebar';
import { CATS } from '@/lib/categories';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

function isExpertAnswered(item: Consultation) {
  return item.request_type === 'expert' && item.expert_status === 'answered';
}

type SidebarBanner = {
  enabled: boolean;
  image_url: string;
  link_url: string;
  alt_text: string;
} | null;

type ExpertProfile = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
};

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
  const [items, setItems] = useState<Consultation[]>(initialItems);
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // 「読み込み中…」での出し入れで一覧末尾のsentinel要素が一度消えて作り直される
  // （loadingがtrueの間はDOMから外れる）ため、useRefではなくstateで持ち、
  // 要素が新しく作られるたびにIntersectionObserverを張り直す。
  const [loadMoreEl, setLoadMoreEl] = useState<HTMLDivElement | null>(null);
  // バナー・ランキングは絞り込みに関わらず「全体」の集計を出すので、
  // category/q で動く items とは別に保持する。
  const [allItems, setAllItems] = useState<Consultation[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const supervised = initialSupervised;
  const counts = initialCounts;
  const total = initialTotal;
  // サイドバナー・専門家一覧は <PcSidebar> が自前でAPIから取得するため、
  // ここでは initialSidebarBanner / initialExperts は使わない
  // （page.tsx側のサーバー取得・prop自体は後方互換のため残している）。

  // 旧「さがす」ページのタグ・ランキングなど、別のリンクから ?q= / ?category= 付きで
  // ホームに遷移してきたときに、URLの変化を拾って絞り込みを反映する。
  useEffect(() => {
    const urlQ = urlParams.get('q') || '';
    const urlCategory = urlParams.get('category') || 'all';
    setQ((prev) => (prev === urlQ ? prev : urlQ));
    setCategory((prev) => (prev === urlCategory ? prev : urlCategory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParams]);

  async function fetchResults(nextCategory: string, nextQ: string, { showLoading }: { showLoading: boolean }) {
    if (showLoading) setLoading(true);
    const params = new URLSearchParams({ viewer_id: getUid() });
    if (nextCategory !== 'all') params.set('category', nextCategory);
    if (nextQ.trim()) params.set('q', nextQ.trim());
    try {
      const res = await fetch(`/api/consultations?${params.toString()}`);
      const d = await res.json();
      setItems(d.consultations || []);
      if (nextCategory === 'all' && !nextQ.trim()) setAllItems(d.consultations || []);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  function selectCategory(next: string) {
    setCategory(next);
  }

  useEffect(() => {
    // 初回表示はサーバー側（匿名扱い）の一覧をそのまま見せ、
    // マウント後に本当のviewer_id（本人・会員かどうか）で静かに再取得して
    // ロック解除などの表示を正しいものに差し替える。
    fetchResults('all', '', { showLoading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchResults(category, q, { showLoading: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q]);

  // 絞り込み（カテゴリ・検索）が変わったら、表示件数を最初の分だけに戻す。
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, q]);

  // 一覧の下端に近づいたら、表示件数を少しずつ増やす（全件を一度に並べない）。
  useEffect(() => {
    if (!loadMoreEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, items.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(loadMoreEl);
    return () => observer.disconnect();
  }, [loadMoreEl, items.length]);

  const expertCount = allItems.filter(isExpertAnswered).length;
  const ranking = [...allItems].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const showExtras = category === 'all' && !q.trim();

  return (
    <div className="app-shell">
      <Header supervised={supervised} />
      <div className="main">
        {showExtras && (
          <div className="expertbanner" onClick={() => router.push('/expertlist')}>
            <span className="expertbanner-icon">🔒</span>
            <div className="expertbanner-body">
              <div className="expertbanner-title">専門家が回答した相談{expertCount ? `（${expertCount}件）` : ''}</div>
              <div className="expertbanner-desc">専門家（公認心理師など）本人が直接回答。月¥800で読み放題</div>
            </div>
            <span className="expertbanner-cta">›</span>
          </div>
        )}

        {/* PCの広い画面では、左右を完全に独立した縦積み（flex column）の
            2カラムにする（app/globals.cssの.home-layout参照）。検索ボックスや
            バナーなど高さの違う要素同士を同じ行に揃えようとすると謎の空白が
            できてしまうため、行を揃える作りはやめている。
            モバイルでは今まで通りの1カラム（ランキング→タグ→検索→カテゴリ→一覧の順）。 */}
        <div className={`home-layout ${showExtras ? 'home-layout--with-side' : ''}`}>
          <div className="home-main-col">
            {showExtras && allItems.length >= 3 && (
              <div className="ranking home-ranking">
                <div className="ranking-title">よく読まれている相談</div>
                <div className="rank-list">
                  {ranking.map((item, i) => (
                    <div key={item.id} className="rank-item" onClick={() => router.push(`/result/${item.id}`)}>
                      <span className="rank-num">{i + 1}</span>
                      <span className="rank-q">{item.question.slice(0, 28)}{item.question.length > 28 ? '…' : ''}</span>
                      <span className="rank-views"><EyeIcon /> {item.views || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PCではサイド側に同じものを出すので、ここはモバイル専用（960px以上では非表示）。 */}
            {showExtras && (
              <div className="home-tags home-tags-mobile">
                <TagChips title="気になるテーマから探す" />
              </div>
            )}

            <input
              className="input home-search"
              placeholder="キーワードで検索…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="catmenu-row home-chips">
              <button
                className={`catmenu-chip catmenu-all ${category === 'all' ? 'active' : ''}`}
                onClick={() => selectCategory('all')}
              >
                すべて（{total}）
              </button>
              {Object.entries(CATS).map(([key, c]) => (
                <button
                  key={key}
                  className={`catmenu-chip ${c.cls} ${category === key ? 'active' : ''}`}
                  onClick={() => selectCategory(key)}
                >
                  {c.short}（{counts[key] || 0}）
                </button>
              ))}
            </div>

            <div className="home-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loading && <div className="muted">読み込み中…</div>}
              {!loading && items.length === 0 && (
                <div className="muted">{showExtras ? 'まだ相談がありません。' : '該当する相談が見つかりません。'}</div>
              )}
              {!loading && items.slice(0, visibleCount).map((item) => <ConsultationCard key={item.id} item={item} />)}
              {!loading && visibleCount < items.length && <div ref={setLoadMoreEl} style={{ height: 1 }} />}

              {showExtras && !loading && (
                <img
                  className="recruitnote-banner"
                  src="/assets/recruit_banner.png"
                  alt="専門家の方を募集しています。公認心理師・臨床心理士など、相談への回答を担当していただける方を募集中"
                  onClick={() => router.push('/expert/recruit')}
                />
              )}
            </div>
          </div>

          {/* PCではサイド（右カラム）に表示。中身はPcSidebar側で自前取得する
              （ランキングだけは左カラムに出すので、ここでは出さない）。 */}
          {showExtras && <PcSidebar hideRanking />}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
