import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import ExpertAvatar from '@/components/ExpertAvatar';
import SenpaiConsultCta from '@/components/SenpaiConsultCta';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { SENPAI_CREDENTIAL } from '@/lib/config';
import { findSchoolMentionsInBio, resolveSchoolName } from '@/lib/senpaiSchoolMentions';

// 経験者の公開プロフィールページ。app/experts/[id]/page.tsx（専門家向け）
// と同じ構成（2026-10-31、「私の情報トップにだして」との依頼を受けて、トップのカードから
// 遷移できるプロフィールページとして新規作成）。
// オンライン通話・チャットリレーの予約・決済は自前で作らず、本人が用意した外部サービス
// （MOSH等）へのリンク（online_consult_url）を「直接相談する」ボタンとして
// 出す方式にした（2026-11-01追加。以前はこの仕組み自体が無かったため、ボタンを
// 置いていなかった）。
export const instant = false;

type SenpaiProfile = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
  link_url: string | null;
  online_consult_url: string | null;
  experienced_school_names: string[];
};

async function getVerifiedSenpaiById(id: string): Promise<SenpaiProfile | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url, link_url, online_consult_url, experienced_school_names')
    .eq('id', id)
    .eq('verified', true)
    .eq('credential', SENPAI_CREDENTIAL)
    .single();
  return data ? { ...data, name: expertDisplayName(data), experienced_school_names: data.experienced_school_names || [] } : null;
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
  const onlineConsultLink = safeHttpUrl(senpai.online_consult_url);
  // 「話せる学校」の一覧。登録・プロフィール編集画面の専用欄（experienced_school_names）に
  // 入力済みの学校名を優先的に使い、各名称を学校データセットと照合してリンクを付ける
  // （一致しなければ名前のみ表示）。専用欄が空の場合のみ、従来どおり自己紹介文（bio）
  // からの自動抽出にフォールバックする（2026-10-31、「話せる学校の名前も羅列できる
  // といいんじゃない」との指摘を受けて、専用欄を優先するよう変更）。
  const schoolMentions =
    senpai.experienced_school_names.length > 0
      ? senpai.experienced_school_names.map(resolveSchoolName)
      : findSchoolMentionsInBio(senpai.bio);

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
                {/* senpai.credentialはDB上の識別値（SENPAI_CREDENTIAL）のままなので、
                    表示文言の「経験者」統一に合わせてここは固定文言で出す
                    （2026-11-03、「先輩保護者じゃなく経験者に統一して」との指示）。 */}
                <div style={{ fontWeight: 700, fontSize: 16 }}>経験者・{senpai.name}</div>
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
                    ご本人のサイト・SNSはこちら →
                  </a>
                )}
              </div>
            </div>
            {/* 2026-11-01、指名機能を撤去したため、ここから送った質問が必ずこの経験者に
                届く・回答される保証はない（登録している専門家・経験者が任意で拾って
                回答するボランティアの仕組みのため）。誤解されないよう一言添える。 */}
            <div className="muted" style={{ fontSize: 12 }}>
              質問はどうする先生に送られ、登録している専門家・経験者が任意で回答します（この方が必ず回答するとは限りません）。
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {/* テキストでの質問（/askの既存フロー）は2026-11-01に恒久的に無料化し、
                  指名機能も撤去して一般の相談フォームへの案内に統一した（2026-10-31、
                  「この経験者に相談する、の導線は？」との指摘を受けて追加）。 */}
              <SenpaiConsultCta />
              {/* オンライン通話・チャットリレーの予約・決済は本人が用意した外部サービス
                  （MOSH等）に任せるため、どうする先生側の金銭のやり取り（volunteerMode）
                  とは無関係に、online_consult_urlが設定されていれば常に表示する
                  （2026-11-01追加）。 */}
              {onlineConsultLink && (
                <a
                  href={onlineConsultLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                >
                  直接相談する →
                </a>
              )}
            </div>
            {onlineConsultLink && (
              <div className="muted" style={{ fontSize: 12 }}>
                どうする先生とは別の、ご本人が設定した外部ページへ移動します（内容・料金はご本人の設定によります）。顔出し・顔出しなし・チャットのみは、通話開始後にその場で選べます。
              </div>
            )}
          </div>

          {schoolMentions.length > 0 && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>話せる学校</div>
              <div className="qtext" style={{ fontSize: 13 }}>
                次の学校についてお話しできそうです。
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {schoolMentions.map((m) =>
                  m.path ? (
                    <Link key={m.path} href={m.path} className="backlink" style={{ fontSize: 13, margin: 0 }}>
                      {m.name} →
                    </Link>
                  ) : (
                    <div key={m.name} className="qtext" style={{ fontSize: 13 }}>
                      {m.name}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
        <PcSidebar hideExperts />
      </div>
      <BottomNav />
    </div>
  );
}
