'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ConsultationCard from '@/components/ConsultationCard';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

export default function ExpertListClient() {
  const [items, setItems] = useState<Consultation[] | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  useEffect(() => {
    fetch(`/api/consultations?expert_answered=1&viewer_id=${getUid()}`)
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
          <h2 className="pagetitle" style={{ margin: 0 }}>専門家が回答した相談</h2>
          {!stripeConfigured && <span className="comingsoon-badge">準備中・近日公開</span>}
        </div>
        <div className="muted" style={{ marginBottom: 10 }}>
          AIの自動回答とは別に、専門家（公認心理師など）・先輩保護者（経験者）本人が相談文を読んで直接回答したものです。
          {/* 「専門家への質問自体はどなたでも無料です」だと、専門家だけが対象のように
              読めてしまう（現時点では本人確認済みの専門家は0人で、実際に質問できるのは
              先輩保護者のみ）との指摘を受けて、先輩保護者への質問も無料であることが
              伝わるよう書き換えた（2026-11-02）。 */}
          {!stripeConfigured && '現在、読み放題会員の登録は準備中です。準備が整い次第ご利用いただけます（専門家・先輩保護者への質問自体はどなたでも無料です）。'}
        </div>

        <div className="card" style={{ gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            読み放題会員になると
            {!stripeConfigured && <span className="comingsoon-badge">準備中</span>}
          </div>
          <div className="qtext" style={{ fontSize: 13 }}>✓ ここに並ぶ専門家回答が、すべて読めるようになる</div>
          {/* 伴走ノートの基本サマリー（状況整理・次の一手・言葉かけ等）は2026-10-12より
              無料会員にも開放したため、この行は「無料会員にはないもの」として、伴走ノートを
              より詳しく見られるという有料会員向けの訴求に書き換えた。 */}
          <div className="qtext" style={{ fontSize: 13 }}>✓ 相談を重ねるほど、伴走ノートの中身をより詳しく見られるようになる</div>
        </div>

        <Link href="/experts" className="backlink" style={{ margin: '0 0 14px' }}>
          どんな専門家が回答していますか？ →
        </Link>
        {/* /senpailistとの相互導線（2026-11-02追加、「先輩保護者の回答ってバージョンも
            欲しいね」との要望を受けて）。 */}
        <Link href="/senpailist" className="backlink" style={{ margin: '0 0 14px' }}>
          先輩保護者が回答した相談を見る →
        </Link>

        {items === null ? (
          <div className="muted">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="empty">まだ専門家が回答した相談がありません。</div>
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
