import type { Metadata } from 'next';

// /gakko/favorites/page.tsxは本人のお気に入り（localStorageまたは会員アカウント紐づけ）
// を表示するだけの個人用ページで、クローラーには中身が空のページとして見える。
// 2026-11-08、「SEO最優先で」との確認の中で見つけた（metadata・robots指定が無く、
// 誰からでも同じURLでインデックスされ得る状態だった）。
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
