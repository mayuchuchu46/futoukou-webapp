'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PREFECTURES } from '@/lib/data/prefectures';
import { ATTENDANCE_STYLE_LABEL, type AttendanceStyle } from '@/lib/data/correspondenceHighSchools';
import { formatGrades, gradeLabel } from '@/lib/schoolGrade';
import { SHINDAN_TYPE_LABEL, type ShindanItem, type ShindanType } from '@/lib/shindanItems';

type Freq = AttendanceStyle | 'any';

const FREQ_OPTIONS: { value: Freq; label: string }[] = [
  { value: 'any', label: 'まだ決めていない' },
  { value: 'daily', label: '毎日（週5日）通いたい' },
  { value: 'part', label: '週2〜4日通いたい' },
  { value: 'weekly1', label: '週1日程度から始めたい' },
  { value: 'schooling', label: 'ほとんど通わず、年に数回の登校にしたい' },
  { value: 'online', label: 'オンライン中心で学びたい' },
];

const ALL_TYPES = Object.keys(SHINDAN_TYPE_LABEL) as ShindanType[];
const PAGE = 20;

export default function ShindanClient({ items }: { items: ShindanItem[] }) {
  const [grade, setGrade] = useState(0); // 0 = 未選択
  const [pref, setPref] = useState('');
  const [types, setTypes] = useState<Set<ShindanType>>(new Set(ALL_TYPES));
  const [freq, setFreq] = useState<Freq>('any');
  const [needCare, setNeedCare] = useState(false);
  const [done, setDone] = useState(false);
  const [shown, setShown] = useState<Record<string, number>>({});

  const ready = grade > 0 && !!pref;
  const touch = () => setDone(false);

  const result = useMemo(() => {
    if (!ready) return null;
    type Row = { item: ShindanItem; gradeKnown: boolean; freqState: 'n/a' | 'confirmed' | 'flexible' | 'unknown'; local: boolean };
    const rows: Row[] = [];
    for (const it of items) {
      if (!types.has(it.type)) continue;

      // 地域：通信制（広域）は他の都道府県からも入学できるので除外せず、地域に本校・キャンパスが
      // ある学校を先に並べる。オンラインは居住地を問わない。それ以外は実際に通える場所にある学校のみ。
      // （東京都は、通信制データの出典が「東京都を対象地域に含む学校」の一覧のため全校が地域内扱い）
      let local = true;
      if (it.type === 'tsushin') {
        local = pref === '東京都' || it.pref === pref || it.campusPrefs.includes(pref);
      } else if (it.pref !== null && it.pref !== pref) {
        continue;
      }

      // 学年：書かれている対象学年に含まれない学校は除外。読み取れない学校は「未確認」として残す。
      let gradeKnown = false;
      if (it.grades) {
        if (!it.grades.includes(grade)) continue;
        gradeKnown = true;
      }

      if (needCare && !it.care) continue;

      let freqState: Row['freqState'] = 'n/a';
      if (freq !== 'any') {
        freqState = it.styles.includes(freq) ? 'confirmed' : it.flexible ? 'flexible' : 'unknown';
      }
      rows.push({ item: it, gradeKnown, freqState, local });
    }
    const sure = rows.filter((r) => r.gradeKnown && (r.freqState === 'n/a' || r.freqState === 'confirmed'));
    const partial = rows.filter((r) => !sure.includes(r));
    // 並び順は確認状況と地域のみ。同順位はデータ順のまま（広告・報酬は使わない）。
    const byLocal = (a: Row, b: Row) => (b.local ? 1 : 0) - (a.local ? 1 : 0);
    sure.sort(byLocal);
    partial.sort((a, b) => {
      const rank = (r: Row) => (r.gradeKnown ? 0 : 1) + (r.freqState === 'flexible' ? 0 : r.freqState === 'unknown' ? 0.5 : 0);
      return rank(a) - rank(b) || byLocal(a, b);
    });
    return { sure, partial };
  }, [items, ready, grade, pref, types, freq, needCare]);

  function remember() {
    try {
      sessionStorage.setItem('outSrc', 'shindan');
    } catch {
      // 無視
    }
  }

  function toggleType(t: ShindanType) {
    const next = new Set(types);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setTypes(next);
    touch();
  }

  function card(r: { item: ShindanItem; gradeKnown: boolean; freqState: string; local: boolean }) {
    const s = r.item;
    return (
      <Link
        key={s.id}
        href={s.href}
        onClick={remember}
        style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
      >
        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          {SHINDAN_TYPE_LABEL[s.type]}
          {s.pref ? `・${s.pref}${s.city}` : '・全国どこからでも'}
          {s.sub ? `・${s.sub}` : ''}
          {s.type === 'tsushin' && !r.local && pref ? `（${pref}に本校・キャンパス等は未確認。広域のため入学できる場合があります）` : ''}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {r.gradeKnown && s.grades && (
            <span className="chip chip-tag" style={{ fontSize: 11 }}>対象：{formatGrades(s.grades)}</span>
          )}
          {!r.gradeKnown && <span className="chip chip-tag" style={{ fontSize: 11 }}>対象学年は未確認</span>}
          {s.styles.map((a) => (
            <span key={a} className="chip chip-tag" style={{ fontSize: 11 }}>{ATTENDANCE_STYLE_LABEL[a]}</span>
          ))}
          {r.freqState === 'flexible' && <span className="chip chip-tag" style={{ fontSize: 11 }}>登校日数は相談・選択可（希望に合うかは要確認）</span>}
          {r.freqState === 'unknown' && <span className="chip chip-tag" style={{ fontSize: 11 }}>通う頻度は未確認</span>}
          {s.care && <span className="chip chip-tag" style={{ fontSize: 11 }}>心のケア専門職の配置を確認</span>}
        </div>
        {s.attendanceNote && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.attendanceNote}</div>}
      </Link>
    );
  }

  function section(key: string, title: string, sub: string, rows: Parameters<typeof card>[0][], open: boolean) {
    if (rows.length === 0) return null;
    const byType = ALL_TYPES.map((t) => ({ t, list: rows.filter((r) => r.item.type === t) })).filter((g) => g.list.length > 0);
    return (
      <details open={open} style={{ width: '100%' }}>
        <summary className="answer-label" style={{ fontSize: 14, cursor: 'pointer' }}>
          {title}（{rows.length}校）
        </summary>
        <div className="muted" style={{ fontSize: 12, margin: '4px 0 8px' }}>{sub}</div>
        {byType.map(({ t, list }) => {
          const k = `${key}-${t}`;
          const n = shown[k] || PAGE;
          return (
            <div key={t} style={{ width: '100%', marginBottom: 14 }}>
              <div className="muted" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                {SHINDAN_TYPE_LABEL[t]}（{list.length}校）
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {list.slice(0, n).map(card)}
              </div>
              {list.length > n && (
                <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={() => setShown({ ...shown, [k]: n + PAGE })}>
                  さらに表示（残り{list.length - n}校）
                </button>
              )}
            </div>
          );
        })}
      </details>
    );
  }

  return (
    <>
      <div className="card" style={{ alignItems: 'flex-start', gap: 14 }}>
        <label style={{ width: '100%' }}>
          <div className="answer-label" style={{ fontSize: 14, marginBottom: 6 }}>1. お子さんの学年（必須）</div>
          <select className="input" value={grade} onChange={(e) => { setGrade(Number(e.target.value)); touch(); }}>
            <option value={0}>選択してください…</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>{gradeLabel(g)}</option>
            ))}
          </select>
        </label>
        <label style={{ width: '100%' }}>
          <div className="answer-label" style={{ fontSize: 14, marginBottom: 6 }}>2. お住まいの都道府県（必須）</div>
          <select className="input" value={pref} onChange={(e) => { setPref(e.target.value); touch(); }}>
            <option value="">選択してください…</option>
            {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <div style={{ width: '100%' }}>
          <div className="answer-label" style={{ fontSize: 14, marginBottom: 6 }}>3. 学校の種類（外すと結果に出ません）</div>
          <div className="chip-row chip-row-wrap">
            {ALL_TYPES.map((t) => (
              <button key={t} type="button" className={`chip chip-tag${types.has(t) ? ' active' : ''}`} onClick={() => toggleType(t)}>
                {SHINDAN_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <div className="answer-label" style={{ fontSize: 14, marginBottom: 6 }}>4. 通う頻度の希望</div>
          <div className="chip-row chip-row-wrap">
            {FREQ_OPTIONS.map((o) => (
              <button key={o.value} type="button" className={`chip chip-tag${freq === o.value ? ' active' : ''}`} onClick={() => { setFreq(o.value); touch(); }}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            通う頻度を確認できているのは、いまは通信制高校の一部とオンラインのフリースクールだけです。それ以外の学校は「通う頻度は未確認」として表示されます。
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <div className="answer-label" style={{ fontSize: 14, marginBottom: 6 }}>5. 心のケアの専門職</div>
          <div className="chip-row chip-row-wrap">
            <button type="button" className={`chip chip-tag${!needCare ? ' active' : ''}`} onClick={() => { setNeedCare(false); touch(); }}>
              特にこだわらない
            </button>
            <button type="button" className={`chip chip-tag${needCare ? ' active' : ''}`} onClick={() => { setNeedCare(true); touch(); }}>
              専門職の配置を確認できた学校だけ
            </button>
          </div>
          {needCare && (
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              配置の調査をしているのは通信制高校と学びの多様化学校だけです。それ以外の種類は、この条件では出ません。
            </div>
          )}
        </div>
        <button type="button" className="btn-primary" style={{ width: '100%' }} disabled={!ready} onClick={() => setDone(true)}>
          {ready ? '結果を見る' : '学年と都道府県を選んでください'}
        </button>
      </div>

      {done && result && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 14 }}>
          {result.sure.length + result.partial.length === 0 && (
            <div className="muted">この条件で見つかった学校はありませんでした。学校の種類や条件をゆるめてみてください。</div>
          )}
          {section(
            'sure',
            '条件に合うと確認できた学校',
            `${gradeLabel(grade)}が対象と確認できた学校です。${pref}にある学校を表示しています（通信制高校とオンラインは他の都道府県からも利用できるため、${pref}にあるものを先に並べています）。`,
            result.sure,
            true
          )}
          {section(
            'partial',
            '一部が未確認の学校',
            '対象学年や通う頻度がデータから確認できていない学校です。「合わない」という意味ではないので、詳細ページや公式サイトで確認してください。',
            result.partial,
            result.sure.length === 0
          )}
        </div>
      )}
    </>
  );
}
