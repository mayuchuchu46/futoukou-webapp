import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// 一般利用者向けの/expertsとは別の、専門家（回答する側）募集専用ページ。
// 一覧用の個人情報（会員数など）は含まないため、ビルド時に静的化してよい。

export default function ExpertRecruitPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main">
        <Link href="/about" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>
        <h2 className="pagetitle">専門家募集</h2>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="qtext">
            「どうする先生」は、不登校のご家庭に向けたAI相談サービスです。AIの回答とは別に、公認心理師・臨床心理士など資格をお持ちの専門家本人が、利用者からの相談に直接回答する機能があります。この回答を担当していただける専門家の方を募集しています。
          </div>
          {/* 資格を持つ専門家だけでなく、不登校を経験したご家庭ご自身の体験談を聞きたいという
              ニーズに応えるため、「先輩保護者（経験者）」も募集対象に追加（2026-10-30）。 */}
          <div className="qtext">
            また、資格の有無にかかわらず、不登校を経験されたご家庭ご自身（先輩保護者）にも、その体験に基づく回答をお願いしています。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>報酬</div>
          <div className="qtext">
            回答1件（具体的な「次の一手」を含む内容）につき報酬をお支払いします。文字数の目安・金額は決まり次第こちらでお知らせします。振込は、決済代行サービスのStripe（Stripe
            Express）を通じて毎月まとめて行います。
            {/* Stripeの振込設定自体がまだ準備中のため、「登録後すぐにStripe登録を」という案内は
                実態と合わなくなっていた。準備が整い次第、登録いただいたメールアドレス宛に
                個別にご案内する運用に変更（2026-10-13）。 */}
            Stripeアカウントの登録（本人確認・振込先口座の入力）については、準備が整い次第、ご登録のメールアドレス宛にご案内します。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>回答例</div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
            ①状況の受け止め→②具体的な「次の一手」→③注意点、の順で書いていただく形式です。
          </div>
          <div className="qtext" style={{ fontSize: 13 }}>
            Q. 小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません。無理に行かせるべきか悩んでいます。通常の腹痛の症状なのか、精神的なものから来てるのか、その判断基準を知りたいです。
          </div>
          <div className="qtext" style={{ whiteSpace: 'pre-wrap', background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
            2週間にわたり毎朝腹痛を訴える場合、まず押さえておきたい判断基準は「症状が出るタイミング」です。登校前・平日の朝だけに強く出て、休日や長期休暇中は目立たないようであれば、心理的なストレスが身体症状として表れている可能性が高いと考えられます。{'\n\n'}一方で、発熱・嘔吐・下痢・体重減少を伴う場合や、休日も腹痛が続く場合は、器質的な疾患の可能性があるため、まずは小児科を受診してください。起立直後に脈拍が大きく上がる起立性調節障害も、朝の不調としてよく見られるため、あわせて確認してもらうと安心です。{'\n\n'}身体的な問題がないと分かった場合も「気持ちの問題」と決めつけず、無理に行かせるかどうかの二択ではなく、保健室登校など段階を踏んだ選択肢を一緒に考えてください。
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>登録の流れ</div>
          <ol className="qtext" style={{ margin: 0, paddingLeft: 18 }}>
            <li>登録フォームにプロフィール（資格・自己紹介・対応できる相談カテゴリ）を入力</li>
            <li>
              本人確認の方法を選択：資格をお持ちの方は「登録証（画像またはPDF）をアップロード」、先輩保護者（経験者）など資格証がない方は「オンライン通話で画面に見せて確認（または口頭で確認）」のいずれかを選べます
            </li>
            <li>運営が内容を確認（本人確認）</li>
            <li>確認完了後、相談への回答が可能になります</li>
          </ol>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>対象となる方</div>
          <div className="qtext">
            公認心理師・臨床心理士・保健師など、不登校のご家庭への対応について専門知識をお持ちの方。
          </div>
          <div className="qtext">
            また、資格の有無にかかわらず、不登校を経験されたご家庭ご自身（先輩保護者）。
          </div>
        </div>

        <Link href="/expert/register" className="btn-primary" style={{ textAlign: 'center' }}>
          専門家として登録する（事前登録受付）
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          すでに登録済みの専門家の方はこちらからログイン →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
