import { MANABI_TAYOUKA_GAKKO, ManabiTayoukaGakko } from './data/manabiTayoukaGakko';

// 相談文の中に、学びの多様化学校一覧（lib/data/manabiTayoukaGakko.ts）に載っている学校名が
// 出てきた場合、その学校について確認済みの情報をAIの回答プロンプトに渡すための仕組み
// （2026-10-18追加）。
//
// きっかけ：学校紹介ページ（/gakko/school/[no]）の「相談する」ボタンから学校名入りで
// 相談しても、AIが「正確な情報を持ち合わせておらず」と答えてしまい、サイト側が既に
// 持っている情報（note欄等）さえ使えていなかった。プロンプトに渡していなければAIが
// 知る手段がないのは当然のため、質問文から学校を特定し、確認済みの項目だけを明示的に
// 渡す方式にした。
//
// 注意：ここで渡すのはmanabiTayoukaGakko.ts側で既にWeb調査済み・確認済みの項目のみ。
// リアルタイムのネット検索は行わない（回答速度を優先するため、2026-10-18に
// 「ネット検索を機能として追加するか」を相談した結果、速度低下が許容できないとの
// 判断になった。個別の学校・コースについて確認したい情報が増えた場合は、今回のnote欄
// 拡充と同じやり方で、事前のWeb調査結果をmanabiTayoukaGakko.tsに追記していく）。

// 「世田谷区立北沢学園中学校」のような正式名称の先頭にある設置自治体名＋「立」を取り除いた
// 「核」となる名称（例：「北沢学園中学校」）。実際の相談文では、保護者が自治体名を省いて
// 学校名だけで書くことが多いため（北沢学園中学校の例で実際に発生、2026-10-18）、正式名称
// そのままの部分一致だけでは検出できないケースがあった。
const MUNICIPAL_PREFIX_RE = /^.+?(?:都|道|府|県|市|区|町|村)立/;

function coreName(name: string): string | null {
  const m = name.match(MUNICIPAL_PREFIX_RE);
  if (!m) return null;
  const rest = name.slice(m[0].length);
  // 自治体名を除いた残りが短すぎる（誤マッチしやすい）場合は使わない。
  return rest.length > 3 ? rest : null;
}

export function findMentionedSchool(texts: (string | null | undefined)[]): ManabiTayoukaGakko | null {
  const haystack = texts.filter(Boolean).join('\n');
  if (!haystack) return null;

  let best: ManabiTayoukaGakko | null = null;
  let bestMatchLen = -1;
  for (const school of MANABI_TAYOUKA_GAKKO) {
    // 正式名称（name）・branchName（分校・分教室等の愛称）・それぞれの「核」名称
    // （自治体名を除いたもの）のいずれかが部分一致すればよい。短すぎる名称での誤マッチを
    // 避けるため、3文字以下の名称は判定対象から外す。
    const candidates = new Set<string>();
    for (const n of [school.name, school.branchName]) {
      if (!n || n.length <= 3) continue;
      candidates.add(n);
      const core = coreName(n);
      if (core) candidates.add(core);
    }
    const matched = [...candidates].filter((c) => haystack.includes(c));
    if (matched.length === 0) continue;
    // 複数の学校名がたまたま同時に一致した場合は、より長い（＝より具体的な）名称が
    // 一致した方を優先する。
    const matchLen = Math.max(...matched.map((c) => c.length));
    if (matchLen > bestMatchLen) {
      best = school;
      bestMatchLen = matchLen;
    }
  }
  return best;
}

// AIに渡す「確認済みの学校情報」ブロック。ここに書かれていない項目は「知らない」ことを
// AI自身に明示させ、断定・推測をさせないことが目的（note等が無い学校では、この一言だけが
// 付く形になる）。
export function buildSchoolFactsBlock(school: ManabiTayoukaGakko): string {
  const facts: string[] = [
    `学校名：${school.name}${school.branchName ? `（${school.branchName}）` : ''}`,
    `所在地：${school.prefecture}${school.city}`,
    `学校種：${school.schoolType}`,
    `設置形態（本校型／分校型／分教室型／コース指定型）：${school.type}`,
    `公立／私立：${school.publicPrivate}`,
    `指定年度：${school.designatedYear}`,
  ];
  if (school.address) facts.push(`住所：${school.address}`);
  if (school.note) facts.push(`その他の確認済み情報：${school.note}`);

  return `
相談文に、当サイトが情報を持っている学校「${school.name}」が含まれているようです。
以下は、この学校について確認できている情報です。この学校の事実（開校年・定員・コース内容・
男女共学かどうか等）に触れて答える場合は、必ずこの範囲内の情報だけを使ってください。
ここに書かれていない項目を聞かれた場合は、絶対に推測・断定で答えず、「その点はここでは
確認できていない」と正直に伝えたうえで、学校公式サイトや設置している教育委員会への確認を
案内してください。
【確認済みの学校情報】
${facts.map((f) => '- ' + f).join('\n')}`;
}
