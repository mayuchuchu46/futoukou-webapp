'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EyeIcon from './EyeIcon';
import TagChips from './TagChips';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

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

// ホーム以外のページでも、PCの広い画面では右サイドに
// 「よく読まれている相談」「気になるテーマから探す」「専門家一覧」
// （とサイドバナー）を出す。中身はホームのサイドと同じもので、
// このコンポーネントが自前でAPIから取得する（各ページのサーバー側を
// 変更せずに済むよう、クライアント側で完結させている）。
export default function PcSidebar({ hideExperts = false }: { hideExperts?: boolean } = {}) {
  const router = useRouter();
  const [ranking, setRanking] = useState<Consultation[]>([]);
  const [banner, setBanner] = useState<SidebarBanner>(null);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);

  useEffect(() => {
    fetch(`/api/consultations?viewer_id=${encodeURIComponent(getUid())}`)
      .then((r) => r.json())
      .then((d) => {
        const items: Consultation[] = d.consultations || [];
        setRanking([...items].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10));
      })
      .catch(() => {});

    fetch('/api/sidebar-banner')
      .then((r) => r.json())
      .then((d) => setBanner(d.banner || null))
      .catch(() => {});

    fetch('/api/experts/list')
      .then((r) => r.json())
      .then((d) => setExperts(d.experts || []))
      .catch(() => {});
  }, []);

  const showBanner = !!(banner && banner.enabled && banner.image_url && banner.link_url);

  return (
    <div className="pc-sidebar">
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
              <div key={item.id} className="rank-item" onClick={() => router.push(`/result/${item.id}`)}>
                <span className="rank-num">{i + 1}</span>
                <span className="rank-q">{item.question.slice(0, 28)}{item.question.length > 28 ? '…' : ''}</span>
                <span className="rank-views"><EyeIcon /> {item.views || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="home-tags">
        <TagChips title="気になるテーマから探す" />
      </div>

      {!hideExperts && (
      <div className="home-experts home-experts-side">
        <div className="home-experts-title">専門家一覧</div>
        {experts.length === 0 ? (
          <div className="home-expert-card home-expert-card--empty" onClick={() => router.push('/expert/recruit')}>
            <img src="/assets/sensei_logo.png" alt="" className="home-expert-photo" style={{ opacity: 0.5 }} />
            <div className="home-expert-body">
              <div className="home-expert-name">現在、専門家を募集中です</div>
              <div className="home-expert-desc">公認心理師・臨床心理士など、回答を担当いただける方を募集しています</div>
            </div>
            <span className="expertbanner-cta">›</span>
          </div>
        ) : (
          experts.map((e) => (
            <div key={e.id} className="home-expert-card" onClick={() => router.push(`/ask?expert=${e.id}`)}>
              <img src={e.photo_url || '/assets/sensei_logo.png'} alt="" className="home-expert-photo" />
              <div className="home-expert-body">
                <div className="home-expert-name">{e.credential}・{e.name}</div>
                {e.bio && <div className="home-expert-desc">{e.bio}</div>}
              </div>
              <span className="expertbanner-cta">›</span>
            </div>
          ))
        )}
        <a
          href="/experts"
          className="backlink"
          style={{ margin: '2px 0 0', fontSize: 13 }}
          onClick={(e) => { e.preventDefault(); router.push('/experts'); }}
        >
          専門家一覧をすべて見る →
        </a>
      </div>
      )}
    </div>
  );
}
