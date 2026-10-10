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
    <button
      onClick={logout}
      disabled={loading}
      className="muted"
      style={{
        background: 'none',
        border: 'none',
        textAlign: 'center',
        padding: '8px',
        fontSize: 13,
        textDecoration: 'underline',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'ログアウト中…' : 'ログアウト'}
    </button>
  );
}
