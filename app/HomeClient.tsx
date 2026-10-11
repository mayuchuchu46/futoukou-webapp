'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ConsultationCard from '@/components/ConsultationCard';
import EyeIcon from '@/components/EyeIcon';
import TagChips from '@/components/TagChips';
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
  // バナー・ランキングは絞り込みに関わらず「全体」の集計を出すので、
  // category/q で動く items とは別に保持する。
  const [allItems, setAllItems] = useState<Consultation[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const supervised = initialSupervised;
  const counts = initialCounts;
  const total = initialTotal;
  const banner = initialSidebarBanner;
  const showBanner = !!(banner && banner.enabled && banner.image_url && banner.link_url);

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

  const expertCount = allItems.filter(isExpertAnswered).length;
  const ranking = [...allItems].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const showExtras = category === 'all' && !q.trim();

  return (
    <div className="app-shell home-shell">
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

        {showExtras && (
          <div className="home-experts">
            <div className="home-experts-title">専門家一覧</div>
            {initialExperts.length === 0 ? (
              <div className="home-expert-card home-expert-card--empty" onClick={() => router.push('/expert/recruit')}>
                <img src="/assets/sensei_logo.png" alt="" className="home-expert-photo" style={{ opacity: 0.5 }} />
                <div className="home-expert-body">
                  <div className="home-expert-name">現在、専門家を募集中です</div>
                  <div className="home-expert-desc">公認心理師・臨床心理士など、回答を担当いただける方を募集しています</div>
                </div>
                <span className="expertbanner-cta">›</span>
              </div>
            ) : (
              initialExperts.map((e) => (
                <div
                  key={e.id}
                  className="home-expert-card"
                  onClick={() => router.push(`/ask?expert=${e.id}`)}
                >
                  <img src={e.photo_url || '/assets/sensei_logo.png'} alt="" className="home-expert-photo" />
                  <div className="home-expert-body">
                    <div className="home-expert-name">{e.credential}・{e.name}</div>
                    {e.bio && <div className="home-expert-desc">{e.bio}</div>}
                  </div>
                  <span className="expertbanner-cta">›</span>
                </div>
              ))
            )}
            <Link href="/experts" className="backlink" style={{ margin: '2px 0 0', fontSize: 13 }}>
              専門家一覧をすべて見る →
            </Link>
          </div>
        )}

        {/* PCの広い画面では、ランキング・タグ検索を右サイドに回す2カラムになる
            （app/globals.cssの.home-layout参照）。モバイルでは今まで通りの
            1カラム（ランキング→検索→カテゴリ→タグ→一覧の順）。 */}
        <div className={`home-layout ${showExtras ? 'home-layout--with-side' : ''}`}>
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

          <input
            className="input home-search"
            placeholder="キーワードで検索…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="chip-row home-chips">
            <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => selectCategory('all')}>
              すべて（{total}）
            </button>
            {Object.entries(CATS).map(([key, c]) => (
              <button
                key={key}
                className={`chip ${category === key ? 'active' : ''}`}
                onClick={() => selectCategory(key)}
              >
                {c.short}（{counts[key] || 0}）
              </button>
            ))}
          </div>

          {showExtras && (
            <div className="home-tags">
              <TagChips title="気になるテーマから探す" />
            </div>
          )}

          {showExtras && showBanner && (
            <a
              className="home-adbanner"
              href={banner!.link_url}
              target="_blank"
              rel="noopener sponsored"
            >
              <img src={banner!.image_url} alt={banner!.alt_text} />
            </a>
          )}

          <div className="home-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading && <div className="muted">読み込み中…</div>}
            {!loading && items.length === 0 && (
              <div className="muted">{showExtras ? 'まだ相談がありません。' : '該当する相談が見つかりません。'}</div>
            )}
            {!loading && items.map((item) => <ConsultationCard key={item.id} item={item} />)}
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
      </div>

      <BottomNav />
    </div>
  );
}
