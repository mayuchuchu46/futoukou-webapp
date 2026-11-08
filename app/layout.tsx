import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

// manapri.netと同じGoogleアナリティクス（GA4）アカウントに、どうする先生用の
// プロパティも登録したいとの要望を受けて追加（2026-10-14）。測定ID未設定の環境
// （ローカル開発など）では読み込まないよう、環境変数が無ければ何も出さない。
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // サイト全体のOrganization/WebSite構造化データ（2026-11-08、「SEO最優先で」との
  // 指摘を受けて追加。従来このサイトには構造化データが学校詳細ページ等の個別ページ
  // にしか無く、サイト全体の名前・ロゴ・検索窓を示すものが無かった）。
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/assets/sensei_logo.png`,
      },
      {
        // SearchActionは「/」に?qを処理する検索機能が実在しないため削除
        // （2026-11-08。機能しないアクションを構造化データに書くと無効なデータに
        // なるだけで、サイトリンク検索ボックスの前提を満たさない）。
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
    ],
  };

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        {/* Vercel Web Analytics（訪問者数の計測）。2026-10-13、プロジェクトのAnalytics
            タブでEnableし、計測用コンポーネントを追加。 */}
        <Analytics />
        {/* Googleアナリティクス（GA4）。NEXT_PUBLIC_GA_MEASUREMENT_IDをVercelの環境変数に
            設定すると有効になる（2026-10-14追加）。 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
