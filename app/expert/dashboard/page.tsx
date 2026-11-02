import { redirect } from 'next/navigation';

// 2026-11-01、専門家・経験者の管理内容（回答待ちキュー・回答済み一覧・ご登録状況）は
// アカウントページ（app/account/ExpertSection.tsx）に統合した。このURLへの既存の
// リンク・ブックマーク・ログイン後リダイレクトを壊さないよう、ページ自体は残して
// /accountへ転送するだけにしている。
export default function ExpertDashboardPage() {
  redirect('/account');
}
