'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ConsultationCard from '@/components/ConsultationCard';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

// app/expertlist/ExpertListClient.tsxの経験者版（2026-11-02追加）。
// 経験者本人が回答した相談だけを、/api/consultations?senpai_answered=1
// （lib/consultations.ts senpaiAnswered）で取得する。読み放題会員まわりの文言・
// 仕組みはExpertListClient.tsxと完全に同じ（専門家・経験者どちらの回答も、
// 読むには同じ読み放題会員登録が必要なため）。
export default function SenpaiListClient() {
  const [items, setItems] = useState<Consultation[] | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  useEffect(() => {
    fetch(`/api/consultations?senpai_answered=1&viewer_id=${getUid()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.consultations || []))
      .catch(() => setItems([]));
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setStripeConfigured(!!d.stripeConfigured))
      .catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
        <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 className="pagetitle" style={{ margin: 0 }}>経験者が回答した相談</h2>
          {!stripeConfigured && <span className="comingsoon-badge">準備中・近日公開</span>}
        </div>
        <div className="muted" style={{ marginBottom: 10 }}>
          AIの自動回答とは別に、不登校のお子さんを育てた経験のある経験者本人が相談文を読んで直接回答したものです。
          {!stripeConfigured && '現在、読み放題会員の登録は準備中です。準備が整い次第ご利用いただけます（専門家・経験者への質問自体はどなたでも無料です）。'}
        </div>

        <div className="card" style={{ gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            読み放題会員になると
            {!stripeConfigured && <span className="comingsoon-badge">準備中</span>}
          </div>
          <div className="qtext" style={{ fontSize: 13 }}>✓ ここに並ぶ経験者の回答が、すべて読めるようになる</div>
          <div className="qtext" style={{ fontSize: 13 }}>✓ 相談を重ねるほど、伴走ノートの中身をより詳しく見られるようになる</div>
        </div>

        {/* /expertlistとの相互導線（2026-11-02追加）。経験者一覧専用のページは
            無いため、専門家の回答一覧へのリンクだけ置く（経験者個別のプロフィールは
            PcSidebar内のExpertsTeaserから辿れる）。 */}
        <Link href="/expertlist" className="backlink" style={{ margin: '0 0 14px' }}>
          専門家が回答した相談を見る →
        </Link>

        {items === null ? (
          <div className="muted">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="empty">まだ経験者が回答した相談がありません。</div>
        ) : (
          items.map((item) => <ConsultationCard key={item.id} item={item} />)
        )}
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
