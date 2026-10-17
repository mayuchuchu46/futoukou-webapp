'use client';

import { useRouter } from 'next/navigation';
import ExpertAvatar from './ExpertAvatar';

// ホーム画面に置く「専門家一覧」の導線。/expertsページの簡易版で、
// 本人確認済みの専門家を数件（なければ募集中カードを1件）表示する。
// もともとPcSidebar.tsxの中にだけ実装されていて、PC（960px以上）の
// 右カラムでしか見えていなかった（スマホでは.pc-sidebar自体が非表示）。
// 「専門家の紹介カードをTOPにも出したい」という依頼を受けて、同じ内容を
// 共通コンポーネントに切り出し、HomeClient.tsx（スマホを含む本流）にも
// 設置できるようにした（2026-10-18）。
//
// 専門家がまだ0人（verified: true が1件もない）の間は、実在しない専門家を
// でっち上げて見せるのではなく、募集中である旨を正直に表示する
// （既存のこの空状態の文言をそのまま踏襲）。
export type ExpertProfile = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
};

export default function ExpertsTeaser({
  experts,
  title = '専門家一覧',
  className = '',
}: {
  experts: ExpertProfile[];
  title?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className={`home-experts ${className}`.trim()}>
      <div className="home-experts-title">{title}</div>
      {experts.length === 0 ? (
        <div
          className="home-expert-card home-expert-card--empty"
          role="button"
          tabIndex={0}
          onClick={() => router.push('/expert/recruit')}
        >
          <ExpertAvatar photoUrl={null} size={44} />
          <div className="home-expert-body">
            <div className="home-expert-name">現在、専門家を募集中です</div>
            <div className="home-expert-desc">公認心理師・臨床心理士など、回答を担当いただける方を募集しています</div>
          </div>
          <span className="expertbanner-cta">›</span>
        </div>
      ) : (
        experts.map((e) => (
          <div
            key={e.id}
            className="home-expert-card"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/ask?expert=${e.id}`)}
          >
            <ExpertAvatar photoUrl={e.photo_url} size={44} />
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
        onClick={(e) => {
          e.preventDefault();
          router.push('/experts');
        }}
      >
        専門家一覧をすべて見る →
      </a>
    </div>
  );
}
