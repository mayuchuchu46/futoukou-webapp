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
  const [keyword, setKeyword] = useState('');

  function selectPref(p: string | null) {
    setPref(p);
    const href = p ? `/gakko?type=teiji&pref=${encodeURIComponent(p)}` : '/gakko?type=teiji';
    router.replace(href, { scroll: false });
  }

  // キーワード検索は都道府県の絞り込みより優先する（2026-11-08追加、FreeSchoolExplorer.tsxと同じ理由）。
  const trimmedKeyword = keyword.trim();
  const keywordResults = trimmedKeyword
    ? allSchools.filter((s) => `${s.name}${s.municipality ?? ''}${s.prefecture}`.includes(trimmedKeyword))
    : [];

  const schools = pref ? allSchools.filter((s) => s.prefecture === pref) : [];

  return (
    <>
      {/* キーワード検索（2026-11-08追加）。都道府県を選ばなくても学校名・市区町村名で
          全国から検索できるようにした。 */}
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>学校名・地域名で検索</div>
        <input
          className="input"
          type="search"
          placeholder="学校名や市区町村名を入力…（全国から検索）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {trimmedKeyword && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>「{trimmedKeyword}」の検索結果（{keywordResults.length}件）</div>
          {keywordResults.length === 0 ? (
            <div className="muted">「{trimmedKeyword}」に一致する定時制高校は見つかりませんでした。</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {keywordResults.map((s) => (
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
                    {s.prefecture}{s.municipality ? `${s.municipality}・` : ''}{s.publicPrivate}
                    {s.parts ? `・${s.parts}` : ''}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 都道府県の選択を結果一覧より先（上）に表示する（2026-11-01、他タブ共通で
          選ぶ→結果が下に出る順番に変更）。検索語がある間は重複表示を避けるため隠す。 */}
      {!trimmedKeyword && (
      <>
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

      {/* 都道府県も検索語も未選択の初期状態で、個別ページへのリンクが一件も存在しない
          状態を避けるための全件ディレクトリ（2026-11-10追加）。検索ボットの初回クロールで
          個別ページへの内部リンクが見つからず、サイトマップ経由でしか発見できない
          （GSC「検出 - インデックス未登録」）ページが大量発生していたための対応。
          <details>で都道府県ごとに折りたたみ、見た目は変えずにHTML上は全リンクを出す。 */}
      {!pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>すべての定時制高校を都道府県別に見る（{allSchools.length}校）</div>
          {PREFECTURES.map((p) => {
            const list = allSchools.filter((s) => s.prefecture === p);
            if (list.length === 0) return null;
            return (
              <details key={p} style={{ width: '100%' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, padding: '6px 0' }}>
                  {p}（{list.length}）
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0 8px' }}>
                  {list.map((s) => (
                    <Link key={s.no} href={`/gakko/teiji/${s.no}`} style={{ fontSize: 13, color: 'inherit' }}>
                      {s.name}{s.municipality ? `（${s.municipality}）` : ''}
                    </Link>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}

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
      </>
      )}
    </>
  );
}
