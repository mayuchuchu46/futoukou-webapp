'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FreeSchool } from '@/lib/data/freeSchools';
import { getFreeSchoolCoverage } from '@/lib/data/freeschoolCoverage';
import { PREFECTURES } from '@/lib/data/prefectures';

// フリースクール（地域）タブの都道府県絞り込み＋結果一覧。
//
// 学びの多様化学校タブ（SchoolTypeExplorer.tsx、2026-10-19）で解決したのと同じ問題が
// このタブにも残っていた：都道府県チップが<Link>によるページ全体の遷移だったため、
// タップしてもすぐに見た目が変わらず「反応が悪い」「次の情報が出てくるまで時間が
// かかって離脱しそう」との指摘を受けた（2026-10-24）。FREE_SCHOOLS自体は695行程度の
// 静的データで元々全件クライアントに送られていたので、絞り込み自体はuseStateで
// その場で行い、URLはバックグラウンドでrouter.replaceして追いつかせる、
// SchoolTypeExplorerと同じ方式に統合した。
export default function FreeSchoolExplorer({
  allSchools,
  initialPref,
}: {
  allSchools: FreeSchool[];
  initialPref: string | null;
}) {
  const router = useRouter();
  const [pref, setPref] = useState<string | null>(initialPref);

  function selectPref(p: string | null) {
    // 画面の更新はここで即座に完了する（ネットワーク待ちなし）。
    setPref(p);
    const href = p ? `/gakko?type=free&pref=${encodeURIComponent(p)}` : '/gakko?type=free';
    router.replace(href, { scroll: false });
  }

  const freeSchools = pref ? allSchools.filter((s) => s.prefecture === pref) : [];
  const coverage = pref ? getFreeSchoolCoverage(pref) : undefined;

  return (
    <>
      {pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>{pref}のフリースクール</div>
          {coverage?.tier === 'none' || coverage?.tier === 'unprocessed' ? (
            <div className="muted">
              {pref}については、{coverage.note}フリースクールが無いという意味ではなく、公開された一覧が見つからなかったということです。お近くの教育委員会やスクールカウンセラーに直接お問い合わせください。
            </div>
          ) : freeSchools.length === 0 ? (
            <div className="muted">掲載できる情報が見つかりませんでした。</div>
          ) : (
            <>
              {coverage && (
                <div className="muted" style={{ fontSize: 12 }}>
                  ※ {coverage.note} すべてのフリースクールを網羅したものではありません。
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {freeSchools.map((s) => (
                  <Link
                    key={s.no}
                    href={`/gakko/free/${s.no}`}
                    style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {s.city}
                      {s.address ? `・${s.address}` : ''}
                      {s.contact ? `・${s.contact}` : ''}
                      {s.ageRange && s.ageRange !== '記載なし' ? `・対象：${s.ageRange}` : ''}
                    </div>
                  </Link>
                ))}
              </div>
              <a
                href={freeSchools[0].sourceUrl}
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
          {/* フリースクールタブでは、都道府県の一覧の中に「オンライン」も選択肢として
              並べておく（2026-10-18）。 */}
          <Link
            href="/gakko?type=online"
            className="chip chip-tag"
            style={{ textDecoration: 'none', display: 'inline-block', fontWeight: 700 }}
          >
            オンライン（全国どこからでも）
          </Link>
          {PREFECTURES.map((p) => {
            const count = allSchools.filter((s) => s.prefecture === p).length;
            return (
              <Link
                key={p}
                href={pref ? `/gakko?type=free&pref=${encodeURIComponent(p)}` : `/gakko?type=free&pref=${encodeURIComponent(p)}`}
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
