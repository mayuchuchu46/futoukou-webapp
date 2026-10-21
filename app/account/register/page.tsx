'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getUid } from '@/lib/uid';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 相談ページ（/result/[id]）からの「無料で登録する」経由で来た場合、
  // 登録完了後にそのページへ戻す。next は相対パス（"/"始まり）の場合のみ使う
  // （外部URLへのオープンリダイレクトを避けるため）。
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/account';
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // パスワード欄の表示・非表示の切り替え（デフォルトは非表示＝●●●●）。
  // 確認欄を追加したぶん入力ミスに気づきにくくなるので、見えるようにする手段も
  // 合わせて用意した（2026-10-12）。
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, uid: getUid() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <>
      <h2 className="pagetitle">アカウント登録</h2>
        <div className="muted" style={{ marginBottom: 4 }}>
          メールアドレスとパスワードでアカウントを作成します。
        </div>
        <form onSubmit={submit} className="card" style={{ gap: 14 }}>
          <input
            className="input"
            placeholder="お名前（任意）"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            type="email"
            placeholder="メールアドレス"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          {/* お名前・メールアドレスは相談の公開表示には一切使われないが、個人情報を
              直接入力させる画面なので、不安なく登録してもらえるよう明示する
              （相談・コメント等に表示されるのは学年・性別のみ、2026-10-13追加）。 */}
          <div className="muted" style={{ fontSize: 12 }}>
            🔒 お名前・メールアドレスは公開されません（ログインのみに使用します）。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="パスワード（8文字以上）"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ width: '100%', paddingRight: 56 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 4,
                }}
                aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              >
                {showPassword ? '隠す' : '表示'}
              </button>
            </div>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="パスワード（確認）"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          {/* メルマガ同意は、登録フォームに並べると「あえてチェックしない＝断る」という
              構図を登録のその場で作ってしまう。積極的な同意を求める特定電子メール法の
              趣旨からは、ここで聞かずアカウントページ（NewsletterPanel）でいつでも
              任意に設定できる形の方が適切という判断で、登録フォームからは削除した
              （2026-10-12）。 */}
          {/* メールアドレス・パスワードという個人情報を直接入力させる画面なので、
              /askページの同意モーダルと同様に、利用規約・プライバシーポリシーへの
              導線をここにも明示する（プライバシーポリシー自体の公表で法的要件は
              満たしているが、取得の場でも案内する方が望ましいとの判断。2026-10-12）。 */}
          <div className="muted" style={{ fontSize: 12 }}>
            ご登録により、
            <a href="/terms" target="_blank" style={{ textDecoration: 'underline' }}>利用規約</a>
            ・
            <a href="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>プライバシーポリシー</a>
            に同意したものとみなします。
          </div>
          {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? '登録中…' : '登録する'}
          </button>
          <a className="btn-ghost" href="/account/login" style={{ textAlign: 'center' }}>
            すでにアカウントをお持ちの方はこちら
          </a>
        </form>
    </>
  );
}

// 以前はHeader・BottomNav（ページ全体の外枠）までSuspenseの内側に含めてしまっていたため、
// 再サスペンド時にfallback（何も表示しない）へ一瞬切り替わるとヘッダーごと画面から消える
// 現象が起きていた（2026-10-18、トップページ・/ask・/accountで起きていたのと同じ原因）。
// ここも外枠をSuspenseの外に出し、useSearchParams()を使う本文側だけに影響範囲を絞った。
export default function AccountRegisterPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
      <BottomNav />
    </div>
  );
}
