'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { CorrespondenceHighSchool } from '@/lib/data/correspondenceHighSchools';
import { CORRESPONDENCE_HIGH_SCHOOL_AS_OF, CORRESPONDENCE_HIGH_SCHOOL_SOURCE_URL } from '@/lib/data/correspondenceHighSchools';
import { PREFECTURES } from '@/lib/data/prefectures';

// 通信制高校（広域）タブの都道府県絞り込み＋結果一覧。
// FreeSchoolExplorer.tsx／ShienExplorer.tsxと同じ理由（2026-10-24）で、useStateに
// よるその場更新に変更した。
//
// 助成金情報（選択時にこのタブの中に表示していた）は2026-11-01に撤去した。
// 「通信制高校は広域の制度、助成金はお住まいの自治体の制度」という性質の違いが
// 噛み合っておらず、専用の「助成金・支援制度」タブ（JoseiExplorer）に一覧表示機能を
// 新設したため、ここでは軽いリンク誘導のみに差し替えている。
export default function TsushinExplorer({
  allSchools,
  initialPref,
}: {
  allSchools: CorrespondenceHighSchool[];
  initialPref: string | null;
}) {
  const router = useRouter();
  const [pref, setPref] = useState<string | null>(initialPref);

  function selectPref(p: string | null) {
    setPref(p);
    const href = p ? `/gakko?type=tsushin&pref=${encodeURIComponent(p)}` : '/gakko?type=tsushin';
    router.replace(href, { scroll: false });
  }

  // app/gakko/matome/page.tsxの同じ分岐と同じ理由（2026-10-27）：このデータの出典自体が
  // 「通信教育を行う区域に東京都を含む」学校の一覧のため、東京都が選ばれた場合は
  // 本校所在地で絞り込まず全校を対象にする。
  // 東京都以外は、本校所在地が一致する学校に加えて、campuses（キャンパス・学習センター）
  // にその都道府県が含まれる学校も対象にする（2026-10-27追加。本校所在地だけで絞り込むと、
  // 実際にその都道府県にキャンパスがある学校を取りこぼすため）。
  const filteredSchools =
    pref === '東京都'
      ? allSchools
      : pref
      ? allSchools.filter((s) => s.prefecture === pref || s.campuses?.some((c) => c.prefecture === pref))
      : allSchools;
  // 不登校生徒への対応・支援内容（note）が確認できている学校を上位に並べる（2026-10-28追加）。
  // 「ユーザーが知りたいのは支援の充実度」との方針転換を受けて、確認済み情報がある学校を
  // 埋もれさせないようにするための並び替え。note以外の並び順（都道府県内での順序）は
  // 元のデータ順のまま変えない（安定ソート）。
  const schools = [...filteredSchools].sort((a, b) => (b.note ? 1 : 0) - (a.note ? 1 : 0));
  const campusOnlySchoolNos = new Set(
    pref && pref !== '東京都'
      ? schools.filter((s) => s.prefecture !== pref).map((s) => s.no)
      : []
  );
  return (
    <>
      {/* 都道府県の選択を結果一覧より先（上）に表示する（2026-11-01、他タブ共通で
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
            // 上のschools算出と同じ理由で、東京都だけ全校を対象とした件数にする
            // （本校所在地で数えると常に0件になり、チップが「選択肢なし」に見えて
            // しまうため）。東京都以外は本校所在地＋campusesの一致件数（上のschools算出と同じ条件）。
            const count =
              p === '東京都'
                ? allSchools.length
                : allSchools.filter((s) => s.prefecture === p || s.campuses?.some((c) => c.prefecture === p)).length;
            return (
              <Link
                key={p}
                href={`/gakko?type=tsushin&pref=${encodeURIComponent(p)}`}
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
          <div className="answer-label" style={{ fontSize: 14 }}>
            {pref === '東京都' ? `${pref}にお住まいの方が入学できる通信制高校` : `本校が${pref}にある通信制高校`}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            {pref === '東京都'
              ? 'このデータに載っている学校は、本校の所在地にかかわらず、すべて東京都にお住まいの方が入学の対象になっている「広域」通信制高校です。'
              : `「広域」の通信制高校は本校の都道府県以外からも入学できます。${pref}の学校が見つからない、または少ない場合も、他の都道府県の学校が選択肢になります。`}
          </div>
          {schools.length === 0 ? (
            <div className="muted">{pref}に本校がある学校は見つかりませんでした。上記の通り、他の都道府県の学校も入学できる場合があります。</div>
          ) : (
            <>
              <div className="muted" style={{ fontSize: 12 }}>
                {CORRESPONDENCE_HIGH_SCHOOL_AS_OF}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {schools.map((s) => (
                  <Link
                    key={s.no}
                    href={`/gakko/tsushin/${s.no}`}
                    style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="qtext" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {s.name}
                      {/* 不登校生徒への対応・支援内容（note）が確認できている学校の目印
                          （2026-10-28追加）。一覧で埋もれないよう、上のソートと合わせて表示する。 */}
                      {s.note && (
                        <span className="chip chip-tag" style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                          支援情報あり
                        </span>
                      )}
                      {s.hasDedicatedMentalCareStaff && (
                        <span
                          className="muted"
                          style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--orange-text)' }}
                        >
                          心のケア専門職常駐
                        </span>
                      )}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      本校：{s.prefecture}{s.municipality ? `${s.municipality}` : ''}・設置者：{s.operator}
                      {campusOnlySchoolNos.has(s.no) && pref && (
                        <>　※本校は{s.prefecture}ですが、{pref}にキャンパス・学習センターがあります</>
                      )}
                    </div>
                    {s.note && (
                      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                        {s.note.length > 70 ? `${s.note.slice(0, 70)}…` : s.note}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
          <a
            href={CORRESPONDENCE_HIGH_SCHOOL_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="muted"
            style={{ fontSize: 12, textDecoration: 'underline' }}
          >
            出典を見る ›
          </a>
          <Link href="/gakko/shindan" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
            学校診断（学年・通う頻度で絞り込み・全種類の学校が対象）›
          </Link>
          <Link href="/gakko/tsushin/kokoro-care" className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
            心のケア専門職が常駐する学校だけを見る ›
          </Link>
        </div>
      )}

      {pref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>{pref}の助成金・支援制度</div>
          <div className="muted" style={{ fontSize: 12 }}>
            通信制高校の学費については、世帯の状況に応じて授業料の一部または全部を支援する、国の「高等学校等就学支援金」が対象になります（全国統一の制度のため、都道府県ごとの一覧は出ません）。{pref}内でフリースクール等（民間施設）の利用料を独自に助成する自治体の制度は、助成金・支援制度タブでまとめてご確認いただけます。
          </div>
          <Link href={`/gakko?type=josei&pref=${encodeURIComponent(pref)}`} className="muted" style={{ fontSize: 12, textDecoration: 'underline' }}>
            {pref}の助成金・支援制度を見る ›
          </Link>
        </div>
      )}
    </>
  );
}
