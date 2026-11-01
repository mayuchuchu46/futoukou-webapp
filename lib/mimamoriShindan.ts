// 拡散用の「見守り力タイプ診断」（2026-11-01追加）。
// 不登校の知識を正誤で問う「検定」形式ではなく、保護者の対応スタイルを4タイプに
// 分類するタイプ診断にした。知識テストは不正解への抵抗感からシェアされにくいのに
// 対し、タイプ診断は「どのタイプでも前向きな結果」にできるためシェア率が高くなり
// やすい（BuzzFeed系診断コンテンツの定石）。AI呼び出しは使わず、全問固定・
// クライアント側だけで判定する静的な仕組みなので運用コストはゼロ。
//
// 2軸・4タイプのシンプルな組み合わせ。
// 軸A：気持ち重視（feeling） ←→ 行動重視（action）
// 軸B：そっと見守る（watch） ←→ しっかり関わる（close）
import type { Category } from './categories';

export type AxisAValue = 'feeling' | 'action';
export type AxisBValue = 'watch' | 'close';
export type MimamoriType = 'port' | 'warm' | 'coach' | 'strategist';

export type MimamoriChoice = {
  // 選んだ時にどちらの軸に何の値が入るかを直接持たせる（A/Bの意味を質問ごとに
  // 読み替える必要がないようにするため）。
  label: string;
  axis: 'a' | 'b';
  value: AxisAValue | AxisBValue;
};

export type MimamoriQuestion = {
  id: string;
  text: string;
  choices: [MimamoriChoice, MimamoriChoice];
};

export const MIMAMORI_QUESTIONS: MimamoriQuestion[] = [
  {
    id: 'q1',
    text: '子どもが「今日は休む」と言った朝、最初に出る言葉は？',
    choices: [
      { label: 'そうなんだね、わかった', axis: 'b', value: 'watch' },
      { label: '何かあった？理由を聞かせて', axis: 'b', value: 'close' },
    ],
  },
  {
    id: 'q2',
    text: '子どもがゲームばかりしている時間が増えたら？',
    choices: [
      { label: '今はそれが必要な時期なのかも、と見守る', axis: 'b', value: 'watch' },
      { label: '少しルールを一緒に決めようか、と声をかける', axis: 'b', value: 'close' },
    ],
  },
  {
    id: 'q3',
    text: '学校から連絡が来た時、まず考えるのは？',
    choices: [
      { label: '子どもの気持ちを確認してから返事しよう', axis: 'a', value: 'feeling' },
      { label: '学校に今の状況を正確に伝えよう', axis: 'a', value: 'action' },
    ],
  },
  {
    id: 'q4',
    text: '不登校について調べる時、よく見るのは？',
    choices: [
      { label: '当事者や保護者の体験談・気持ちの記録', axis: 'a', value: 'feeling' },
      { label: '制度・進路・学校の仕組みに関する情報', axis: 'a', value: 'action' },
    ],
  },
  {
    id: 'q5',
    text: '子どもが自分の部屋にいる時間が長い。あなたは？',
    choices: [
      { label: '声をかけずに、そっとしておく', axis: 'b', value: 'watch' },
      { label: 'お茶やおやつを理由に、様子を見に行く', axis: 'b', value: 'close' },
    ],
  },
  {
    id: 'q6',
    text: '週末、子どもとの時間の過ごし方は？',
    choices: [
      { label: '子どもが望む距離感に合わせる（誘わない日もある）', axis: 'b', value: 'watch' },
      { label: 'できるだけ一緒に過ごす時間を作る', axis: 'b', value: 'close' },
    ],
  },
  {
    id: 'q7',
    text: 'パートナーや家族が対応について口を出してきたら？',
    choices: [
      { label: '今はこのままでいいと思う、と自分の判断を大事にする', axis: 'a', value: 'feeling' },
      { label: '情報を整理して一緒に考えよう、と共有する', axis: 'a', value: 'action' },
    ],
  },
  {
    id: 'q8',
    text: '最近の自分を一言で言うと？',
    choices: [
      { label: '静かに寄り添っている', axis: 'a', value: 'feeling' },
      { label: 'できることを探して動いている', axis: 'a', value: 'action' },
    ],
  },
];

