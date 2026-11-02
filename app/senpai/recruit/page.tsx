import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import BackButton from '@/components/BackButton';
import ExpertRecruitFlowDiagram from '@/components/ExpertRecruitFlowDiagram';

// 経験者専用の募集ページ。
// 専門家向け（/expert/recruit）とは入り口・ページを分けている（2026-10-30、
// 「保護者と、専門家の入り口とページは別にしたい」との方針を受けて）。
//
// 学校の各紹介ページ（FacilityExperiencedParents.tsx・SchoolExperiencedParents.tsx）に
// 「この学校について話せる経験者を募集しています」という導線を置くようになったのに
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
        {/* 「もどる」の行き先を/about固定にすると、2026-11-03に追加した/recruit
            （経験者・専門家の統合ランディング）経由で来た人が、実際に来た場所とは
            違う/aboutに戻ってしまう問題があった。BackButton（router.back()）に
            変更して、実際に直前にいた画面へ戻るようにした。 */}
        <BackButton />
        <h2 className="pagetitle">経験者募集</h2>

        {school && (
          <div className="card" style={{ alignItems: 'flex-start', gap: 4, background: 'var(--sub)', border: '2px solid var(--main)' }}>
            <div className="qtext" style={{ fontWeight: 700 }}>
              「{school}」について話せる経験者を募集しています
            </div>
            <div className="qtext" style={{ fontSize: 13 }}>
              この学校に実際に通われた（通われている）ご家庭からの体験談を探しています。
            </div>
          </div>
        )}

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="qtext">
            「どうする先生」は、不登校のご家庭に向けたAI相談サービスです。AIの回答や専門家の回答とは別に、不登校を経験されたご家庭ご自身（経験者）に、その体験に基づいて相談に回答していただく機能があります。資格は不要です。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>対象となる方</div>
          <div className="qtext">
            不登校を経験されたご家庭ご自身。お子さんの学校選び・学校との付き合い方・日々の関わり方など、実際に経験されたことについてお話しいただきます。
          </div>
        </div>

        {/* 「報酬の前に、内容（どういう形で協力するのか）を先に見せてほしい」との
            指摘を受けて追加（2026-10-31）。
            2026-11-01、質問・回答を恒久的に無料にする方針に変更したのに合わせて
            全面的に書き換えた。テキストでの回答は常に無料で利用できる。チャットや
            オンラインでの通話は、プラットフォーム側で予約・決済の仕組みを作るのでは
            なく、ご本人が使っている外部サービス（MOSH等）へのリンクをプロフィールに
            設定していただく形にした（登録フォームの「オンライン相談のリンク」欄）。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>ご協力いただく内容</div>
          <div className="qtext">
            <strong>テキストでの回答</strong><br />
            届いた相談文に、ご自身のタイミングで文章で回答します。
          </div>
          <div className="qtext">
            <strong>オンラインでの通話・チャット（任意）</strong><br />
            もしLINE通話やチャット等でも相談対応をされたい場合は、ご自身がお使いの外部サービス（予約サイトなど）へのリンクをプロフィールに設定していただければ、プロフィールページに「オンラインで相談する」ボタンとして表示されます。予約や決済のやり取りは、そちらのサービス上でご本人が直接行ってください。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>報酬について</div>
          <div className="qtext">
            質問への回答自体には、報酬・お支払いはありません。相談に回答すると、回答した方のプロフィールページへのリンクが表示され、ご自身の活動やサービスを知ってもらうきっかけになります（上記のオンライン通話等をご自身のサービスとして有料で提供されることは可能です。その場合の料金設定・やり取りはご本人にお任せします）。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>学校の紹介ページにも表示されます</div>
          <div className="qtext">
            登録時に、お子さんが通われていた（通われている）学校の正式名称を自己紹介文に書いていただくと、その学校の紹介ページにも「経験者からこの学校の話を聞く」として表示され、同じ学校を検討している方から見つけてもらいやすくなります。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>登録の流れ</div>
          {/* 「気軽に登録できる流れがいいな」との指摘を受けて（2026-10-31）、
              「オンライン通話で確認」を必須ステップとする表現をやめ、基本は
              登録内容（自己紹介文）を運営が確認して承認する、通話なしの
              流れに変更。確認したい点がある場合のみ個別に連絡する運用。
              2026-11-02、図（ExpertRecruitFlowDiagram）側のSTEP2見出しに
              「運営が内容を確認」という文言が入ったため、ここは見出しと
              重複しない補足テキストに変更。 */}
          <ExpertRecruitFlowDiagram step2Detail="自己紹介文・お話できる学校等を確認" />
          <ol className="qtext" style={{ margin: 0, paddingLeft: 18 }}>
            <li>登録フォームにプロフィール（自己紹介・お話できる相談カテゴリ）を入力</li>
            <li>運営が登録内容を確認</li>
            <li>確認完了後、相談への回答が可能になります</li>
          </ol>
        </div>

        <Link href={registerHref} className="btn-primary" style={{ textAlign: 'center' }}>
          経験者として登録する（事前登録受付）
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 4px', fontSize: 13 }}>
          すでに登録済みの方はこちらからログイン →
        </Link>
        {/* 経験者向けページから、専門家向けページへの案内（2026-10-30追加）。 */}
        <Link href="/expert/recruit" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          公認心理師・臨床心理士など資格をお持ちの方はこちら →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
