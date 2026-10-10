import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'dsk_admin';

export async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === '1';
}
