import Header from '@/components/Header';

export default function PrivacyPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <div className="card" style={{ gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>プライバシーポリシー</div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>1. 基本方針</div>
            <div className="qtext">
              「どうする先生（不登校編）」（以下「本サービス」）は、ご利用いただく皆さまの個人情報の重要性を認識し、
              個人情報の保護に関する法律その他の関連法令等を遵守し、適切に取り扱います。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>2. 事業者情報</div>
            <div className="qtext">
              運営者：manapri<br />
              お問い合わせ先：mail.manapri@gmail.com
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>3. 取得する情報</div>
            <div className="qtext">
              本サービスでは、以下の情報を取得する場合があります。<br />
              ・相談内容（質問文、学年・性別など任意でご入力いただく情報を含む）<br />
              ・会員登録時のメールアドレス・パスワード（パスワードは暗号化して保存します）<br />
              ・決済に関する情報（カード番号等は保持せず、決済代行会社Stripeが管理します）<br />
              ・専門家登録時の氏名・資格情報・本人確認書類（登録証の画像・PDF）<br />
              ・IPアドレス、アクセス日時等のアクセスログ（不正利用防止・利用回数の制限のため）<br />
              ・Cookie等によるログイン状態の保持に関する情報
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>4. 利用目的</div>
            <div className="qtext">
              取得した情報は、以下の目的で利用します。<br />
              ・AIおよび専門家による相談への回答の生成・提供<br />
              ・会員登録・ログイン等の本人確認、サービスの提供<br />
              ・読み放題会員・専門家への都度質問に関する決済処理<br />
              ・専門家登録の際の本人確認（資格の確認）<br />
              ・不正利用の防止、利用回数の制限などサービスの安全な運用<br />
              ・サービス改善のための分析<br />
              ・重要なお知らせのご連絡
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>5. AIへの送信について</div>
            <div className="qtext">
              ご相談いただいた内容（質問文、学年・性別、会員の方は過去の相談履歴の一部）は、回答を生成するためAI開発会社
              Anthropic社のAPIに送信されます。送信された内容は、Anthropic社のポリシーに基づき取り扱われ、
              本サービス側で個人を特定する情報（氏名・連絡先等）と紐づけて送信することはありません。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>6. 第三者提供・業務委託先</div>
            <div className="qtext">
              本サービスは、以下の外部サービスを利用して運営しており、必要な範囲で情報を取り扱っています。<br />
              ・Anthropic（AIによる回答生成）<br />
              ・Stripe（決済処理。カード情報等は本サービスでは保持しません）<br />
              ・Supabase（データベース・ファイル保存基盤）<br />
              ・Vercel（サーバー・ホスティング基盤）<br />
              上記以外の第三者へ、ご本人の同意なく個人情報を提供することはありません（法令に基づく場合を除きます）。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>7. 投稿内容の公開について</div>
            <div className="qtext">
              ご相談いただいた内容は、入力いただいたとおりそのまま、ログイン不要・どなたでも閲覧できる「みんなの相談」ページに公開されます
              （検索エンジンの検索結果に表示される場合もあります）。
              また、各相談ページのリンクがSNS等で共有されると、質問内容の一部がプレビュー（タイトル・説明文）として表示されます。
              学年・性別以外に、個人を特定できる情報（氏名・住所・学校名等）は記載しないようお願いしています。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>8. 専門家の本人確認書類の取り扱い</div>
            <div className="qtext">
              専門家登録の際にご提出いただく登録証（資格証明書）は、本人確認の目的のみに使用し、第三者には提供しません。
              非公開のストレージに保存し、運営者のみが本人確認のために限定的に確認します。
              本人確認が完了した後は、確認が完了した事実および日時のみを記録として保持し、登録証の原本（画像・PDFファイル）は
              確認完了から30日以内に削除します。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>9. Cookieの使用について</div>
            <div className="qtext">
              本サービスでは、ログイン状態の保持等、サービスの提供に必要な範囲でCookieを使用します。
              広告配信を目的としたCookieの使用は行っていません。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>10. 安全管理措置</div>
            <div className="qtext">
              取得した個人情報は、不正アクセス・紛失・漏えい等を防止するため、アクセス制限・暗号化等の適切な安全管理措置を講じます。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>11. 開示・訂正・削除等のご請求</div>
            <div className="qtext">
              ご自身の個人情報の開示・訂正・利用停止・削除等をご希望の場合は、下記お問い合わせ先までご連絡ください。
              ご本人確認のうえ、法令に従い対応いたします。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>12. お問い合わせ窓口</div>
            <div className="qtext">
              本ポリシーに関するお問い合わせは、mail.manapri@gmail.com までご連絡ください。
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>13. 改定について</div>
            <div className="qtext">
              本ポリシーの内容は、法令の変更やサービス内容の変更等に応じて、予告なく改定することがあります。
              改定後の内容は、本ページに掲載した時点から効力を生じるものとします。<br />
              制定日：2026年10月11日
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
