'use client';

import { useEffect, useMemo, useState } from 'react';
import { PREFECTURES } from '@/lib/data/prefectures';
import { getCitiesForPrefecture } from '@/lib/localSchools';
import { getMyRegion, setMyRegion, clearMyRegion, MyRegion } from '@/lib/myRegion';
import LocalSchoolsCard from './LocalSchoolsCard';

// 「自分の地域（都道府県・市区町村）」登録カード（2026-11-01追加、「自分の自治体を
// 登録すると、その自治体の情報が優先的に表示されるようにしたい」との要望を受けて）。
// ホーム画面の上部に置く。
//
// ログイン不要・匿名（lib/myRegion.ts、localStorageのみ）。市区町村は自由入力では
// なく、実際にフリースクール・学びの多様化学校のデータがある市区町村だけを
// セレクトボックスで選ばせる（lib/localSchools.ts getCitiesForPrefecture）ため、
// 登録した時点で必ず該当する施設が1件以上表示される（「登録したのに何も出ない」を
// 防ぐ）。該当施設が無い市区町村（データ未収集の地域）はそもそも選べない。
//
// localStorageの読み出しはクライアントマウント後にしかできないため、初回レンダー
// （サーバー側）ではregisteredをnullのままにし、useEffectで読み込む
// （lib/favorites.tsを使う既存コンポーネント群と同じ、hydrationズレを避けるパターン）。
export default function MyRegionCard() {
  const [registered, setRegistered] = useState<MyRegion | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftPref, setDraftPref] = useState('');
  const [draftCity, setDraftCity] = useState('');

  useEffect(() => {
    const region = getMyRegion();
    setRegistered(region);
    setLoaded(true);
  }, []);

  const citiesForDraftPref = useMemo(
    () => (draftPref ? getCitiesForPrefecture(draftPref) : []),
    [draftPref]
  );

  // 初回マウント・ページ読み込み直後（loadedがfalseの間）は、表示を一瞬だけ
  // 「未登録」状態にしてから登録済み状態に切り替わる見た目のちらつきを防ぐため、
  // 何も表示しない。
  if (!loaded) return null;

  function startEditing() {
    setDraftPref(registered?.prefecture || '');
    setDraftCity(registered?.city || '');
    setEditing(true);
  }

  function handleSave() {
    if (!draftPref || !draftCity) return;
    const region = { prefecture: draftPref, city: draftCity };
    setMyRegion(region);
    setRegistered(region);
    setEditing(false);
  }

  function handleClear() {
    clearMyRegion();
    setRegistered(null);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>お住まいの地域を登録</div>
        <div className="qtext" style={{ fontSize: 13 }}>
          登録すると、その地域にあるフリースクール・学びの多様化学校をホーム画面で優先的に表示します。ログイン不要・ブラウザだけに保存され、他の人には見えません。
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
          <select
            className="input"
            value={draftPref}
            onChange={(e) => {
              setDraftPref(e.target.value);
              setDraftCity('');
            }}
          >
            <option value="">都道府県を選択…</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            className="input"
            value={draftCity}
            disabled={!draftPref}
            onChange={(e) => setDraftCity(e.target.value)}
          >
            <option value="">
              {draftPref
                ? (citiesForDraftPref.length > 0 ? '市区町村を選択…' : 'この都道府県のデータは未収集です')
                : '先に都道府県を選択してください'}
            </option>
            {citiesForDraftPref.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" disabled={!draftPref || !draftCity} onClick={handleSave}>
            登録する
          </button>
          <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  if (!registered) {
    return (
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>お住まいの地域を登録する</div>
        <div className="qtext" style={{ fontSize: 13 }}>
          お住まいの都道府県・市区町村を登録すると、近くのフリースクール・学びの多様化学校をここに優先表示します。
        </div>
        <button type="button" className="btn-secondary" onClick={startEditing}>
          地域を登録する →
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <LocalSchoolsCard
        prefecture={registered.prefecture}
        city={registered.city}
        title={`${registered.city}の学びの場（あなたの登録地域）`}
      />
      <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
        <button
          type="button"
          className="muted"
          style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}
          onClick={startEditing}
        >
          登録地域を変更する
        </button>
        <button
          type="button"
          className="muted"
          style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}
          onClick={handleClear}
        >
          登録を解除する
        </button>
      </div>
    </div>
  );
}
