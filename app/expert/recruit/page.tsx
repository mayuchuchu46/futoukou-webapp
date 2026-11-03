import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import BackButton from '@/components/BackButton';
import ExpertRecruitFlowDiagram from '@/components/ExpertRecruitFlowDiagram';
import ExpertContributionDiagram from '@/components/ExpertContributionDiagram';
import ExpertProfilePreview from '@/components/ExpertProfilePreview';

// 一般利用者向けの/expertsとは別の、専門家（回答する側）募集専用ページ。
// 一覧用の個人情報（会員数など）は含まないため、ビルド時に静的化してよい。
//
// 「保護者と、専門家の入り口とページは別にしたい」との方針を受けて（2026-10-30）、
// 経験者向けの内容は /senpai/recruit に専用ページとして分離した。
// このページは専門家（資格をお持ちの方）専用に戻している。

export default function ExpertRecruitPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main">
        {/* 「もどる」の行き先を/about固定にすると、2026-11-03に追加した/recruit
            （経験者・専門家の統合ランディング）経由で来た人が、実際に来た場所とは
            違う/aboutに戻ってしまう問題があった。BackButton（router.back()）に
            変更して、実際に直前にいた画面へ戻るようにした。 */}
        <BackButton />
        <h2 className="pagetitle">専門家募集</h2>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="qtext">
            「どうする先生」は、不登校のご家庭に向けたAI相談サービスです。AIの回答とは別に、公認心理師・臨床心理士など資格をお持ちの専門家本人が、利用者からの相談に直接回答する機能があります。この回答を担当していただける専門家の方を募集しています。
          </div>
        </div>

        {/* 「報酬の前に、内容（どういう形で協力するのか）を先に見せてほしい」との
            指摘を受けて追加（2026-10-31）。
            2026-11-01、質問・回答を恒久的に無料にする方針に変更したのに合わせて
            全面的に書き換えた。チャットやオンラインでの通話は、プラットフォーム側で
            予約・決済の仕組みを作るのではなく、ご本人が使っている外部サービス
            （MOSH等）へのリンクをプロフィールに設定していただく形にした
            （登録フォームの「オンライン相談のリンク」欄）。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>ご協力いただく内容</div>
          <ExpertContributionDiagram />
          <div className="qtext" style={{ margin: 0, paddingLeft: 18 }}>
            <strong>テキストでの回答</strong>：届いた相談の中から、答えたい質問を選んで、ご自身のタイミングで文章で回答します（すべてに回答する必要はありません）。
          </div>
          <div className="qtext">
            <strong>オンラインでの通話・チャット（任意）</strong>：もしLINE通話やチャット等でも相談対応をされたい場合は、ご自身がお使いの外部サービス（予約サイトなど）へのリンクをプロフィールに設定していただければ、プロフィールページに「オンラインで相談する」ボタンとして表示されます。予約や決済のやり取りは、そちらのサービス上でご本人が直接行ってください。
          </div>
          {/* プロフィールページのイメージサンプル（2026-11-03追加）。「登録すればボタンが
              表示されてるイメージがわかるといい」との要望を受けて追加。 */}
          <ExpertProfilePreview credentialLabel="公認心理師" />
        </div>

        {/* 「今とその後の流れ」を明示（2026-11-03追加）。今は無償協力のプレ期間である
            ことと、会員数・回答実績が増えた段階で報酬の仕組みを導入する予定である
            ことの両方を、具体的な金額・割合には触れずに案内する（金額の仕組み自体は
            まだ検討中・未確定のため、公開ページには概要のみ記載する）。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>報酬について（今とこれから）</div>
          <div className="qtext">
            <strong>今</strong>：質問への回答自体には、報酬・お支払いはありません。立ち上げ期間のご協力として、無償でお願いしています。相談に回答すると、回答した方のプロフィールページへのリンクが表示され、ご自身の活動やサービスを知ってもらうきっかけになります（上記のオンライン通話等をご自身のサービスとして有料で提供されることは可能です。その場合の料金設定・やり取りはご本人にお任せします）。
          </div>
          <div className="qtext">
            <strong>これから</strong>：会員数・回答実績が増えてきた段階で、回答いただいた分に応じて報酬をお支払いする仕組みを導入する予定です。具体的な金額・時期はまだ検討中で、確定し次第あらためてご案内します。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>登録の流れ</div>
          <ExpertRecruitFlowDiagram step2Detail="プロフィール・資格・リンク等を確認" verificationDetail="登録証アップロード、または通話" />
          <ol className="qtext" style={{ margin: 0, paddingLeft: 18 }}>
            <li>登録フォームにプロフィール（資格・自己紹介・対応できる相談カテゴリ）を入力</li>
            <li>本人確認の方法（アップロード／オンライン通話）を選択</li>
            <li>運営が内容を確認</li>
            <li>確認完了後、相談への回答が可能になります</li>
          </ol>
        </div>

        <Link href="/expert/register" className="btn-primary" style={{ textAlign: 'center' }}>
          専門家として登録する（事前登録受付）
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 4px', fontSize: 13 }}>
          すでに登録済みの専門家の方はこちらからログイン →
        </Link>
        {/* 専門家向けページから、経験者向けページへの案内（2026-10-30追加）。 */}
        <Link href="/senpai/recruit" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          資格ではなく、ご自身の不登校経験についてお話しいただける方はこちら →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
