// 各校の「対象学年」の文字列（freeSchools.tsのageRange等）から、対象になる学年を読み取る。
//
// 学年は 小1〜小6 = 1〜6、中1〜中3 = 7〜9、高1〜高3 = 10〜12 の番号で扱う。
// データの文字列は施設ごとにバラバラ（「小学4年～中学3年」「小・中・高」「中1～中3」等）。
// 方針：確実に読み取れる書き方だけ対応し、少しでも解釈が分かれる書き方
// （年齢表記「6～18歳」、括弧つきの条件、「小学生～」のように終わりが不明なもの等）は
// 推測せず null（＝対象学年は未確認）を返す。null は「対象外」ではなく「未確認」の意味。
export const GRADE_MIN = 1;
export const GRADE_MAX = 12;

const LEVEL_BASE: Record<string, { first: number; last: number }> = {
  小: { first: 1, last: 6 },
  中: { first: 7, last: 9 },
  高: { first: 10, last: 12 },
};

type Tok = { level: '小' | '中' | '高'; grade: number | null } | { open: true } | { preschool: true };

// 学校種（小・中・高）で始まり、あとに続くのが学年・「以上」「相当」等だけのものを対象にする。
// 「中等部」「初等部」のように途中だけ似ている語は読み取らない。
const TOKEN_RE = /^(小|中|高)(?:学生?|学校|校生?|生)?(?:(\d)(?:年生?|生)?)?(以上.*|推奨|相当|年齢|年代|生年代|まで)?$/;

function parseToken(raw: string): Tok | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.includes('高学年')) return null; // 「小高学年」等は学年が特定できない
  if (/^未就学/.test(t)) return { preschool: true };
  // 「5歳～」のように小学校入学前後の年齢が始点なら、小1から対象とみなす（終点側には使わない）
  const young = t.match(/^(\d+)\s*歳(?!.*歳)/);
  if (young && Number(young[1]) <= 6) return { preschool: true };
  const age = t.match(/(\d+)\s*歳/);
  if (age) return Number(age[1]) >= 18 ? { open: true } : null;
  if (/^(20代|成人|社会人|大学|青年)/.test(t)) return { open: true };
  const m = t.replace(/^不登校の/, '').match(TOKEN_RE);
  if (!m) return null;
  return { level: m[1] as '小' | '中' | '高', grade: m[2] ? Number(m[2]) : null };
}

function gradeOf(tok: Tok, edge: 'start' | 'end'): number | null {
  if ('open' in tok) return edge === 'end' ? GRADE_MAX : null;
  if ('preschool' in tok) return edge === 'start' ? GRADE_MIN : null;
  const b = LEVEL_BASE[tok.level];
  if (tok.grade != null) {
    const n = tok.grade;
    if (n < 1 || n > b.last - b.first + 1) return null;
    return b.first + n - 1;
  }
  return edge === 'start' ? b.first : b.last;
}

function range(a: number, b: number): number[] {
  const out: number[] = [];
  for (let g = a; g <= b; g++) out.push(g);
  return out;
}

export function parseTargetGrades(text: string | null | undefined): number[] | null {
  if (!text) return null;
  const s = text.normalize('NFKC').replace(/[~〜]/g, '～').trim(); // 全角数字・記号を半角にそろえ、範囲の記号も統一
  if (!s || s === '記載なし') return null;
  if (/[（(]/.test(s)) return null; // 括弧つきの条件は読み取らない
  if (s === '年齢不問' || s === '年齢制限なし') return range(GRADE_MIN, GRADE_MAX);

  const s2 = s.replace(/^不登校の/, '').replace(/から(?=.)/, '～');
  if (/から$/.test(s2)) return null; // 終わりが書かれていない
  if (s2.includes('～')) {
    const parts = s2.split('～');
    if (parts.length !== 2) return null;
    const [p0, p1] = parts;
    const t0 = parseToken(p0);
    if (!t0) return null;
    let t1 = parseToken(p1);
    // 「小学1～6年相当」のように終点に学校種が無ければ、始点と同じ学校種とみなす
    if (!t1 && /^\d年/.test(p1.trim()) && 'level' in t0) {
      t1 = { level: t0.level, grade: Number(p1.trim()[0]) };
    }
    if (!t1) return null;
    const a = gradeOf(t0, 'start');
    const b = gradeOf(t1, 'end');
    if (a == null || b == null || a > b) return null;
    return range(a, b);
  }

  // 範囲ではない書き方：「小・中・高」「中学生」「小中高生」「小学生以上」など
  const covered = new Set<number>();
  const items = s2.split(/[・、，,/／]/);
  for (const item of items) {
    const it = item.trim();
    if (!it) continue;
    if (/^(保護者|若者|親子|その他|一般|幼|幼児|未就学|大学|社会人|成人|青年|ひきこもり|特別支援|10)/.test(it)) continue;
    // 「小中高生」「小中学生」のように学校種が連続する書き方
    const compact = it.replace(/^不登校の/, '').match(/^([小中高]{2,3})(?:学?生|校生|学校)?(?:相当)?$/);
    if (compact) {
      for (const ch of compact[1]) {
        const b = LEVEL_BASE[ch];
        range(b.first, b.last).forEach((g) => covered.add(g));
      }
      continue;
    }
    const tok = parseToken(it);
    // 読み取れない項目が混ざる書き方（例「通信制高校に通う高校生と不登校の小学生」）は、
    // 一部だけ読んで誤った範囲を返さないよう、全体を未確認（null）にする
    if (!tok) return null;
    if ('open' in tok || 'preschool' in tok) continue;
    const b = LEVEL_BASE[tok.level];
    if (tok.grade != null) {
      const g = gradeOf(tok, 'start');
      if (g == null) return null;
      if (/以上/.test(it)) range(g, GRADE_MAX).forEach((x) => covered.add(x));
      else covered.add(g);
    } else if (/以上/.test(it)) {
      range(b.first, GRADE_MAX).forEach((x) => covered.add(x));
    } else {
      range(b.first, b.last).forEach((x) => covered.add(x));
    }
  }
  return covered.size > 0 ? Array.from(covered).sort((a, b) => a - b) : null;
}

export function gradeLabel(g: number): string {
  if (g <= 6) return `小${g}`;
  if (g <= 9) return `中${g - 6}`;
  return `高${g - 9}`;
}

// 連続した学年を「小4〜中3」のように短く表示する（表示用）。
export function formatGrades(gs: number[]): string {
  if (gs.length === 0) return '';
  const sorted = [...gs].sort((a, b) => a - b);
  const runs: [number, number][] = [];
  for (const g of sorted) {
    const last = runs[runs.length - 1];
    if (last && g === last[1] + 1) last[1] = g;
    else runs.push([g, g]);
  }
  return runs.map(([a, b]) => (a === b ? gradeLabel(a) : `${gradeLabel(a)}〜${gradeLabel(b)}`)).join('、');
}
