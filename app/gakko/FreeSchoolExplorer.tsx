'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FreeSchool } from '@/lib/data/freeSchools';
import { getFreeSchoolCoverage } from '@/lib/data/freeschoolCoverage';
import { PREFECTURES } from '@/lib/data/prefectures';
import { notFoundText } from '@/lib/emptyStateText';

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
  featuredNos = [],
}: {
  allSchools: FreeSchool[];
  initialPref: string | null;
  // 学校側課金プラン（優先表示）の土台：優先掲載フラグが立っている施設番号
  // （2026-11-07追加）。Server Componentからの受け渡しのため配列で持つ。
  featuredNos?: number[];
}) {
  const router = useRouter();
  const [pref, setPref] = useState<string | null>(initialPref);
  const [keyword, setKeyword] = useState('');
  const featuredSet = new Set(featuredNos);

  function selectPref(p: string | null) {
    // 画面の更新はここで即座に完了する（ネットワーク待ちなし）。
    setPref(p);
    const href = p ? `/gakko?type=free&pref=${encodeURIComponent(p)}` : '/gakko?type=free';
    router.replace(href, { scroll: false });
  }

  // キーワード検索（施設名・市区町村・都道府県）は都道府県の絞り込みより優先する。
  // 都道府県を選ばなくても全国から施設名で探せるようにしたいとの要望を受けて追加
  // （2026-11-08）。都道府県を選んでいても、検索語があればそちらを優先して全国から
  // 検索する（都道府県の選択状態自体は保持し、検索語を消せば元の一覧表示に戻る）。
  const trimmedKeyword = keyword.trim();
  const keywordResults = trimmedKeyword
    ? [...allSchools.filter((s) => `${s.name}${s.city}${s.prefecture}`.includes(trimmedKeyword))].sort(
        (a, b) => Number(featuredSet.has(b.no)) - Number(featuredSet.has(a.no))
      )
    : [];

  const freeSchools = pref
    ? [...allSchools.filter((s) => s.prefecture === pref)].sort(
        (a, b) => Number(featuredSet.has(b.no)) - Number(featuredSet.has(a.no))
      )
    : [];
  const coverage = pref ? getFreeSchoolCoverage(pref) : undefined;

  return (
    <>
      {/* キーワード検索（2026-11-08追加）。都道府県を選ばなくても施設名・市区町村名で
          全国から検索できるようにした。 */}
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>施設名・地域名で検索</div>
        <input
          className="input"
          type="search"
          placeholder="施設名や市区町村名を入力…（全国から検索）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {trimmedKeyword && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>「{trimmedKeyword}」の検索結果（{keywordResults.length}件）</div>
          {keywordResults.length === 0 ? (
            <div className="muted">「{trimmedKeyword}」に一致するフリースクールは見つかりませんでした。</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {keywordResults.map((s) => (
                <Link
                  key={s.no}
                  href={`/gakko/free/${s.no}`}
                  style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="qtext" style={{ fontWeight: 700 }}>
                    {s.name}
                    {featuredSet.has(s.no) && (
                      <span className="chip chip-tag" style={{ fontSize: 10, fontWeight: 700, marginLeft: 6, background: '#FFE49A' }}>
                        PR
                      </span>
                    )}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {s.prefecture}{s.city}
                    {s.address ? `・${s.address}` : ''}
                    {s.contact ? `・${s.contact}` : ''}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 都道府県の選択を結果一覧より先（上）に表示する（2026-11-01、選んだ直後に
          結果が選択UIより上に出て見つけにくいとの指摘を受けて、他タブ共通で
          選ぶ→結果が下に出る順番に変更）。検索語がある間は下の都道府県別一覧を
          隠す（検索結果と重複して見えるのを避けるため）。 */}
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

      {/* 都道府県も検索語も未選択の初期状態で、個別ページへのリンクが一件も存在しない
          状態を避けるための全件ディレクトリ（2026-11-10追加、TeijiExplorer.tsxと同じ理由）。 */}
      {!pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>すべてのフリースクールを都道府県別に見る（{allSchools.length}件）</div>
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
                    <Link key={s.no} href={`/gakko/free/${s.no}`} style={{ fontSize: 13, color: 'inherit' }}>
                      {s.name}
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
          <div className="answer-label" style={{ fontSize: 14 }}>{pref}のフリースクール</div>
          {coverage?.tier === 'none' || coverage?.tier === 'unprocessed' ? (
            <div className="muted">
              {notFoundText(pref, 'フリースクールの公開された一覧', `${coverage.note}お近くの教育委員会やスクールカウンセラーに直接お問い合わせください。`)}
            </div>
          ) : freeSchools.length === 0 ? (
            <div className="muted">{notFoundText(pref, '掲載できるフリースクールの情報')}</div>
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
                    <div className="qtext" style={{ fontWeight: 700 }}>
                      {s.name}
                      {featuredSet.has(s.no) && (
                        <span className="chip chip-tag" style={{ fontSize: 10, fontWeight: 700, marginLeft: 6, background: '#FFE49A' }}>
                          PR
                        </span>
                      )}
                    </div>
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
      </>
      )}
    </>
  );
}
