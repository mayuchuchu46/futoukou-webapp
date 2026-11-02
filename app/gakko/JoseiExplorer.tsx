'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFreeschoolSubsidiesByPrefecture, FREESCHOOL_SUBSIDIES } from '@/lib/data/freeschoolSubsidies';
import { PREFECTURES } from '@/lib/data/prefectures';
import { notFoundText } from '@/lib/emptyStateText';

// 助成金・支援制度タブの都道府県絞り込み＋結果一覧。
//
// 2026-11-01追加。それまで「助成金・支援制度」タブ（/gakko?type=josei）には説明文の
// カードしかなく、他タブ（フリースクール・教育支援センター・通信制高校等）と違って
// 都道府県を選んでも実際の制度一覧を見る手段が無かった（唯一見られたのは
// /gakko/matomeの中、または筋違いにも「通信制高校」タブに従属的に埋め込まれた表示
// のみ）。助成金データを20件→35件に拡充した直後、「反映された感じがしない」との
// 指摘を受けて初めて発覚した構造的な欠落。他タブ（FreeSchoolExplorer.tsx等）と同じ
// useStateによるその場更新パターンに合わせて新設した。
export default function JoseiExplorer({ initialPref }: { initialPref: string | null }) {
  const router = useRouter();
  const [pref, setPref] = useState<string | null>(initialPref);

  function selectPref(p: string | null) {
    setPref(p);
    const href = p ? `/gakko?type=josei&pref=${encodeURIComponent(p)}` : '/gakko?type=josei';
    router.replace(href, { scroll: false });
  }

  // 都道府県単位の制度（対象が広い）を先に、市区町村単位の制度をあとに表示する
  // （2026-11-02、「もっと見やすく」との指摘を受けて、badge表示と合わせて整理）。
  // 元のデータ順（安定ソート）は都道府県単位内・市区町村単位内でそのまま維持する。
  const subsidies = pref
    ? [...getFreeschoolSubsidiesByPrefecture(pref)].sort(
        (a, b) => (a.entityLevel === 'city' ? 1 : 0) - (b.entityLevel === 'city' ? 1 : 0)
      )
    : [];

  return (
    <>
      {/* 都道府県の選択を結果一覧より先（上）に表示する（2026-11-01、選んだ直後に
          結果が選択UIより上に出て見つけにくいとの指摘を受けて、他タブ共通で
          選ぶ→結果が下に出る順番に変更）。 */}
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
            const count = FREESCHOOL_SUBSIDIES.filter((s) => s.prefecture === p).length;
            return (
              <Link
                key={p}
                href={`/gakko?type=josei&pref=${encodeURIComponent(p)}`}
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

      {pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>{pref}のフリースクール等利用料助成</div>
          {subsidies.length === 0 ? (
            <div className="muted">
              {notFoundText(pref, 'Web検索で確認できるフリースクール等の利用料助成制度', 'お住まいの市区町村教育委員会に直接お問い合わせください。')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {/* 2026-11-02、一覧が全部同じ見た目の文字の塊で読みづらいとの指摘を受けて、
                  1件ずつ枠で区切ったカードにし、実施主体（都道府県／市区町村）をバッジ
                  で見分けられるようにした。 */}
              {subsidies.map((s, i) => (
                <div
                  key={`${s.entity}-${s.name}-${i}`}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: s.entityLevel === 'city' ? 'var(--clay-bg)' : 'var(--teal-bg)',
                        color: s.entityLevel === 'city' ? 'var(--clay-text)' : 'var(--teal-text)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.entityLevel === 'city' ? '市区町村' : '都道府県'}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{s.entity}</span>
                  </div>
                  <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.summary}</div>
                  {s.note && (
                    <div className="muted" style={{ fontSize: 12, marginTop: 4, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
                      {s.note}
                    </div>
                  )}
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="muted"
                    style={{ fontSize: 12, textDecoration: 'underline', display: 'inline-block', marginTop: 6 }}
                  >
                    出典を見る ›
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <details style={{ width: '100%' }}>
            <summary style={{ cursor: 'pointer' }} className="answer-label">
              全国の実施自治体一覧を見る（{FREESCHOOL_SUBSIDIES.length}件）
            </summary>
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', whiteSpace: 'nowrap' }}>都道府県</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', whiteSpace: 'nowrap' }}>実施主体</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px' }}>制度名</th>
                  </tr>
                </thead>
                <tbody>
                  {PREFECTURES.flatMap((p) => FREESCHOOL_SUBSIDIES.filter((s) => s.prefecture === p)).map((s, i) => (
                    <tr key={`${s.entity}-${s.name}-${i}`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => selectPref(s.prefecture)}
                          className="muted"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            font: 'inherit',
                          }}
                        >
                          {s.prefecture}
                        </button>
                      </td>
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        {s.entity}{s.entityLevel === 'city' ? '（市区町村）' : ''}
                      </td>
                      <td style={{ padding: '6px 8px' }}>{s.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </>
  );
}
