'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { EducationSupportCenter } from '@/lib/data/educationSupportCenters';
import { getEducationSupportCoverage } from '@/lib/data/educationSupportCoverage';
import { PREFECTURES } from '@/lib/data/prefectures';
import Link from 'next/link';

// 教育支援センタータブの都道府県絞り込み＋結果一覧。
// FreeSchoolExplorer.tsxと同じ理由（2026-10-24、都道府県チップが<Link>によるページ
// 遷移で反応が遅く感じられる指摘）で、useStateによるその場更新に変更した。
export default function ShienExplorer({
  allCenters,
  initialPref,
}: {
  allCenters: EducationSupportCenter[];
  initialPref: string | null;
}) {
  const router = useRouter();
  const [pref, setPref] = useState<string | null>(initialPref);

  function selectPref(p: string | null) {
    setPref(p);
    const href = p ? `/gakko?type=shien&pref=${encodeURIComponent(p)}` : '/gakko?type=shien';
    router.replace(href, { scroll: false });
  }

  const centers = pref ? allCenters.filter((s) => s.prefecture === pref) : [];
  const coverage = pref ? getEducationSupportCoverage(pref) : undefined;

  return (
    <>
      {pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>{pref}の教育支援センター</div>
          {coverage?.tier === 'none' || !coverage ? (
            <div className="muted">
              {pref}については、{coverage?.note ?? '都道府県単位でまとめた一覧は見つかりませんでした。'}教育支援センターが無いという意味ではなく、都道府県単位で一覧化した公開情報が見つからなかったということです。お住まいの市区町村にはほぼ必ず設置されているため、お子さんの学校またはお住まいの教育委員会に直接お問い合わせください。
            </div>
          ) : centers.length === 0 ? (
            <div className="muted">掲載できる情報が見つかりませんでした。</div>
          ) : (
            <>
              <div className="muted" style={{ fontSize: 12 }}>
                ※ {coverage.note} すべての施設・自治体を網羅したものではありません。
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {centers.map((s, i) => (
                  <div
                    key={`${s.city}-${s.name}-${i}`}
                    style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}
                  >
                    <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {s.city}
                      {s.address ? `・${s.address}` : ''}
                      {s.contact ? `・${s.contact}` : ''}
                    </div>
                    {s.note && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.note}</div>}
                  </div>
                ))}
              </div>
              <a
                href={centers[0].sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="muted"
                style={{ fontSize: 12, textDecoration: 'underline' }}
              >
                出典を見る ›
              </a>
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
            const count = allCenters.filter((s) => s.prefecture === p).length;
            return (
              <Link
                key={p}
                href={`/gakko?type=shien&pref=${encodeURIComponent(p)}`}
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
