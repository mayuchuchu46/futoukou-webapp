import type { Metadata } from 'next';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import SupportJumpNav from '@/components/SupportJumpNav';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { PREFECTURE_SUPPORT_LINKS } from '@/lib/data/prefectureSupportLinks';
import { ADOLESCENT_CLINICS } from '@/lib/data/adolescentClinics';

// 検索結果でトップページと同じtitle/descriptionになっていたため、ページ固有の
// metadataを追加（2026-10-14、SEO対策の一環）。
export const metadata: Metadata = {
  title: `相談窓口のご案内｜${SITE_NAME}`,
  description: '不登校に関する公的な相談窓口・電話相談をまとめてご案内します。すべて無料・匿名で利用できます。',
  alternates: { canonical: `${SITE_URL}/support` },
};

// AI・専門家への相談とは別に、公的な相談機関の情報もまとめて案内してほしいという
// 要望を受けて追加（2026-10-13）。電話番号・受付時間は各機関の公式サイトで確認した
// 内容のみを掲載している（記載内容の変更は各機関の公式サイトで確認のうえ行うこと）。
export default function SupportPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h1 className="pagetitle">相談窓口のご案内</h1>
        <div className="muted" style={{ marginTop: -8, marginBottom: 4 }}>
          「どうする先生」のAI・専門家への相談とあわせて、公的な相談機関もご活用ください。すべて無料で、匿名での相談も可能です。
        </div>

        <div id="emergency" className="card" style={{ alignItems: 'flex-start', gap: 8, borderLeft: '4px solid #C0392B' }}>
          <div className="answer-label" style={{ fontSize: 14, color: '#C0392B' }}>
            🚨 緊急性が高いとき・お子さんの安全に関わるとき
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

        {/* ページ内ジャンプナビ（2026-11-10追加）。カードが9個まで増え、スマホで目的の
            窓口（例：発達検査、都道府県別）にたどり着くまでのスクロール量が多くなって
            いたため、「このページのUI改善」の一環として追加。緊急カードは常に最初に
            見えるべきなので、ジャンプナビ自体はそのカードの後（＝AI相談カードの前）に
            置く。実体はSupportJumpNav（クライアントコンポーネント）— 素のaタグの
            href="#id"だと、.main（スクロールする内側のdiv）の祖先にtransformが
            付いているためのSafari既知の不具合で反応しないことが判明したため、
            scrollIntoView()を使う実装に変更した経緯がある。 */}
        <SupportJumpNav />

        {/* 「どうする先生」自身のAI・専門家・経験者への相談への案内（2026-11-09追加）。
            困っている人を早めに相談の機会につなげることがサービス最大の目的であり、
            学び場（学校情報）はその入り口の一つに過ぎないという位置づけの明確化を
            受けて、このページ（下部ナビ「相談窓口」タブの行き先）の最上部寄りに
            どうする先生自身の相談手段もまとめて置く。下の公的窓口と並べることで、
            「まずどうする先生で相談しつつ、必要なら公的窓口にもつながれる」という
            全体像を1ページで見せる。 */}
        <div id="ask-dosuru" className="card" style={{ alignItems: 'flex-start', gap: 8, border: '2px solid var(--main)', background: 'var(--sub)' }}>
          <div className="answer-label" style={{ fontSize: 14 }}>💬 まず「どうする先生」に相談する</div>
          <div className="qtext">
            登録不要・匿名で、今の状況を相談できます。AIがすぐに答え、必要に応じて専門家・経験者（先輩保護者）からの回答も届きます。
          </div>
          <a href="/ask" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', width: '100%' }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'var(--main)' }}>AIに相談する</span>
              <span style={{ display: 'block', fontSize: 12 }}>今の状況を入力するだけ。すぐに回答が返ってきます</span>
            </span>
            <span style={{ color: 'var(--main)', fontWeight: 700 }}>›</span>
          </a>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <a href="/experts" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              専門家に相談する ›
            </a>
            <a href="/senpai" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
              経験者（先輩保護者）に相談する ›
            </a>
          </div>
        </div>

        <div id="child" className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>🧒 子ども本人が相談したいとき</div>
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

        <div id="school-life" className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>🏫 学校生活・育児全般の相談</div>
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

        {/* 都道府県別の自治体相談窓口案内（2026-11-08追加）。claude/futoukou-event-links-research.md
            の調査結果（2026-11-02時点、47都道府県中27件でURL確認済み）をもとにしている。
            未確認の20都道府県は、市区町村の教育委員会への問い合わせを促す汎用案内にしている。 */}
        <div id="prefecture" className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>📍 お住まいの都道府県の相談窓口</div>
          <div className="qtext">
            都道府県の教育委員会等が案内する、不登校に関する相談窓口・支援情報のページです。お住まいの都道府県を選んでください。
          </div>
          <details style={{ width: '100%' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, padding: '4px 0' }}>
              都道府県一覧を見る
            </summary>
            <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
              {PREFECTURE_SUPPORT_LINKS.map((p) => (
                <li
                  key={p.prefecture}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 8,
                    borderBottom: '1px solid #eee',
                    padding: '6px 0',
                  }}
                >
                  <span style={{ fontWeight: 700, minWidth: '5em' }}>{p.prefecture}</span>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, textAlign: 'right' }}
                    >
                      {p.department}の案内ページへ
                    </a>
                  ) : (
                    <span className="muted" style={{ fontSize: 12, textAlign: 'right' }}>
                      お住まいの市区町村の教育委員会にお問い合わせください
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </details>
          <div className="muted" style={{ fontSize: 12 }}>
            各ページの内容・URLは2026年11月時点で確認したものです。自治体のサイトは変更されることがあるため、最新情報は各都道府県の公式サイトでご確認ください。
          </div>
        </div>

        {/* 思春期外来（児童精神科等）の個別リスト・小規模パイロット（2026-11-08追加、
            同日中に大阪府を追加）。公式ソースで確認できたものだけを掲載。口コミ・患者
            レビューは掲載しない（lib/data/adolescentClinics.tsのコメント参照）。 */}
        <div id="adolescent-clinic" className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>🏥 思春期外来（児童精神科など）</div>
          <div className="qtext">
            思春期のお子さんのこころの不調を専門にみている医療機関です。受診には予約が必要な場合がほとんどです。まずは電話や公式サイトでご確認ください。
          </div>
          {/* 件数（都道府県×医療機関）が増えたため、プレーンな箇条書きだと1件ずつの
              境界が見えにくくなっていた。1件ずつを薄い背景のカード状にして視認性を
              上げた（2026-11-10、UI改善の一環）。 */}
          {Array.from(new Set(ADOLESCENT_CLINICS.map((c) => c.prefecture))).map((pref) => (
            <div key={pref} style={{ width: '100%' }}>
              <div style={{ fontWeight: 700, fontSize: 13, margin: '8px 0 4px' }}>{pref}</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8, width: '100%' }}>
                {ADOLESCENT_CLINICS.filter((c) => c.prefecture === pref).map((c) => (
                  <li
                    key={c.name}
                    style={{ background: 'var(--sub)', borderRadius: 10, padding: '10px 12px' }}
                  >
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div className="qtext" style={{ fontSize: 13 }}>{c.departments}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{c.address}</div>
                    {c.phone && (
                      <div className="muted" style={{ fontSize: 12 }}>
                        <a href={`tel:${c.phone.replace(/[^0-9]/g, '')}`}>{c.phone}</a>
                      </div>
                    )}
                    <div className="qtext" style={{ fontSize: 13, marginTop: 4 }}>{c.note}</div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      出典：{c.sourceLabel}（{c.sourceNote}）
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="muted" style={{ fontSize: 12 }}>
            公式サイト等で確認できた医療機関のみを掲載した小規模な試験的リストです（現在は東京都・大阪府のみ）。他地域・他施設への拡充は今後検討します。掲載内容は変更される場合があるため、受診前に必ず各医療機関の公式サイト等でご確認ください。
          </div>
        </div>

        {/* 発達検査・WISCなどの相談窓口（2026-11-08追加）。医療機関ごとの実施状況を
            精密調査するのではなく、まずは東京都の公式な入口窓口（TOSCA）のみを案内する
            方針（ユーザー確認済み）。 */}
        <div id="development-test" className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>🧩 発達検査（WISCなど）の相談窓口</div>
          <div className="qtext">
            発達検査を受けられる場所は地域（児童相談所・医療機関など）によって異なります。まずは東京都の公式な相談窓口にご相談いただくと、お住まいの地域に合った案内が受けられます。
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>東京都発達障害者支援センター（こどもTOSCA）｜18歳未満</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              <a href="tel:0364130231" style={{ fontWeight: 700 }}>03-6413-0231</a>（電話・FAX・メールで予約制）
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              〒156-0055 東京都世田谷区船橋1-30-9／受付：月・火・水・木・金 9:00〜17:00
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>東京都発達障害者支援センター（おとなTOSCA）｜18歳以上</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              <a href="tel:0355798207" style={{ fontWeight: 700 }}>03-5579-8207</a>（電話で予約制）
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              〒162-0851 東京都新宿区弁天町91番地
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            出典：東京都福祉局公式サイト（fukushi.metro.tokyo.lg.jp）、港区公式サイト掲載情報（2026年11月時点）。TOSCAは相談・情報提供の窓口であり、発達検査そのものを実施する機関ではない場合があります。検査の実施場所については窓口にご相談ください。
          </div>
        </div>

        {/* 学習支援・教材情報（2026-11-08追加）。文科省の「出席扱い制度」の要件を
            正確に伝え、対応教材は中立的な事実列記にとどめる（優劣判断・ランキングは
            しない）。令和元年通知（出欠の取扱い）と令和6年通知（成績評価）を混同しない
            よう明記。 */}
        <div id="attendance-system" className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>📚 自宅での学習を「出席」として扱ってもらう制度</div>
          <div className="qtext">
            文部科学省の通知（令和元年10月25日付）により、一定の要件を満たせば、自宅でのICT等を使った学習を学校長の判断で「出席」として記録できる場合があります。
          </div>
          <div className="qtext" style={{ fontSize: 13 }}>
            主な要件（要約）：保護者と学校の十分な連携、ICT・郵送・FAX等を活用した学習、訪問等による対面指導を前提とすること、本人の理解度に応じた計画的な学習プログラムであること、校長が対面指導者からの報告等で学習状況を把握すること。
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            最終判断は在籍校の校長が行うものであり、「このサービスを使えば必ず出席扱いになる」という制度ではありません。まずは学校に相談することが前提になります。
          </div>
          <div className="muted" style={{ fontSize: 11 }}>
            出典：文部科学省「不登校児童生徒への支援の在り方について（通知）」令和元年10月25日付 元文科初第698号・別記2（mext.go.jp）。なお、令和6年8月29日付の別通知は、出欠の取扱いとは別に成績評価の要件を定めたもので、本制度とは異なる。
          </div>
        </div>

        <div id="materials" className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>✏️ 出席扱い制度への対応をアピールしている教材・サービス</div>
          <div className="qtext">
            上記の制度への対応を公式にアピールしているサービスの例です。特定のサービスを推奨するものではなく、事実の紹介にとどめています。料金・対応状況は変わることがあるため、各社公式サイトで最新情報をご確認ください。
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>すらら（すららネット）</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              無学年方式のICT教材。学校との出席扱い認定の手続きを専任担当者がサポートすると案内している。対象は小1〜高3。
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Try IT（家庭教師のトライ）</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              映像授業によるオンライン学習サービス。不登校生向けの出席扱い制度対応を案内している。
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>CKCネットワーク（Pre Step Online）</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              不登校対応のオンライン学習塾。出席扱い制度に関する無料のオンライン説明会を開催している。
            </div>
          </div>
          <div className="muted" style={{ fontSize: 11 }}>
            出典：各社公式サイト・プレスリリース（alc.co.jp、atpress.ne.jp等、2026年11月時点）。出席扱いの認定自体は学校長の判断によるものであり、サービスの利用がそのまま出席扱いを保証するものではありません。
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
