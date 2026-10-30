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
// 注意：指定年度・公立私立・設置形態などの事実項目は、manabiTayoukaGakko.ts側で既に
// Web調査済み・確認済みの項目のみを使わせ、断定での上書きを禁止する（2026-10-18導入時の
// 方針）。
//
// 一方、「どんなタイプの子に合うか」「雰囲気はどうか」のような、学校ごとの特色に関する
// 質問は、note欄の充実度に学校ごとの差があり（例：運営法人名や移転予定だけで、教育方針や
// 校風の記述が無い学校もある）、noteが薄い学校では「ここでは確認できていません。学校に
// 直接お問い合わせください」という中身のない回答になってしまっていた（2026-10-26、
// 「東京シューレ葛飾中学校」について相談した際の回答が「またつまらない」との指摘を
// 受けて発覚）。この時点では、buildSchoolFactsBlockにweb検索ツールを使って特色を調べる
// よう指示する方針で対応した。
//
// 【2026-10-28追記】その後、aiAnswer.ts側のweb_searchツール自体をコスト対策で撤去した
// （検索結果が入力トークンとして課金され、1件あたりのAPIコストが大きく増加したため）。
// そのため、このファイルの指示文がweb検索の利用を前提にしていると、AIには使えないツールを
// 使うよう指示するだけの死んだ指示になってしまう。この問題への本来の対応として、
// manabiTayoukaGakko.tsのnote欄を84校中44校について公式サイト・教育委員会資料等の
// 一次情報で拡充した（2026-10-28）。これにより、以下の指示は「web検索で調べる」ではなく
// 「note欄の確認済み情報の範囲内で、関連しそうな情報を積極的に使って具体的に答える」方針に
// 書き換えている。noteがまだ薄い学校（約40校）については、無理に特色を創作せず、一般的な
// 比較観点の提示＋学校への確認案内にとどめる（事実の範囲内で答える、という当サイト全体の
// 方針を優先する）。

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

// 確認済みの学校情報を箇条書きの行にしたもの。buildSchoolFactsBlock（相談プロンプト用）と
// lib/schoolFit.tsの学校相性メモプロンプトの両方から使う共通部分（2026-10-22、相性メモ
// 機能の追加に合わせて切り出し）。
export function buildSchoolFactsLines(school: ManabiTayoukaGakko): string[] {
  const facts: string[] = [
    `学校名：${school.name}${school.branchName ? `（${school.branchName}）` : ''}`,
    `所在地：${school.prefecture}${school.city}`,
    `学校種：${school.schoolType}`,
    `設置形態（本校型／分校型／分教室型／コース指定型）：${school.type}`,
    `公立／私立：${school.publicPrivate}`,
    `指定年度：${school.designatedYear}`,
  ];
  if (school.address) facts.push(`住所：${school.address}`);
  if (school.officialUrl) facts.push(`公式サイト：${school.officialUrl}`);
  if (school.note) facts.push(`その他の確認済み情報：${school.note}`);
  if (school.admission) facts.push(`入学・入試について確認できている情報（出典：${school.admission.sourceUrl}）：${school.admission.text}（これ以外の入試情報——倍率・合格基準など——は確認できていないため、断定しないこと）`);
  return facts;
}

// AIに渡す「確認済みの学校情報」ブロック。ここに書かれていない項目は「知らない」ことを
// AI自身に明示させ、断定・推測をさせないことが目的（note等が無い学校では、この一言だけが
// 付く形になる）。
export function buildSchoolFactsBlock(school: ManabiTayoukaGakko): string {
  const facts = buildSchoolFactsLines(school);

  return `
相談文に、当サイトが情報を持っている学校「${school.name}」が含まれているようです。
以下は、この学校について確認できている情報（当サイト側で事前に調査・確認済みのもの）です。
- この学校について答える際は、質問にどんぴしゃで一致していなくても、関連しそうな確認済み情報は
  積極的に回答に取り入れてください（例：入試のことを聞かれた場合でも、「文部科学大臣指定の
  学びの多様化学校（不登校の生徒への配慮が制度的に認められた学校）である」ことは、入試の
  可否そのものではなくても、保護者が知りたい文脈として伝える価値があります）。
- 下の【確認済みの学校情報】に書かれている事実は、必ずこの範囲内の情報だけを使い、推測や
  断定で情報を足さないこと（例：指定年度・公立私立・設置形態など、当サイトが調査済みとして
  渡している項目について、確認済みの内容と異なることを述べたり、確認できていない数値・制度を
  断定的に答えたりしないこと）。
- 「どんなタイプの子に合うか」「雰囲気はどうか」「教育方針は」のような、学校ごとの特色に
  関する質問については、下の【確認済みの学校情報】（特に「その他の確認済み情報」欄）の中に
  関連しそうな記述があれば、それを相談文に書かれているお子さんの特徴と照らし合わせて、でき
  るだけこの学校固有の内容で具体的に答えること（例：「少人数指導である」という情報があれば
  「少人数なので、集団が苦手なお子さんにも合いやすいと考えられます」のように結びつける）。
  確認済みの情報の範囲を超える事実を断定しないこと（web検索は使えないため、確認済みデータに
  無いことは「無い」と扱うこと）。
  (1) 「その他の確認済み情報」に特色に関する記述がある場合は、それを踏まえて具体的に答える
      こと。「公式サイトを見てみましょう」のような、どの学校にも当てはまる一般論だけで
      終わらせないこと。
  (2) 「その他の確認済み情報」が無い、またはあっても特色に関する記述が無い場合に限り、
      学びの多様化学校（不登校特例校）を比較・見学する際に一般的に確認すると良い着眼点
      （例：少人数かどうか、出欠の扱い方、本人のペースに合わせてもらえるか）を1つ具体的に
      挙げ、見学・問い合わせの際にそれを確認するとよい、という形で答え、学校公式サイトや
      設置している教育委員会への確認も案内すること。この場合、確認できていない特色を
      推測で答えないこと。
  「ここでは確認できていません。学校に直接お問い合わせください」だけで終わる、中身のない
  回答にはしないこと。
【確認済みの学校情報】
${facts.map((f) => '- ' + f).join('\n')}`;
}
