import Link from 'next/link';
import Header from '@/components/Header';

export default function TermsPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <div className="card" style={{ gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>利用規約・免責事項</div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>1. サービスの性質</div>
            <div className="qtext">
              「どうする先生（不登校編）」は、AI（Anthropic社のClaude）が生成する一般的な情報提供サービスです。
              医療的診断・心理的診断を行うものではなく、医師・公認心理師等の専門家による個別の診療・相談に代わるものではありません。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>2. ベータ版について</div>
            <div className="qtext">
              本サービスは現在試験公開中のベータ版であり、無料で提供しています。回答内容は公認心理師による監修を予定していますが、
              現時点では監修が完了していないテーマが含まれます。各回答には監修状況を表示しています。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>3. 緊急時の対応について</div>
            <div className="qtext">
              お子さまの生命・安全に関わる緊急の状況（自傷・自殺のおそれ等）が疑われる場合は、本サービスの利用にかかわらず、
              直ちに下記の窓口や医療機関、警察（110）・救急（119）に連絡してください。<br />
              24時間子供SOSダイヤル：0120-0-78310<br />
              よりそいホットライン：0120-279-338<br />
              その他の相談窓口は<Link href="/support">こちら</Link>にまとめています。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>4. 免責</div>
            <div className="qtext">
              本サービスの利用により生じたいかなる結果についても、運営者は責任を負いかねます。重要な判断は、学校・医療機関・公的な相談窓口等、専門機関への相談を併せて行ってください。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>5. 投稿内容について</div>
            <div className="qtext">
              ご相談いただいた内容は、入力いただいたとおりそのまま、ログイン不要・どなたでも閲覧できる「みんなの相談」ページに公開されます。
              また、各相談ページのリンクがSNS等で共有されると、質問内容の一部がプレビュー（タイトル・説明文）として表示されます。
              お名前・住所・学校名など、個人を特定できる情報は書かないようにしてください。不適切な投稿は運営者が削除する場合があります。
            </div>
          </div>
        </div>
        <Link href="/privacy" className="backlink" style={{ margin: '14px 0' }}>プライバシーポリシーを見る →</Link>
        <Link href="/tokushoho" className="backlink" style={{ margin: '-10px 0 14px' }}>特定商取引法に基づく表記を見る →</Link>
      </div>
    </div>
  );
}
