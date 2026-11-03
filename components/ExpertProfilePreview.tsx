import ExpertAvatar from './ExpertAvatar';

// 募集ページ（/expert/recruit・/senpai/recruit）向けの、公開プロフィールページの
// 見た目サンプル（2026-11-03追加）。「登録すればボタンが表示されてるイメージが
// わかるといい」との要望を受けて追加。実在の専門家ではなく、架空のサンプルである
// ことが一目でわかるよう、氏名はプレースホルダー、写真は使わず（ExpertAvatarの
// 汎用アイコンのみ）、カード全体に「イメージ」のラベルと破線枠をつけている。
// 実際のプロフィールページ（app/experts/[id]/page.tsx）の構成をそのまま踏襲。
export default function ExpertProfilePreview({ credentialLabel }: { credentialLabel: string }) {
  return (
    // 親カードのgap（10px程度）だけだと、下のラベルが直前の文章と詰まって
    // 見えてしまうため、marginTopで上に余白を確保する（2026-11-03、
    // 「スペースが窮屈」との指摘を受けて調整）。
    <div style={{ position: 'relative', marginTop: 14 }}>
      <div
        className="muted"
        style={{
          position: 'absolute',
          top: -10,
          left: 12,
          background: 'var(--card)',
          padding: '0 6px',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        プロフィールページのイメージ（サンプル）
      </div>
      <div
        className="card"
        style={{ gap: 12, padding: '20px 18px 18px', border: '1.5px dashed var(--border)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <ExpertAvatar photoUrl={null} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{credentialLabel}・〇〇 〇〇（仮の例）</div>
            <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>
              ○○として、不登校・行き渋りのお子さんとご家族の相談に携わってきました。お子さんのペースに合わせた関わり方を一緒に考えます。
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              経歴：教育分野（5年）
            </div>
            <span className="backlink" style={{ fontSize: 13, margin: 0 }}>
              ご本人のサイト・SNSはこちら →
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
          <span className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
            どうする先生で質問する
          </span>
          <span className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            オンライン予約はこちら →
          </span>
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          ↑ 「オンライン予約はこちら」ボタンは、登録時またはプロフィール編集で予約ページのURLを設定すると表示されます（未設定の間はこのボタン自体が出ません）。
        </div>
      </div>
    </div>
  );
}
