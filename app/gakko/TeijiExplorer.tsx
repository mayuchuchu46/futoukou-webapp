'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { TeijiseiHighSchool } from '@/lib/data/teijiseiHighSchools';
import { PREFECTURES } from '@/lib/data/prefectures';

// 定時制高校タブ（type=teiji）の都道府県絞り込み＋結果一覧。
//
// フリースクール（FreeSchoolExplorer.tsx）・教育支援センター（ShienExplorer.tsx）と
// 同じ理由（押すたびにページ全体を作り直す「反応が遅い」問題を避ける）で、
// クライアント側のuseStateでその場で絞り込み、URLはrouter.replaceで追いつかせる
// 方式に統合している（2026-10-29追加）。
//
// 定時制高校は通信制高校（広域）と違い、基本的にその都道府県・市区町村に居住・通学
// できる人が対象の「地域」の学校のため、フリースクールと同じ都道府県ベースの
// 絞り込みにしている（本校所在地を問わず入学できる「広域」の仕組みは無い）。
export default function TeijiExplorer({
  allSchools,
  initialPref,
}: {
  allSchools: TeijiseiHighSchool[];
  initialPref: string | null;
}) {
  const router = useRouter();
  const [pref, setPref] = useState<string | null>(initialPref);

  function selectPref(p: string | null) {
    setPref(p);
    const href = p ? `/gakko?type=teiji&pref=${encodeURIComponent(p)}` : '/gakko?type=teiji';
    router.replace(href, { scroll: false });
  }

  const schools = pref ? allSchools.filter((s) => s.prefecture === pref) : [];

  return (
    <>
      {pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>{pref}の定時制高校</div>
          {schools.length === 0 ? (
            <div className="muted">
              {pref}については、公開資料から定時制高校の情報を確認できませんでした。定時制高校が無いという意味ではなく、公開された一覧が見つからなかったということです。お住まいの教育委員会に直接お問い合わせください。
            </div>
          ) : (
            <>
              <div className="muted" style={{ fontSize: 12 }}>
                都道府県・市区町村教育委員会等が公開している一覧をもとにしています。すべての定時制高校を網羅したものではありません。
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {schools.map((s) => (
                  <Link
                    key={s.no}
                    href={`/gakko/teiji/${s.no}`}
                    style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="qtext" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {s.name}
                      {s.nickname && (
                        <span className="chip chip-tag" style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                          {s.nickname}
                        </span>
                      )}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {s.municipality ? `${s.municipality}・` : ''}{s.publicPrivate}
                      {s.parts ? `・${s.parts}` : ''}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>{pref ? '都道府県を選び直す' : '都道府県から探す'}</div>
        <select
          className="input"
          value={pref || ''}
          onChange={(e) => selectPref(e.target.value || null)}
        >
          <option value="">都道府県を選択…</option>
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div className="chip-row chip-row-wrap">
          {PREFECTURES.map((p) => {
            const count = allSchools.filter((s) => s.prefecture === p).length;
            return (
              <Link
                key={p}
                href={`/gakko?type=teiji&pref=${encodeURIComponent(p)}`}
                onClick={(e) => {
                  e.preventDefault();
                  selectPref(p);
                }}
                className={`chip chip-tag${pref === p ? ' active' : ''}`}
                style={{
                  textDecoration: 'none',
                  display: 'inline-block',
                  opacity: count > 0 ? 1 : 0.55,
                }}
              >
                {p}{count > 0 ? `（${count}）` : ''}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
