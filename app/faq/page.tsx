import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// よくある質問ページ（2026-10-16追加）。/aboutは「どうする先生とは」というサービス
// 紹介のページとして設計されているため、匿名性・料金・退会など「使う前の不安」に
// 答える個別の質問は、別ページとして切り出した方がFAQPage構造化データとも相性が良く、
// 不安ベースの検索（「不登校 相談 匿名」等）にも強い（「おすすめは？」との質問を
// 受けて/aboutへの追記ではなく独立ページを選んだ）。
export const metadata: Metadata = {
  title: `よくあるご質問｜${SITE_NAME}`,
  description: '匿名性・料金・子どものプロフィール機能・退会など、「どうする先生」の使い方についてよくいただくご質問にお答えします。',
  alternates: { canonical: `${SITE_URL}/faq` },
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: '相談した内容は公開されますか？匿名で使えますか？',
    a: (
      <>
        入力した相談文とAIの回答は、そのまま「みんなの相談」に公開されます。投稿画面にもその旨を表示しています。氏名やメールアドレスなど、会員登録情報が公開されることはなく、登録・ログインなしでも匿名のまま利用できます。
        <br />
        入力いただく学年・性別は回答の精度を上げるために使いますが、公開ページには表示されません。会員登録後の「お子さんのプロフィール」で設定した名前も、ご自身の画面（お子さんのプロフィール・相談する画面・伴走ノート）にのみ表示され、公開されることはありません。
      </>
    ),
  },
  {
    q: '無料で使えますか？',
    a: (
      <>
        AIへの相談は、登録不要・匿名のまま無料でご利用いただけます（お一人1日10回まで）。会員登録（無料）すると、これまでの相談を「伴走ノート」としてまとめて見られるようになります。
      </>
    ),
  },
  {
    q: '子どものプロフィールって何ですか？登録しないといけませんか？',
    a: (
      <>
        兄弟・姉妹それぞれの状況を分けて記録したい場合に使う機能です。アカウントの「お子さんのプロフィール」から追加でき（お一人の会員につき3人まで）、相談する画面でどのお子さんのことかを選べます。
        <br />
        登録しなくても、今まで通りアカウント全体で1つの伴走ノートとしてご利用いただけます。登録したお子さんの名前は非公開で、ご自身の画面にのみ表示されます。
      </>
    ),
  },
  {
    q: '「みんなのデータ」って何ですか？',
    a: (
      <>
        「起床時間」「学校の話をしたか」など、毎日かわる簡単な選択式の質問に答えるだけの機能です。会員登録（無料）すると使えます。あなたの回答そのものは非公開ですが、答えるとその日みんながどう答えているかの集計グラフが見られます。
        <br />
        気づいたことをメモ代わりに記録しておける機能で、答えた内容は伴走ノートの状況整理にも活用されます。
      </>
    ),
  },
  {
    q: '退会したい・データを削除してほしいのですが',
    a: (
      <>
        現在、アプリ内で退会やデータ削除を行う機能はご用意していません。削除をご希望の場合は、
        <a href="mailto:mail.manapri@gmail.com" style={{ color: 'var(--main)', textDecoration: 'underline' }}>
          mail.manapri@gmail.com
        </a>
        までご連絡ください。ご本人確認のうえ対応いたします。
      </>
    ),
  },
  {
    q: '専門家への相談は、いつ回答が届きますか？',
    a: (
      <>
        専門家ご本人が相談文を直接読んで回答するため、数日以内の返信となります。チャットのようにすぐ返信が来る機能ではないため、お急ぎの場合はAIへの相談もあわせてご利用ください。なお専門家への有料相談は現在準備中で、近日公開予定です。
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/about" className="backlink">← どうする先生とはに戻る</Link>
          <h2 className="pagetitle">よくあるご質問</h2>

          {FAQS.map((item) => (
            <div key={item.q} className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>Q. {item.q}</div>
              <div className="qtext">A. {item.a}</div>
            </div>
          ))}

          <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>緊急性が高いとき</div>
            <div className="qtext">
              AIの回答を待たず、学校や医療機関、公的な相談窓口にご連絡ください。
            </div>
            <Link href="/support" className="btn-secondary">相談窓口の一覧を見る</Link>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
