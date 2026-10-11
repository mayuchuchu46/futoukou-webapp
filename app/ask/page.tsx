'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { CATS, Category } from '@/lib/categories';
import { GRADE_OPTIONS, GENDER_OPTIONS } from '@/lib/types';
import { getUid, hasAgreedTerms, setAgreedTerms } from '@/lib/uid';

const CATEGORY_KEYS = Object.keys(CATS) as Category[];

export default function AskPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>(CATEGORY_KEYS[0]);
  const [text, setText] = useState('');
  const [grade, setGrade] = useState('');
  const [gender, setGender] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expertSubmitting, setExpertSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [needsTerms, setNeedsTerms] = useState(false);
  const [expertAvailable, setExpertAvailable] = useState(false);
  const [memberActive, setMemberActive] = useState(false);

  useEffect(() => {
    setNeedsTerms(!hasAgreedTerms());
    fetch('/api/experts/available')
      .then((r) => r.json())
      .then((d) => setExpertAvailable(!!d.available))
      .catch(() => setExpertAvailable(false));
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setMemberActive(!!d.active))
      .catch(() => setMemberActive(false));
  }, []);

  async function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, text, author_id: getUid(), grade: grade || null, gender: gender || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      router.push(`/result/${data.consultation.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
      setSubmitting(false);
    }
  }

  async function submitToExpert() {
    if (!text.trim()) return;
    setExpertSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/expert-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, text, author_id: getUid(), grade: grade || null, gender: gender || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || '失敗しました');
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
      setExpertSubmitting(false);
    }
  }

  if (needsTerms) {
    return (
      <div className="app-shell">
        <Header supervised={false} />
        <div className="main">
          <h2 className="pagetitle">ご利用前の確認</h2>
          <div className="card">
            <div className="qtext">
              このアプリの回答はAIによる一般的な情報提供であり、医療的・心理的な診断ではありません。
              重大な判断の際は、専門機関（学校・医療機関・公的な相談窓口）に相談してください。
              詳しくは利用規約をご確認ください。
            </div>
          </div>
          <a className="btn-secondary" href="/terms" target="_blank">利用規約を見る</a>
          <a className="btn-secondary" href="/privacy" target="_blank">プライバシーポリシーを見る</a>
          <button
            className="btn-primary"
            onClick={() => {
              setAgreedTerms();
              setNeedsTerms(false);
              fetch('/api/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author_id: getUid() }),
              }).catch(() => {});
            }}
          >
            同意して相談をはじめる
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">質問する</h2>
        <div className="muted" style={{ marginBottom: 8 }}>どのような内容ですか？当てはまるテーマを選んでください</div>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORY_KEYS.map((key) => (
            <option key={key} value={key}>{CATS[key].label}</option>
          ))}
        </select>

        <div className="muted" style={{ margin: '14px 0 6px' }}>お子さんの学年（任意）</div>
        <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">選択しない</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <div className="muted" style={{ margin: '14px 0 6px' }}>性別（任意）</div>
        <div className="genderrow">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              className={`genderbtn ${gender === g ? 'selected' : ''}`}
              onClick={() => setGender(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="muted" style={{ margin: '14px 0 6px' }}>状況をくわしく教えてください</div>
        <textarea
          className="input"
          rows={8}
          placeholder="例：小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="noticebox">
          入力いただいた内容はそのまま「みんなの相談」に公開されるため、お名前・住所・学校名など個人を特定できる情報は書かないでください。つらい状況のときは、無理に詳しく書かなくて大丈夫です。
        </div>

        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}

        <button className="btn-primary" disabled={!text.trim() || submitting || expertSubmitting} onClick={submit}>
          {submitting ? 'どうする先生が考えています…' : 'どうする先生に相談する（無料・AIが回答）'}
        </button>

        <div className="expertteaser">
          <div className="expertteaser-title">
            専門家に相談する（有料）
            {!expertAvailable && <span className="comingsoon-badge">準備中・近日公開</span>}
          </div>
          {!expertAvailable ? (
            <div className="expertteaser-desc">
              現在、本人確認が完了した専門家（公認心理師など）がまだ登録されていないため、準備中です。登録が整い次第、こちらからご利用いただけるようになります。
            </div>
          ) : memberActive ? (
            <>
              <div className="expertteaser-desc">
                登録している専門家が、数日以内にテキストで直接回答します。読み放題会員は追加で¥500（税込）です。
                <br />
                <a href="/experts">どんな専門家が回答していますか？</a>
              </div>
              <button className="btn-secondary" disabled={!text.trim() || submitting || expertSubmitting} onClick={submitToExpert}>
                {expertSubmitting ? '決済ページへ移動中…' : '¥500で専門家に相談する'}
              </button>
            </>
          ) : (
            <>
              <div className="expertteaser-desc">
                専門家への質問は、読み放題会員（月¥800）限定です。会員になると、他の利用者への専門家回答もすべて読み放題になります。
              </div>
              <a className="btn-secondary" href="/account">
                読み放題会員に登録する
              </a>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
