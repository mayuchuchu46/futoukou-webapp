import { redirect } from 'next/navigation';

// マイページはアカウントページ（/account）に統合した（2026-10-21）。ブックマークや
// 外部リンクからの訪問に備えて、このルート自体は残しつつ/accountへ転送する。
export default function MyPageRedirect() {
  redirect('/account');
}
