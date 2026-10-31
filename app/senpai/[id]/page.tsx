import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ExpertAvatar from '@/components/ExpertAvatar';
import SenpaiConsultCta from '@/components/SenpaiConsultCta';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { SENPAI_CREDENTIAL, EXPERT_VOLUNTEER_MODE } from '@/lib/config';
import { findSchoolMentionsInBio } from '@/lib/senpaiSchoolMentions';

// 先輩保護者（経験者）の公開プロフィールページ。app/experts/[id]/page.tsx（専門家向け）
// と同じ構成だが、こちらには「この方に相談する」ボタンは置かない（オンライン通話・
// チャットリレーの予約・決済の仕組みがまだ準備中のため。2026-10-31、「私の情報
// トップにだして」との依頼を受けて、トップのカードから遷移できるプロフィールページ
// として新規作成）。
export const instant = false;

type SenpaiProfile = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
  link_url: string | null;
};

async function getVerifiedSenpaiById(id: string): Promise<SenpaiProfile | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url, link_url')
    .eq('id', id)
    .eq('verified', true)
    .eq('credential', SENPAI_CREDENTIAL)
    .single();
  return data ? { ...data, name: expertDisplayName(data) } : null;
}

function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export default async function SenpaiProfilePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const senpai = await getVerifiedSenpaiById(id);

  if (!senpai) {
    notFound();
  }

  const link = safeHttpUrl(senpai.link_url);
  // 自己紹介文（bio）に書かれた学校名から、この方が話せそうな学校を自動抽出する
  // （2026-10-31、「この保護者が話せる学校情報もだしてあげるといいかも」との
  // 依頼を受けて追加。学校ページ側のFacilityExperiencedParents等と向きが逆の、
  // 同じ考え方のテキストマッチング）。
  const schoolMentions = findSchoolMentionsInBio(senpai.bio);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>

          <div className="card" style={{ gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
              <ExpertAvatar photoUrl={senpai.photo_url} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{senpai.credential}・{senpai.name}</div>
                {senpai.bio && (
                  <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
                    {senpai.bio}
                  </div>
                )}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="backlink"
                    style={{ fontSize: 13, margin: 0 }}
                  >
                    ご本人のサービス・サイトはこちら →
                  </a>
                )}
              </div>
            </div>
            {/* オンライン通話・チャットリレーの予約・決済はまだ準備中だが、
                EXPERT_VOLUNTEER_MODE（無償ボランティア期間）中はテキストでの
                質問は実際に使えるため、/askへ実際に飛ぶボタンにする（2026-10-31、
                「この先輩保護者に相談する、の導線は？」との指摘を受けて変更）。 */}
            <SenpaiConsultCta expertId={senpai.id} volunteerMode={EXPERT_VOLUNTEER_MODE} />
          </div>

          {schoolMentions.length > 0 && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>話せる学校</div>
              <div className="qtext" style={{ fontSize: 13 }}>
                自己紹介文から、次の学校についてお話しできそうです。
              </div>
              {schoolMentions.map((m) => (
                <Link key={m.path} href={m.path} className="backlink" style={{ fontSize: 13, margin: 0 }}>
                  {m.name} →
                </Link>
              ))}
            </div>
          )}
        </div>
        <PcSidebar hideExperts />
      </div>
      <BottomNav />
    </div>
  );
}
