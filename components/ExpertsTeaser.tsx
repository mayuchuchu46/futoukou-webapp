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
  senpai = [],
  title = '専門家一覧',
  className = '',
  compact = false,
}: {
  experts: ExpertProfile[];
  // 先輩保護者（経験者）は専門家とは別の価格体系・有料相談の仕組み（まだ準備中）
  // のため、カードは出しても遷移先は専門家向けの/ask?expert=ではなく、プロフィール
  // 閲覧のみの/senpai/[id]にする（2026-10-31、本人確認済みの先輩保護者をトップに
  // 出したいとの依頼を受けて追加）。
  senpai?: ExpertProfile[];
  title?: string;
  className?: string;
  // trueのとき、アイコンを小さく・行間を詰めたコンパクト表示にする
  // （2026-10-31、「もうちょいコンパクトで」との指摘を受けて追加）。
  compact?: boolean;
}) {
  const router = useRouter();
  const avatarSize = compact ? 32 : 44;

  return (
    <div className={`home-experts ${className}`.trim()}>
      <div className="home-experts-title">{title}</div>
      {/* 専門家と先輩保護者（経験者）は募集・表示の入り口を分けているため（2026-10-30、
          「保護者と、専門家の入り口とページは別にしたい」との方針）、それぞれ
          0人なら募集中カード、1人以上いれば実際のプロフィールカードを、別々に出す
          （2026-10-31、「トップには、保護者向けと専門家向け二つ別にだして」
          「私の情報トップにだして」との指摘を受けて）。 */}
      {experts.length === 0 ? (
        <div
          className="home-expert-card home-expert-card--empty"
          role="button"
          tabIndex={0}
          onClick={() => router.push('/expert/recruit')}
        >
          <ExpertAvatar photoUrl={null} size={avatarSize} />
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
            <ExpertAvatar photoUrl={e.photo_url} size={avatarSize} />
            <div className="home-expert-body">
              <div className="home-expert-name">{e.credential}・{e.name}</div>
              {e.bio && <div className="home-expert-desc">{e.bio}</div>}
            </div>
            <span className="expertbanner-cta">›</span>
          </div>
        ))
      )}
      {senpai.length === 0 ? (
        <div
          className="home-expert-card home-expert-card--empty"
          role="button"
          tabIndex={0}
          onClick={() => router.push('/senpai/recruit')}
        >
          <ExpertAvatar photoUrl={null} size={avatarSize} />
          <div className="home-expert-body">
            <div className="home-expert-name">先輩保護者（経験者）も募集中です</div>
            <div className="home-expert-desc">資格は不要です。不登校を経験されたご家庭ご自身を募集しています</div>
          </div>
          <span className="expertbanner-cta">›</span>
        </div>
      ) : (
        senpai.map((e) => (
          <div
            key={e.id}
            className="home-expert-card"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/senpai/${e.id}`)}
          >
            <ExpertAvatar photoUrl={e.photo_url} size={avatarSize} />
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