export type MimamoriResult = {
  type: MimamoriType;
  name: string;
  catch: string;
  desc: string;
  caution: string;
  categorySlug: Category;
  categoryLabel: string;
  // 結果ページ・シェア画像（OGP）に使う、タイプ専用の完成済みビジュアル
  // （2026-11-01追加。ChatGPTで作成した画像を本番用に1200x675へリサイズして配置）。
  image: string;
};

export const MIMAMORI_RESULTS: Record<MimamoriType, MimamoriResult> = {
  port: {
    type: 'port',
    name: '静かな港タイプ',
    catch: '何も言わずそばにいる、それだけで子どもの安心になっている人',
    desc: '子どもが安心して戻ってこられる「港」のような存在。言葉で励ますより、そこにいることで子どもを支えるタイプです。焦らず待つ姿勢は、子どもの自己回復力を信じている証でもあります。',
    caution: '見守りすぎて、自分自身の不安や疲れを後回しにしないように。',
    categorySlug: 'approach',
    categoryLabel: '関わり方',
    image: '/assets/shindan/mimamori-port.jpg',
  },
  warm: {
    type: 'warm',
    name: 'あたため隊長タイプ',
    catch: 'そばにいて、気持ちをたくさん受け止める人',
    desc: '子どもの気持ちの変化に誰よりも気づき、こまめに声をかけて関係を温め続けるタイプ。子どもにとって「いつでも話していい」と思える存在になっています。',
    caution: '関わる量が多い分、子どもが一人で考える時間も大切にしてみて。',
    categorySlug: 'home',
    categoryLabel: '家庭・自分のこと',
    image: '/assets/shindan/mimamori-warm.jpg',
  },
  coach: {
    type: 'coach',
    name: '伴走コーチタイプ',
    catch: '余計な口は出さず、必要な時にだけ次の一手を差し出す人',
    desc: '普段は子どものペースを尊重しつつ、進路や制度など「知っておくべきこと」はしっかり調べて備えているタイプ。目立たないけれど、いざという時に頼りになる存在です。',
    caution: '備えが整うほど「早く動きたい」気持ちが出やすいので、子どものペースとのズレに注意。',
    categorySlug: 'course',
    categoryLabel: '進路・学校選び',
    image: '/assets/shindan/mimamori-coach.jpg',
  },
  strategist: {
    type: 'strategist',
    name: '作戦参謀タイプ',
    catch: '情報を集め、動き、関わり続ける人',
    desc: '学校・制度・体調面など、あらゆる情報を集めながら積極的に動くタイプ。家族の中でも対応の中心を担っていることが多く、行動力が子どもの選択肢を広げています。',
    caution: '動き続ける分、立ち止まって子どもの「今の気持ち」を確認する時間も意識して。',
    categorySlug: 'school',
    categoryLabel: '学校との関係',
    image: '/assets/shindan/mimamori-strategist.jpg',
  },
};

// 各質問の選択結果（軸ごとの値の配列）から4タイプのどれかを判定する。
// 軸ごとに関係する設問は4問ずつなので、カウントが2-2のタイだった場合は
// feeling/watch側を既定値にする（どちらにも倒せる以上、タイの扱いが結果に
// 与える影響は小さいため、実装をシンプルにする目的で固定の既定値にした）。
export function resolveMimamoriType(answers: Array<AxisAValue | AxisBValue>): MimamoriType {
  let actionCount = 0;
  let actionTotal = 0;
  let closeCount = 0;
  let closeTotal = 0;

  MIMAMORI_QUESTIONS.forEach((q, i) => {
    const picked = answers[i];
    if (picked === undefined) return;
    const axis = q.choices[0].axis;
    if (axis === 'a') {
      actionTotal += 1;
      if (picked === 'action') actionCount += 1;
    } else {
      closeTotal += 1;
      if (picked === 'close') closeCount += 1;
    }
  });

  const axisA: AxisAValue = actionCount * 2 > actionTotal ? 'action' : 'feeling';
  const axisB: AxisBValue = closeCount * 2 > closeTotal ? 'close' : 'watch';

  if (axisA === 'feeling' && axisB === 'watch') return 'port';
  if (axisA === 'feeling' && axisB === 'close') return 'warm';
  if (axisA === 'action' && axisB === 'watch') return 'coach';
  return 'strategist';
}
