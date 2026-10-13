import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// AI・専門家への相談とは別に、公的な相談機関の情報もまとめて案内してほしいという
// 要望を受けて追加（2026-10-13）。電話番号・受付時間は各機関の公式サイトで確認した
// 内容のみを掲載している（記載内容の変更は各機関の公式サイトで確認のうえ行うこと）。
export default function SupportPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">相談窓口のご案内</h2>
        <div className="muted" style={{ marginTop: -8, marginBottom: 4 }}>
          「どうする先生」のAI・専門家への相談とあわせて、公的な相談機関もご活用ください。すべて無料で、匿名での相談も可能です。
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8, borderLeft: '4px solid #C0392B' }}>
          <div className="answer-label" style={{ fontSize: 14, color: '#C0392B' }}>
            緊急性が高いとき・お子さんの安全に関わるとき
          </div>
          <div className="qtext">
            AIの回答を待たず、まずこちらにご連絡ください。
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>24時間子供SOSダイヤル</div>
            <div className="qtext">
              <a href="tel:0120078310" style={{ fontWeight: 700 }}>0120-078-310</a>（24時間・無料）
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              いじめ、学校生活の不安など、子ども本人・保護者どちらからでも相談できます（文部科学省）。
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>児童相談所虐待対応ダイヤル「189」</div>
            <div className="qtext">
              <a href="tel:189" style={{ fontWeight: 700 }}>189</a>（いちはやく・24時間・無料・匿名可）
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              虐待が疑われるときの通告・相談窓口です。かけるとお近くの児童相談所につながります。
            </div>
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>子ども本人が相談したいとき</div>
          <div>
            <div style={{ fontWeight: 700 }}>チャイルドライン</div>
            <div className="qtext">
              <a href="tel:0120997777" style={{ fontWeight: 700 }}>0120-99-7777</a>（毎日16時〜21時・無料）
            </div>
            <div className="muted" style={{ fontSize: 12 }}>18歳までの子どもが対象の専用電話です。</div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>子どもの人権110番（法務省）</div>
            <div className="qtext">
              <a href="tel:0120007110" style={{ fontWeight: 700 }}>0120-007-110</a>（平日8:30〜17:15・無料）
            </div>
            <div className="muted" style={{ fontSize: 12 }}>いじめなど、子どもの人権に関する相談窓口です。</div>
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>学校生活・育児全般の相談</div>
          <div>
            <div style={{ fontWeight: 700 }}>教育支援センター（適応指導教室）</div>
            <div className="qtext">
              お住まいの市区町村の教育委員会が運営する、不登校のお子さん向けの支援機関です。学習支援や居場所づくりを行っています。
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              全国共通の電話番号は無く、自治体ごとに窓口が異なります。「（お住まいの市区町村名）　教育支援センター」で検索するか、学校・教育委員会にお問い合わせください。
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>スクールカウンセラー・スクールソーシャルワーカー</div>
            <div className="qtext">在籍校を通じて相談できます。担任の先生や学校の相談窓口にご相談ください。</div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>児童相談所相談専用ダイヤル</div>
            <div className="qtext">
              <a href="tel:0120189783" style={{ fontWeight: 700 }}>0120-189-783</a>（無料）
            </div>
            <div className="muted" style={{ fontSize: 12 }}>虐待以外の、子育て全般に関する相談も受け付けています。</div>
          </div>
        </div>

        <div className="muted" style={{ fontSize: 12 }}>
          電話番号・受付時間は2026年10月時点の情報です。最新情報は各機関の公式サイトでご確認ください。
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
