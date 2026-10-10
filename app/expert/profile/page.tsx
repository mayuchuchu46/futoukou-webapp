import { redirect } from 'next/navigation';
import { getCurrentExpert } from '@/lib/expertAuth';
import ProfileClient from './ProfileClient';

export const instant = false;

export default async function ExpertProfilePage() {
  const expert = await getCurrentExpert();
  if (!expert) redirect('/expert/login');
  return <ProfileClient expert={expert} />;
}
