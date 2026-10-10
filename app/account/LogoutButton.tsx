'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch('/api/account/logout', { method: 'POST' });
    setLoading(false);
    router.push('/');
    router.refresh();
  }

  return (
    <button className="btn-secondary" onClick={logout} disabled={loading}>
      {loading ? 'ログアウト中…' : 'ログアウト'}
    </button>
  );
}
