import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ExpertRecruitFlowDiagram from '@/components/ExpertRecruitFlowDiagram';

// 先輩保護者（経験者）専用の募集ページ。
// 専門家向け（/expert/recruit）とは入り口・ページを分けている（2026-10-30、
// 「保護者と、専門家の入り口とページは別にしたい」との方針を受けて）。
//
// 学校の各紹介ページ（FacilityExperiencedParents.tsx・SchoolExperiencedParents.tsx）に
// 「この学校について話せる先輩保護者を募集しています」という導線を置くようになったのに
// 合わせて、?school=学校名のクエリパラメータを受け取れるようにした（2026-10-31）。
// 受け取った学校名は、登録フォーム（/senpai/register）へそのまま引き継ぎ、
// 「保護者視点で話せる学校名」欄に自動で追加される。

export default async function SenpaiRecruitPage({
  searchParams,
}: {
  searchParams: Promise<{ school?: string }>;
}) {
  const { school } = await searchParams;
  const registerHref = school ? `/senpai/register?school=${encodeURIComponent(school)}` : '/senpai/register';

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main">
        <Link href="/about" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>
        <h2 className="pagetitle">先輩保護者募集</h2>

        {school && (
          <div className="card" style={{ alignItems: 'flex-start', gap: 4, background: 'var(--sub)', border: '2px solid var(--main)' }}>
            <div className="qtext" style={{ fontWeight: 700 }}>
              「{school}」について話せる先輩保護者を募集しています
            </div>
            <div className="qtext" style={{ fontSize: 13 }}>
              この学校に実際に通われた（通われている）ご家庭からの体験談を探しています。
            </div>
          </div>
        )}

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="qtext">
            「どうする先生」は、不登校のご家庭に向けたAI相談サービスです。AIの回答や専門家の回答とは別に、不登校を経験されたご家庭ご自身（先輩保護者）に、その体験に基づいて相談に回答していただく機能があります。資格は不要です。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>対象となる方</div>
          <div className="qtext">
            不登校を経験されたご家庭ご自身。お子さんの学校選び・学校との付き合い方・日々の関わり方など、実際に経験されたことについてお話しいただきます。
          </div>
        </div>

        {/* 「報酬の前に、内容（どういう形で協力するのか）を先に見せてほしい」との
            指摘を受けて追加（2026-10-31）。テキスト回答／チャットリレー／
            オンライントークの3パターンを先に示す。
            「①テキストでの回答（現在ご利用いただけます）」という表現が、決済代行会社の
            乗り換え作業中で実際には無償ボランティア協力期間であることと食い違っていたため、
            EXPERT_VOLUNTEER_MODE導入（2026-10-31）にあわせて実態通りの表現に変更。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>ご協力いただく内容（3つの形）</div>
          <div className="qtext">
            <strong>①テキストでの回答</strong>（現在、試験的にご協力いただけます）<br />
            届いた相談文に、ご自身のタイミングで文章で回答します。
          </div>
          <div className="qtext">
            <strong>②チャットリレー</strong>（近日公開予定）<br />
            時間を決めて、その時間の中でチャットでやり取りします。
          </div>
          <div className="qtext">
            <strong>③オンライントーク</strong>（近日公開予定）<br />
            時間を決めて、LINE通話などでお話しします。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>報酬</div>
          <div className="qtext">
            {/* EXPERT_VOLUNTEER_MODE（lib/config.ts）導入にあわせて追記（2026-10-31）。 */}
            決済代行会社の乗り換え作業中のため、現在は利用者への質問受付を無料開放しており、この間のご回答はボランティアでのご協力としてお願いしています。回答件数など、この期間の貢献は記録しており、乗り換え完了後の報酬開始にあたって反映を検討します。金額は決まり次第こちらでお知らせします。
            <br />
            振込方法の詳細は、準備が整い次第、ご登録のメールアドレス宛にご案内します。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>学校の紹介ページにも表示されます</div>
          <div className="qtext">
            登録時に、お子さんが通われていた（通われている）学校の正式名称を自己紹介文に書いていただくと、その学校の紹介ページにも「先輩保護者からこの学校の話を聞く」として表示され、同じ学校を検討している方から見つけてもらいやすくなります。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>登録の流れ</div>
          <ExpertRecruitFlowDiagram step2Detail="オンライン通話で確認（書類の提出は不要）" />
          <ol className="qtext" style={{ margin: 0, paddingLeft: 18 }}>
            <li>登録フォームにプロフィール（自己紹介・お話できる相談カテゴリ）を入力</li>
            <li>運営とのオンライン通話で簡単に自己紹介（書類の提出は不要）</li>
            <li>確認完了後、相談への回答が可能になります</li>
          </ol>
        </div>

        <Link href={registerHref} className="btn-primary" style={{ textAlign: 'center' }}>
          先輩保護者として登録する（事前登録受付）
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 4px', fontSize: 13 }}>
          すでに登録済みの方はこちらからログイン →
        </Link>
        {/* 先輩保護者向けページから、専門家向けページへの案内（2026-10-30追加）。 */}
        <Link href="/expert/recruit" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          公認心理師・臨床心理士など資格をお持ちの方はこちら →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
