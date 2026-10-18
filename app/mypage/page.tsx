'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ConsultationCard from '@/components/ConsultationCard';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

export default function MyPage() {
  const [items, setItems] = useState<Consultation[] | null>(null);

  useEffect(() => {
    const uid = getUid();
    fetch(`/api/consultations?author_id=${uid}&viewer_id=${uid}`)
      .then((r) => r.json())
      .then((d) => setItems(d.consultations || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
        <h2 className="pagetitle">マイページ</h2>
        <div className="muted" style={{ marginBottom: 4 }}>自分が投稿した相談だけを表示しています</div>

        {/* AIによる状況分析は独立した「伴走ノート」タブに移動したため、ここは誘導リンクのみ。 */}
        <Link href="/notebook" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/assets/icon_book.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            伴走ノートを見る
          </span>
          <span className="muted">›</span>
        </Link>

        {items === null ? (
          <div className="muted">読み込み中…</div>
        ) : items.length === 0 ? (
          <>
            <div className="empty">
              まだ投稿がありません。<br />「相談する」から質問してみてください。
            </div>
            <Link href="/ask" className="btn-primary">相談する</Link>
          </>
        ) : (
          items.map((item) => (
            <ConsultationCard
              key={item.id}
              item={item}
              showDelete
              onDeleted={(id) => setItems((prev) => (prev || []).filter((c) => c.id !== id))}
            />
          ))
        )}

        <Link href="/account" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>アカウント（ログイン）</span>
          <span className="muted">›</span>
        </Link>
        <Link href="/about" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>どうする先生について</span>
          <span className="muted">›</span>
        </Link>
        {/* 学びの多様化学校（旧：不登校特例校）の都道府県別一覧ページ。これまで進路・学校
            カテゴリの相談結果ページからしかリンクされていなかったため、BottomNavから常に
            一タップで来られるマイページにも入り口を追加した（2026-10-18）。 */}
        <Link href="/gakko" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>学校・フリースクールを探す</span>
          <span className="muted">›</span>
        </Link>
        <Link href="/expert/login" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>専門家として登録・ログイン</span>
          <span className="muted">›</span>
        </Link>

        {/* 利用規約・プライバシーポリシー等は、サイト全体のフッターの代わりとして
            ここ（マイページ）にまとめている。BottomNavから常に一タップで来られるため、
            ボトムナビ型アプリとしてはこの位置が実質的なフッターの役割を果たす
            （2026-10-13、まとめて見出しを付けた）。 */}
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>規約・ポリシー</div>
        <Link href="/terms" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>利用規約・免責事項</span>
          <span className="muted">›</span>
        </Link>
        <Link href="/privacy" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>プライバシーポリシー</span>
          <span className="muted">›</span>
        </Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
