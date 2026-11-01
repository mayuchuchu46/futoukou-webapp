'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFreeschoolSubsidiesByPrefecture, FREESCHOOL_SUBSIDIES } from '@/lib/data/freeschoolSubsidies';
import { PREFECTURES } from '@/lib/data/prefectures';

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

  const subsidies = pref ? getFreeschoolSubsidiesByPrefecture(pref) : [];

  return (
    <>
      {pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>{pref}のフリースクール等利用料助成</div>
          {subsidies.length === 0 ? (
            <div className="muted">
              {pref}については、Web検索で確認できるフリースクール等の利用料助成制度が見つかりませんでした。制度が無いという意味ではなく、見つからなかったということです。お住まいの市区町村教育委員会に直接お問い合わせください。
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {subsidies.map((s, i) => (
                <div
                  key={`${s.entity}-${s.name}-${i}`}
                  style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}
                >
                  <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    実施主体：{s.entity}{s.entityLevel === 'city' ? '（市区町村独自の制度）' : ''}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.summary}</div>
                  {s.note && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>※ {s.note}</div>}
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="muted"
                    style={{ fontSize: 12, textDecoration: 'underline', display: 'inline-block', marginTop: 4 }}
                  >
                    出典を見る ›
                  </a>
                </div>
              ))}
            </div>
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
    </>
  );
}
