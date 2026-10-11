'use client';

import { useEffect, useState } from 'react';
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

export default function HomeClient({
  initialItems,
  initialSupervised,
  initialCounts,
  initialTotal,
}: {
  initialItems: Consultation[];
  initialSupervised: boolean;
  initialCounts: Record<string, number>;
  initialTotal: number;
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
    <div className="app-shell">
      <Header supervised={supervised} />
      <div className="main">
        {showExtras && (
          <div className="expertbanner" onClick={() => router.push('/expertlist')}>
            <span className="expertbanner-icon">🔒</span>
            <div className="expertbanner-body">
              <div className="expertbanner-title">専門家が回答した相談{expertCount ? `（${expertCount}件）` : ''}</div>
              <div className="expertbanner-desc">公認心理師など専門家本人が直接回答。¥500で30日間読み放題</div>
            </div>
            <span className="expertbanner-cta">›</span>
          </div>
        )}

        {showExtras && allItems.length >= 3 && (
          <div className="ranking">
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
          className="input"
          placeholder="キーワードで検索…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="chip-row">
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

        {showExtras && <TagChips title="気になるテーマから探す" />}

        {loading && <div className="muted">読み込み中…</div>}
        {!loading && items.length === 0 && (
          <div className="muted">{showExtras ? 'まだ相談がありません。' : '該当する相談が見つかりません。'}</div>
        )}
        {!loading && items.map((item) => <ConsultationCard key={item.id} item={item} />)}
      </div>

      <BottomNav />
    </div>
  );
}
