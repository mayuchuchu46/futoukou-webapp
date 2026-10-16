'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Child, GRADE_OPTIONS, GENDER_OPTIONS } from '@/lib/types';

// 子どもプロフィール管理ページ（2026-10-16追加）。「兄弟で不登校のパターンが多い」
// ため、1つの会員アカウントで複数の子ども（例：息子・娘）を登録し、相談する画面で
// どちらについての相談かを選べるようにする機能のうち、プロフィールの追加・削除を
// 行う画面。子どもを1人も登録していない会員には今まで通りの挙動（アカウント全体で
// 1つのノート）が維持されるので、この画面を一度も開かない会員には影響しない。
export default function ChildrenPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [children, setChildren] = useState<Child[] | null>(null);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [gender, setGender] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // 編集機能（2026-10-16追加）。「名前を間違えた」等に、削除して登録し直すのではなく
  // その場で直せるようにする。1人ずつ、カードをインライン編集に切り替える方式。
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.loggedIn))
      .catch(() => setLoggedIn(false));
    refresh();
  }, []);

  function refresh() {
    fetch('/api/children')
      .then((r) => r.json())
      .then((d) => setChildren(d.children || []))
      .catch(() => setChildren([]));
  }

  async function addChild() {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, grade: grade || null, gender: gender || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      setName('');
      setGrade('');
      setGender('');
      refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(c: Child) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditGrade(c.grade || '');
    setEditGender(c.gender || '');
    setEditError('');
  }

  async function saveEdit(id: string) {
    if (!editName.trim() || editSubmitting) return;
    setEditSubmitting(true);
    setEditError('');
    try {
      const res = await fetch('/api/children', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName, grade: editGrade || null, gender: editGender || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      setChildren((list) => (list || []).map((c) => (c.id === id ? data.child : c)));
      setEditingId(null);
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setEditSubmitting(false);
    }
  }

  async function deleteChild(id: string) {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch('/api/children', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setChildren((list) => (list || []).filter((c) => c.id !== id));
      }
    } finally {
      setDeletingId(null);
      setConfirmingDeleteId(null);
    }
  }

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">お子さんのプロフィール</h2>
        <div className="muted" style={{ marginBottom: 4 }}>
          兄弟・姉妹それぞれで分析ノートを分けたい場合に使います。登録しなくても、今まで通りアカウント全体で1つのノートとして使えます。
        </div>
        {/* 「名前が掲載されないか不安」との声を受けて、非公開であることを明記した
            （2026-10-16追加）。ここで入力した名前は、ログイン中の本人だけが見る
            画面（このページ・相談するページの選択欄・分析ノートの切り替えタブ）
            にのみ使われ、「みんなの相談」等の公開ページには一切表示されない。 */}
        <div className="muted" style={{ marginBottom: 12, fontSize: 12 }}>
          ここで登録する名前は、ログイン中のご自身の画面にのみ表示されます。「みんなの相談」など、他の人が見られるページには一切表示されません。
        </div>

        {loggedIn === false && (
          <div className="card" style={{ gap: 8 }}>
            <div className="qtext">お子さんのプロフィールを作るには、ログインが必要です。</div>
            <Link className="btn-primary" href="/account/login?next=/account/children">
              ログイン / 無料登録
            </Link>
          </div>
        )}

        {loggedIn && (
          <>
            {children === null ? (
              <div className="muted">読み込み中…</div>
            ) : children.length === 0 ? (
              <div className="muted" style={{ marginBottom: 4 }}>まだ登録したお子さんはいません。</div>
            ) : (
              children.map((c) => (
                editingId === c.id ? (
                  <div key={c.id} className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
                    <div className="muted" style={{ fontSize: 12 }}>お名前（非公開・ご自身の画面にのみ表示）</div>
                    <input
                      className="input"
                      placeholder="名前・ニックネーム"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={30}
                    />
                    <div className="row" style={{ gap: 8, width: '100%' }}>
                      <select className="input" value={editGrade} onChange={(e) => setEditGrade(e.target.value)} style={{ flex: 1 }}>
                        <option value="">学年（任意）</option>
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <select className="input" value={editGender} onChange={(e) => setEditGender(e.target.value)} style={{ flex: 1 }}>
                        <option value="">性別（任意）</option>
                        {GENDER_OPTIONS.filter((g) => g !== '回答しない').map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    {editError && <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>{editError}</div>}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-primary" disabled={!editName.trim() || editSubmitting} onClick={() => saveEdit(c.id)}>
                        {editSubmitting ? '保存中…' : '保存する'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={c.id}
                    className="card"
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      {(c.grade || (c.gender && c.gender !== '回答しない')) && (
                        <div className="muted" style={{ fontSize: 12 }}>
                          {[c.grade, c.gender && c.gender !== '回答しない' ? c.gender : null].filter(Boolean).join('・')}
                        </div>
                      )}
                    </div>
                    {confirmingDeleteId === c.id ? (
                      <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span className="muted" style={{ fontSize: 12 }}>削除しますか？</span>
                        <button
                          onClick={() => deleteChild(c.id)}
                          disabled={deletingId === c.id}
                          style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 700, color: '#C0392B', cursor: 'pointer' }}
                        >
                          {deletingId === c.id ? '削除中…' : '削除する'}
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}
                        >
                          キャンセル
                        </button>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', gap: 14 }}>
                        <button
                          onClick={() => startEdit(c)}
                          style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteChild(c.id)}
                          style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}
                        >
                          削除
                        </button>
                      </span>
                    )}
                  </div>
                )
              ))
            )}

            <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
              <div className="answer-label" style={{ fontSize: 14 }}>お子さんを追加</div>
              <div className="muted" style={{ fontSize: 12, marginTop: -4 }}>お名前（非公開・ご自身の画面にのみ表示）</div>
              <input
                className="input"
                placeholder="名前・ニックネーム（例：息子、長男、◯◯ちゃん）"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
              />
              <div className="row" style={{ gap: 8, width: '100%' }}>
                <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)} style={{ flex: 1 }}>
                  <option value="">学年（任意）</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <select className="input" value={gender} onChange={(e) => setGender(e.target.value)} style={{ flex: 1 }}>
                  <option value="">性別（任意）</option>
                  {GENDER_OPTIONS.filter((g) => g !== '回答しない').map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              {error && <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>{error}</div>}
              <button className="btn-primary" disabled={!name.trim() || submitting} onClick={addChild}>
                {submitting ? '追加中…' : '追加する'}
              </button>
            </div>

            <Link href="/notebook" className="btn-secondary">
              分析ノートに戻る
            </Link>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
