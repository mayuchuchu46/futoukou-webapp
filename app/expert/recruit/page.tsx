import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ExpertRecruitFlowDiagram from '@/components/ExpertRecruitFlowDiagram';

// 一般利用者向けの/expertsとは別の、専門家（回答する側）募集専用ページ。
// 一覧用の個人情報（会員数など）は含まないため、ビルド時に静的化してよい。
//
// 「保護者と、専門家の入り口とページは別にしたい」との方針を受けて（2026-10-30）、
// 先輩保護者（経験者）向けの内容は /senpai/recruit に専用ページとして分離した。
// このページは専門家（資格をお持ちの方）専用に戻している。

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
          <div className="qtext">
            本人確認は、資格の登録証（画像またはPDF）のアップロード、またはオンライン通話で画面に見せて確認する方式のいずれかを選べます。
          </div>
        </div>

        {/* 「報酬の前に、内容（どういう形で協力するのか）を先に見せてほしい」との
            指摘を受けて追加（2026-10-31）。/senpai/recruit と同様に3パターンを先に示す。
            「①テキストでの回答（現在ご利用いただけます）」という表現が、決済代行会社の
            乗り換え作業中で実際には無償のプレ期間であることと食い違っていたため、
            EXPERT_VOLUNTEER_MODE導入（2026-10-31）にあわせて実態通りの表現に変更。
            「ボランティアで対応」という表現だと恒久的な無償運用に見えてしまうため、
            準備が整うまでの期間限定のプレ期間であることが伝わる表現に調整。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>ご協力いただく内容（3つの形）</div>
          <div className="qtext">
            <strong>①テキストでの回答</strong>（現在、プレ期間としてご利用いただけます）<br />
            届いた相談文に、ご自身のタイミングで文章で回答します（具体的な「次の一手」を含む内容）。
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
            {/* 振込設定自体がまだ準備中のため、「登録後すぐに振込先登録を」という案内は
                実態と合わなくなっていた。準備が整い次第、登録いただいたメールアドレス宛に
                個別にご案内する運用に変更（2026-10-13）。振込方法の社名（元はStripe）は
                決済代行会社の乗り換え検討中のため2026-10-31に一般表現へ変更。
                さらに、決済代行会社の乗り換え作業が完了するまでは利用者を無料開放する
                EXPERT_VOLUNTEER_MODE（lib/config.ts）を導入したため、その間は無償の
                プレ期間であることを明記（2026-10-31）。「期間限定感」が伝わるよう、
                「ボランティア」ではなく「準備が整うまでのプレ期間」という表現に調整。
                「この期間の報酬を後から支払う」という約束に聞こえる表現だと指摘を
                受けたため、記録自体はする旨は残しつつ、支払いを確約するニュアンスを
                含まない表現に修正（2026-10-31）。 */}
            決済代行会社の乗り換え作業中のため、準備が整うまでの期間限定で、利用者への質問受付を無料のプレ期間として開放しています。この期間中のご回答件数は記録していますが、正式な報酬のお支払いは、決済の準備が整ってからとなります。文字数の目安・金額は決まり次第こちらでお知らせします。
            <br />
            振込方法の詳細（本人確認・振込先口座の入力）については、準備が整い次第、ご登録のメールアドレス宛にご案内します。
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
          <ExpertRecruitFlowDiagram step2Detail="登録証アップロード、または通話" />
          <ol className="qtext" style={{ margin: 0, paddingLeft: 18 }}>
            <li>登録フォームにプロフィール（資格・自己紹介・対応できる相談カテゴリ）を入力</li>
            <li>本人確認の方法（アップロード／オンライン通話）を選択</li>
            <li>運営が内容を確認（本人確認）</li>
            <li>確認完了後、相談への回答が可能になります</li>
          </ol>
        </div>

        <Link href="/expert/register" className="btn-primary" style={{ textAlign: 'center' }}>
          専門家として登録する（事前登録受付）
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '0 0 4px', fontSize: 13 }}>
          すでに登録済みの専門家の方はこちらからログイン →
        </Link>
        {/* 専門家向けページから、先輩保護者向けページへの案内（2026-10-30追加）。 */}
        <Link href="/senpai/recruit" className="backlink" style={{ margin: '0 0 14px', fontSize: 13 }}>
          資格ではなく、ご自身の不登校経験についてお話しいただける方はこちら →
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
