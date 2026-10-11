import { CATS } from './categories';

type GuideCategory = { dos?: string[]; donts?: string[]; samplePhrases?: string[] };

export type PastConsultation = {
  category: string;
  question: string;
  created_at: string;
};

// 過去の相談履歴をプロンプトに含める件数の上限（トークン量が増えすぎないようにするため）。
const MAX_HISTORY_ITEMS = 5;
// 履歴の各質問文を、この文字数までに切り詰める（1件あたりの肥大化を防ぐ）。
const HISTORY_QUESTION_MAX_CHARS = 150;

function buildHistoryBlock(history?: PastConsultation[]): string {
  if (!history || history.length === 0) return '';
  const recent = history.slice(0, MAX_HISTORY_ITEMS);
  const lines = recent.map((h) => {
    const label = CATS[h.category]?.label || h.category;
    const date = h.created_at ? h.created_at.slice(0, 10) : '';
    const q =
      h.question.length > HISTORY_QUESTION_MAX_CHARS
        ? h.question.slice(0, HISTORY_QUESTION_MAX_CHARS) + '…'
        : h.question;
    return `- （${date}・${label}）${q}`;
  });
  return `
この方は会員登録済みで、過去にも相談しています。以下はこの方の直近の相談内容です。
今回の相談と関連がありそうな場合は、話の流れを踏まえた回答にしてください。関連がなければ無視して構いません。
【過去の相談】
${lines.join('\n')}`;
}

export function buildPrompt(
  category: string,
  text: string,
  guideCat: GuideCategory | undefined,
  grade?: string | null,
  gender?: string | null,
  supervised?: boolean,
  history?: PastConsultation[]
) {
  const catLabel = CATS[category]?.label || category;

  let guidanceBlock: string;
  if (guideCat && (guideCat.dos || []).length) {
    const sourceNote = supervised
      ? '以下は公認心理師が監修した、このテーマに関する対応方針です。この方針に沿って回答してください。'
      : '以下は、このテーマについて一般的に知られている対応の目安です（まだ公認心理師による正式な監修を受けていない下書きです）。参考にしつつ、断定的な言い切りは避けてください。';
    guidanceBlock = `
${sourceNote}
【推奨する対応】
${(guideCat.dos || []).map((d) => '- ' + d).join('\n')}
【避けるべき対応】
${(guideCat.donts || []).map((d) => '- ' + d).join('\n')}
【言葉かけの例】
${(guideCat.samplePhrases || []).map((p) => '- ' + p).join('\n')}`;
  } else {
    guidanceBlock = `
（このテーマについては、まだ専門家監修の対応方針が登録されていません。一般的な注意点に基づいて、断定を避けた提案にとどめてください。）`;
  }

  const historyBlock = buildHistoryBlock(history);

  return `あなたは「どうする先生」という、不登校の子を持つ保護者向けAI相談キャラクターです。
以下の相談に対して、今日からできる具体的な次の一手を、200〜300文字程度の日本語で答えてください。
${guidanceBlock}
${historyBlock}

共通ルール：
- 「専門家に相談しましょう」のような一般論だけで終わらせず、まず家庭で今日からできる具体的な行動を1つ以上示す
- 断定的な医学的・心理学的診断はしない。あくまで可能性と次の行動の提案にとどめる
- もし相談内容に、子ども本人の希死念慮・自傷・自殺をうかがわせる記述が含まれる場合は、上記の対応方針よりもこちらを優先し、具体的な助言は行わず、「すぐに専門の窓口に相談してほしい」という趣旨のあたたかい言葉と、24時間子供SOSダイヤル（0120-0-78310）を案内する内容だけを返してください
- 回答本文のみを出力し、前置きや署名は不要

テーマ：${catLabel}
${grade ? 'お子さんの学年：' + grade + '\n' : ''}${gender && gender !== '回答しない' ? '性別：' + gender + '\n' : ''}相談内容：
${text}`;
}

// マイページに表示する「今のお子さんの状況」サマリー用。会員の過去の相談履歴を
// まとめて、現状の整理＋次の一手を短くJSON形式で生成させる。
// 件数・1件あたりの文字数の上限は buildHistoryBlock と同じ考え方（プロンプト肥大化防止）。
const MAX_SUMMARY_ITEMS = 10;
const SUMMARY_QA_MAX_CHARS = 200;

export type SummaryConsultation = PastConsultation & { answer?: string };

export function buildSummaryPrompt(history: SummaryConsultation[]): string {
  const recent = history.slice(0, MAX_SUMMARY_ITEMS);
  const lines = recent.map((h) => {
    const label = CATS[h.category]?.label || h.category;
    const date = h.created_at ? h.created_at.slice(0, 10) : '';
    const trim = (s: string) =>
      s.length > SUMMARY_QA_MAX_CHARS ? s.slice(0, SUMMARY_QA_MAX_CHARS) + '…' : s;
    return `- （${date}・${label}）相談：${trim(h.question)}${h.answer ? `／回答：${trim(h.answer)}` : ''}`;
  });

  return `あなたは「どうする先生」という、不登校の子を持つ保護者向けAI相談キャラクターです。
以下は、ある会員の方がこれまでに行った相談（質問と、どうする先生の回答）の履歴です。
これ全体を踏まえて、今のお子さんの状況の整理（status_summary）と、保護者への次の一手のアドバイス（advice）を
それぞれ100〜150文字程度の日本語で考えてください。

【相談履歴（新しい順）】
${lines.join('\n')}

共通ルール：
- 断定的な医学的・心理学的診断はしない。あくまで「〜の可能性がある」「〜という傾向がうかがえる」程度の、可能性レベルの整理にとどめる
- 複数の相談から共通して見えてくる傾向や変化があれば、それを中心に整理する（単発の内容の繰り返しにしない）
- もし履歴の中に、子ども本人の希死念慮・自傷・自殺をうかがわせる記述が含まれる場合は、status_summary・adviceのいずれでも具体的な助言は行わず、「すぐに専門の窓口に相談してほしい」という趣旨のあたたかい言葉と、24時間子供SOSダイヤル（0120-0-78310）を案内する内容だけを返してください
- 出力は、前置きや説明を含めず、次のJSON形式のみにしてください（コードブロックや他の文章は不要）：
{"status_summary": "…", "advice": "…"}`;
}
