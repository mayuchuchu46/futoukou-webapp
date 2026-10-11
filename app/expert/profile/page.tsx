import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentExpert } from '@/lib/expertAuth';
import ProfileClient from './ProfileClient';

export default function ExpertProfilePage() {
  // Cache Componentsではcookies()を読むコンポーネントをSuspense配下に置かないと、
  // レンダリング結果がCDNの共有キャッシュに乗ってしまい、別の専門家・未ログインの訪問者にも
  // 直前にアクセスした人のプロフィールがそのまま配信される（instant=falseだけでは防げない）。
  return (
    <Suspense fallback={null}>
      <ExpertProfileContent />
    </Suspense>
  );
}

async function ExpertProfileContent() {
  const expert = await getCurrentExpert();
  if (!expert) redirect('/expert/login');
  return <ProfileClient expert={expert} />;
}
