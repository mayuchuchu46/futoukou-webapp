'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PREFECTURES } from '@/lib/data/prefectures';
import { ATTENDANCE_STYLE_LABEL, type AttendanceStyle } from '@/lib/data/correspondenceHighSchools';

export type ShindanSchool = {
  no: number;
  name: string;
  prefecture: string;
  municipality: string;
  operator: string;
  campusPrefectures: string[];
  attendanceStyles: AttendanceStyle[];
  attendanceFlexible: boolean;
  attendanceNote: string | null;
  hasMentalCare: boolean;
};

type Freq = AttendanceStyle | 'any';

const FREQ_OPTIONS: { value: Freq; label: string }[] = [
  { value: 'any', label: 'まだ決めていない' },
  { value: 'daily', label: '毎日（週5日）通いたい' },
  { value: 'part', label: '週2〜4日通いたい' },
  { value: 'weekly1', label: '週1日程度から始めたい' },
  { value: 'schooling', label: 'ほとんど通わず、年に数回の登校にしたい' },
  { value: 'online', label: 'オンライン中心で学びたい' },
];

export default function ShindanClient({ schools }: { schools: ShindanSchool[] }) {
  const [pref, setPref] = useState('');
  const [freq, setFreq] = useState<Freq>('any');
  const [needMentalCare, setNeedMentalCare] = useState(false);
  const [done, setDone] = useState(false);

  const result = useMemo(() => {
    // 地域：広域通信制は本校の都道府県以外からも入学できる。東京都は出典一覧の性質上
    // 全校が対象（app/gakko/TsushinExplorer.tsxと同じ扱い）。地域未選択は全校。
    // 地域に本校・キャンパスがある学校を先に、それ以外（オンライン等で入学可能な学校）は後ろに置く。
    const inRegion = (s: ShindanSchool) =>
      !pref || pref === '東京都' || s.prefecture === pref || s.campusPrefectures.includes(pref);

    const candidates = schools.filter((s) => (needMentalCare ? s.hasMentalCare : true));
    const matchFreq = (s: ShindanSchool) =>
      freq === 'any' ? 'n/a' : s.attendanceStyles.includes(freq) ? 'confirmed' : s.attendanceFlexible ? 'flexible' : 'unknown';

    const tiers: { confirmed: ShindanSchool[]; flexible: ShindanSchool[]; unknown: ShindanSchool[] } = {
      confirmed: [],
      flexible: [],
      unknown: [],
    };
    for (const s of candidates) {
      const m = matchFreq(s);
      if (m === 'confirmed' || m === 'n/a') tiers.confirmed.push(s);
      else if (m === 'flexible') tiers.flexible.push(s);
      else tiers.unknown.push(s);
    }
    // 各グループ内：地域に本校・キャンパスがある学校 → それ以外。同順位はデータ順（安定ソート）。
    const byRegion = (a: ShindanSchool, b: ShindanSchool) => (inRegion(b) ? 1 : 0) - (inRegion(a) ? 1 : 0);
    tiers.confirmed.sort(byRegion);
    tiers.flexible.sort(byRegion);
    tiers.unknown.sort(byRegion);
    return { ...tiers, inRegion };
  }, [schools, pref, freq, needMentalCare]);

  function remember() {
    try {
      sessionStorage.setItem('outSrc', 'shindan');
    } catch {
      // 無視
    }
  }

  function row(s: ShindanSchool) {
    const local = pref && pref !== '東京都' && result.inRegion(s);
    return (
      <Link
        key={s.no}
        href={`/gakko/tsushin/${s.no}`}
        onClick={remember}
        style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
      >
        <div className="qtext" style={{ fontWeight: 700 }}>{s.name}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          本校：{s.prefecture}{s.municipality}・設置者：{s.operator}
          {local && <>　／ {pref}に{s.prefecture === pref ? '本校' : 'キャンパス等'}あり</>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {s.attendanceStyles.map((a) => (
            <span key={a} className="chip chip-tag" style={{ fontSize: 11 }}>{ATTENDANCE_STYLE_LABEL[a]}</span>
          ))}
          {s.hasMentalCare && <span className="chip chip-tag" style={{ fontSize: 11 }}>心のケア専門職の配置を確認</span>}
        </div>
        {s.attendanceNote && (
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.attendanceNote}</div>
        )}
      </Link>
    );
  }

  const groupTitle = (label: string, n: number, sub?: string) => (
    <div style={{ width: '100%' }}>
      <div className="answer-label" style={{ fontSize: 14 }}>{label}（{n}校）</div>
      {sub && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <>
      <div className="card" style={{ alignItems: 'flex-start', gap: 14 }}>
        <label style={{ width: '100%' }}>
          <div className="answer-label" style={{ fontSize: 14, marginBottom: 6 }}>1. お住まいの都道府県</div>
          <select className="input" value={pref} onChange={(e) => { setPref(e.target.value); setDone(false); }}>
            <option value="">指定しない</option>
            {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <div style={{ width: '100%' }}>
          <div className="answer-label" style={{ fontSize: 14, marginBottom: 6 }}>2. 通う頻度の希望</div>
          <div className="chip-row chip-row-wrap">
            {FREQ_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`chip chip-tag${freq === o.value ? ' active' : ''}`}
                onClick={() => { setFreq(o.value); setDone(false); }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <div className="answer-label" style={{ fontSize: 14, marginBottom: 6 }}>3. 心のケアの専門職</div>
          <div className="chip-row chip-row-wrap">
            <button type="button" className={`chip chip-tag${!needMentalCare ? ' active' : ''}`} onClick={() => { setNeedMentalCare(false); setDone(false); }}>
              特にこだわらない
            </button>
            <button type="button" className={`chip chip-tag${needMentalCare ? ' active' : ''}`} onClick={() => { setNeedMentalCare(true); setDone(false); }}>
              専門職の配置を確認できた学校だけ
            </button>
          </div>
        </div>
        <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={() => setDone(true)}>
          結果を見る
        </button>
      </div>

      {done && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 12 }}>
          {result.confirmed.length + result.flexible.length + result.unknown.length === 0 && (
            <div className="muted">この条件で確認できた学校はありませんでした。条件をゆるめてみてください。</div>
          )}
          {result.confirmed.length > 0 && (
            <>
              {groupTitle(
                freq === 'any' ? '条件に合う学校' : '希望の通い方ができると確認できた学校',
                result.confirmed.length,
                pref && pref !== '東京都' ? `${pref}に本校・キャンパスがある学校を先に表示しています。広域通信制は他の都道府県からも入学できます。` : undefined
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>{result.confirmed.map(row)}</div>
            </>
          )}
          {result.flexible.length > 0 && (
            <>
              {groupTitle('登校日数を相談・選べると確認できた学校', result.flexible.length, '希望の頻度に合うかどうかは、学校に直接確認してください。')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>{result.flexible.map(row)}</div>
            </>
          )}
          {result.unknown.length > 0 && (
            <details style={{ width: '100%' }}>
              <summary className="muted" style={{ cursor: 'pointer', fontSize: 13 }}>
                通う頻度が確認できていない学校（{result.unknown.length}校）を見る
              </summary>
              <div className="muted" style={{ fontSize: 12, margin: '6px 0' }}>
                希望に合わないという意味ではなく、公式情報で確認できていない学校です。
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>{result.unknown.map(row)}</div>
            </details>
          )}
        </div>
      )}
    </>
  );
}
