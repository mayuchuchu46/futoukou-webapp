import { CATS } from './categories';

// 相談文からテーマ（カテゴリ）を自動判定するためのプロンプト。選択の手間を省くため、
// 質問する画面でテキスト入力に合わせてこれを呼び出し、テーマ欄を自動で埋める
// （2026-10-13追加）。ガイドラインのdos/dontsの選択に関わるため、キー名のみを
// 1つだけ出力させ、余計な説明を混ぜさせないようにする。
export function buildCategoryClassificationPrompt(text: string): string {
  const list = Object.keys(CATS)
    .map((key) => `${key}: ${CATS[key].label}`)
    .join('\n');
  return `以下は、不登校の子を持つ保護者からの相談文です。内容から、最も当てはまるテーマを1つだけ選び、キー名だけを出力してください（説明・記号・改行は一切不要。キー名のみ）。

【テーマ一覧】
${list}

【相談文】
${text.slice(0, 1000)}`;
}

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

function buildGuidanceBlock(guideCat: GuideCategory | undefined, supervised?: boolean): string {
  if (guideCat && (guideCat.dos || []).length) {
    const sourceNote = supervised
      ? '以下は公認心理師が監修した、このテーマに関する対応方針です。この方針に沿って回答してください。'
      : '以下は、このテーマについて一般的に知られている対応の目安です（まだ公認心理師による正式な監修を受けていない下書きです）。参考にしつつ、断定的な言い切りは避けてください。';
    return `
${sourceNote}
【推奨する対応】
${(guideCat.dos || []).map((d) => '- ' + d).join('\n')}
【避けるべき対応】
${(guideCat.donts || []).map((d) => '- ' + d).join('\n')}
【言葉かけの例】
${(guideCat.samplePhrases || []).map((p) => '- ' + p).join('\n')}`;
  }
  return `
（このテーマについては、まだ専門家監修の対応方針が登録されていません。一般的な注意点に基づいて、断定を避けた提案にとどめてください。）`;
}

// 共通ルール（buildPrompt・buildFollowupPromptの両方で使う。回答の長さ・言い切りを避ける
// 言い方・希死念慮時の安全上書き等、1回目の相談とその場での返信（ラリー）で揃えたいルール）。
const COMMON_ANSWER_RULES = `共通ルール：
- 相談文は保護者自身が一人称で書いている。「〜したくない」「〜がつらい」のように主語が明示されていない記述は、基本的に書き手（保護者自身）の気持ちや行動を指す。お子さん本人のことだと決めつけて書き手の話をすり替えないこと。特に「親」という言葉が出てきた場合は、書き手自身の親（お子さんから見た祖父母）を指している可能性もあるため、「親」＝書き手自身のことだと早合点せず、相談文全体の文脈（誰が誰に対して何をした／したくないのか）から主語・目的語を正しく読み取ってから回答すること
- 「専門家に相談しましょう」のような一般論だけで終わらせず、まず家庭で今日からできる具体的な行動を1つ示す
- 断定的な医学的・心理学的診断はしない。あくまで可能性と次の行動の提案にとどめる
- 「〜しましょう」「〜してください」のような、その通りに動くことを前提とした言い切り・命令形は避ける。「〜という方法もあります」「〜してみるのも一つです」のように、あくまで選択肢の一つとして提案する言い方にし、実際にやるかどうか・どう動くかの最終判断は保護者自身に委ねる姿勢を文面ににじませること（提案通りに動いて状況が悪化するケースもあり得るため、言い切りで指示する表現は避ける）
- もし相談内容に、子ども本人の希死念慮・自傷・自殺をうかがわせる記述が含まれる場合は、上記の対応方針よりもこちらを優先し、具体的な助言は行わず、「すぐに専門の窓口に相談してほしい」という趣旨のあたたかい言葉と、24時間子供SOSダイヤル（0120-0-78310）を案内する内容だけを返してください
- 回答本文のみを出力し、前置きや署名は不要
- 専門家への有料相談（300文字以上を想定）より短く、要点だけに絞る。一つながりの文章にせず、状況の受け止め（一言）→今日からできる一手（一言）、の2つの短い段落に分け、段落の間は空行（改行2つ）を入れること。ただし「①」「②」のような番号・記号を文章の先頭に付けない。見出しのような前置きも付けず、自然な文章の段落として書くこと`;

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
  const guidanceBlock = buildGuidanceBlock(guideCat, supervised);
  const historyBlock = buildHistoryBlock(history);

  return `あなたは「どうする先生」という、不登校の子を持つ保護者向けAI相談キャラクターです。
以下の相談に対して、今日からできる具体的な次の一手を、150文字程度の日本語で、要点を絞って答えてください。
${guidanceBlock}
${historyBlock}

${COMMON_ANSWER_RULES}

テーマ：${catLabel}
${grade ? 'お子さんの学年：' + grade + '\n' : ''}${gender && gender !== '回答しない' ? '性別：' + gender + '\n' : ''}相談内容：
${text}`;
}

// 相談詳細ページで、AIの回答に対してその場で返信（ラリー）したいときのプロンプト
// （2026-10-16追加。「AIの返事に対して違うことを言いたいから、もう一回相談ボタンを押して
// その返事を書こうとする人が多そう」との指摘を受けて、新規相談として書き直させるのではなく、
// 元の質問・回答を会話の続きとして明示的に渡す機能を追加）。
// buildPromptと共通ルールは揃えつつ、「これは新規の相談ではなく、直前のやりとりの続き」
// であることをAIに明示する点が異なる。
export function buildFollowupPrompt(
  category: string,
  originalQuestion: string,
  originalAnswer: string,
  followupText: string,
  guideCat: GuideCategory | undefined,
  grade?: string | null,
  gender?: string | null,
  supervised?: boolean
) {
  const catLabel = CATS[category]?.label || category;
  const guidanceBlock = buildGuidanceBlock(guideCat, supervised);

  return `あなたは「どうする先生」という、不登校の子を持つ保護者向けAI相談キャラクターです。
以下は、保護者とのやりとりの続きです。すでに一度相談があり、それに対してあなたが回答済みです。
今回のメッセージは、その回答を読んだ保護者からの返信（反応・追加の質問・言いたいこと）です。
最初の相談文だと思って最初から回答し直すのではなく、直前の自分の回答を踏まえたうえで、
今回の返信の内容にきちんと向き合って答えてください。150文字程度の日本語で、要点を絞って答えてください。
${guidanceBlock}

【最初の相談】
${originalQuestion}

【あなたの最初の回答】
${originalAnswer}

【保護者からの返信（今回、これに答える）】
${followupText}

${COMMON_ANSWER_RULES}

テーマ：${catLabel}
${grade ? 'お子さんの学年：' + grade + '\n' : ''}${gender && gender !== '回答しない' ? '性別：' + gender + '\n' : ''}`;
}

// マイページに表示する「今のお子さんの状況」サマリー用。会員の過去の相談履歴を
// まとめて、現状の整理＋次の一手を短くJSON形式で生成させる。
// 件数・1件あたりの文字数の上限は buildHistoryBlock と同じ考え方（プロンプト肥大化防止）。
const MAX_SUMMARY_ITEMS = 10;
const SUMMARY_QA_MAX_CHARS = 200;

export type SummaryConsultation = PastConsultation & { answer?: string };

// 「一度希死念慮系の相談をしたら、ずっと同じ内容（専門窓口案内だけ）が表示されて
// 更新されない」との指摘を受けて修正（2026-10-16）。
// 従来はAI自身に「履歴の中に希死念慮等の記述が含まれるか」を判定させていたため、
// 直近10件の中に古い（例えば数週間前の）該当相談が1件でも残っていれば、その後
// 何件新しい（無関係な）相談を重ねても毎回セーフティ上書きの文面だけが生成され
// 続けてしまっていた。これを、呼び出し側（getOrGenerateMemberSummary）が
// consultations.crisis_detected列を見て「直近の相談で安全上書きが実際に発動したか」を
// コードで判定し、その結果（forceCrisisOverride）をそのままプロンプトに渡す方式に変更。
// 古い相談が履歴に含まれていても、直近の相談が落ち着いていれば通常の内容に戻る。
export function buildSummaryPrompt(history: SummaryConsultation[], forceCrisisOverride: boolean): string {
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
これ全体を踏まえて、次の5つをそれぞれ日本語で考えてください。

- status_summary：今のお子さんの状況の整理（100〜150文字程度）
- advice：保護者への次の一手のアドバイス（100〜150文字程度）
- phrasing_suggestion：この子・この状況に合いそうな、保護者からの言葉かけの具体例（80〜120文字程度。実際にそのまま使えるセリフを1〜2個含めること）
- environment_suggestion：この子・この状況に合いそうな、家庭や学習の環境面での工夫（80〜120文字程度。部屋・時間の使い方・声かけのタイミングなど、今日から試せる具体的な工夫）
- school_fit_points：この子・この状況に合いそうな、学校・居場所（フリースクール等）を探すときの一般的な着眼点（80〜120文字程度。「少人数か」「出席のカウント方法」「本人のペースに合わせてもらえるか」など、見学・問い合わせ時に確認するとよい観点を挙げる）

【相談履歴（新しい順）】
${lines.join('\n')}

共通ルール：
- 断定的な医学的・心理学的診断はしない。あくまで「〜の可能性がある」「〜という傾向がうかがえる」程度の、可能性レベルの整理にとどめる
- adviceやphrasing_suggestion等の提案は、「〜しましょう」「〜してください」のような言い切り・命令形を避け、「〜という方法もあります」のように選択肢の一つとして提案する言い方にすること（最終判断は保護者自身に委ねる姿勢を文面ににじませる）
- 複数の相談から共通して見えてくる傾向や変化があれば、それを中心に整理する（単発の内容の繰り返しにしない）
- phrasing_suggestion・environment_suggestion・school_fit_pointsは、実在しない学校名・制度名・サービス名を一切挙げない（具体的な学校や制度の推薦ではなく、見学・比較のときに確認すると良い一般的な観点の提案にとどめる。これは実在の学校データを扱える段階になるまでの暫定版であるため厳守すること）
${
  forceCrisisOverride
    ? '- 直近の相談で、子ども本人の希死念慮・自傷・自殺をうかがわせる内容が検知されています。5項目のいずれでも具体的な助言は行わず、「すぐに専門の窓口に相談してほしい」という趣旨のあたたかい言葉と、24時間子供SOSダイヤル（0120-0-78310）を案内する内容だけを返してください'
    : '- 相談履歴の中に、子ども本人の希死念慮・自傷・自殺をうかがわせる古い記述が含まれていても、直近の相談がそれに該当しないのであれば、通常どおり5項目それぞれについて具体的な内容を書いてください（古い記述のみを理由に全項目を専門窓口の案内だけにしないこと）'
}
- 出力は、前置きや説明を含めず、次のJSON形式のみにしてください（コードブロックや他の文章は不要）：
{"status_summary": "…", "advice": "…", "phrasing_suggestion": "…", "environment_suggestion": "…", "school_fit_points": "…"}`;
}

// カテゴリ別「お悩み辞典」ページ（/dictionary/[category]）の冒頭解説文用（2026-10-15追加）。
// member向けのサマリーと違い、特定の1人の状況整理ではなく、そのカテゴリに実際に
// 寄せられた複数の相談から見える「よくある傾向」を一般化して説明する文章を作る。
const DICTIONARY_QA_MAX_CHARS = 150;
const MAX_DICTIONARY_ITEMS = 20;

export function buildCategoryDictionaryPrompt(categoryLabel: string, consultations: PastConsultation[]): string {
  const trim = (s: string) =>
    s.length > DICTIONARY_QA_MAX_CHARS ? s.slice(0, DICTIONARY_QA_MAX_CHARS) + '…' : s;
  const lines = consultations.slice(0, MAX_DICTIONARY_ITEMS).map((c) => `- ${trim(c.question)}`);

  return `あなたは「どうする先生」という、不登校の子を持つ保護者向けサービスの編集担当です。
以下は、保護者から実際に寄せられた「${categoryLabel}」というテーマの相談の一覧（質問文のみ、新しい順）です。

【実際の相談一覧】
${lines.join('\n')}

これらを読んで、このテーマ「${categoryLabel}」について、初めてこのページに来た保護者向けの解説文（overview）を日本語で合計250〜320文字程度で書いてください。

ルール：
- 個別の相談1件の要約ではなく、一覧全体から見える「よくあるパターン・傾向」を一般化して説明すること
- 実在の学校名・人名・制度名など、個人や特定の施設を特定できる情報は一切含めない
- 断定的な医学的・心理学的診断はしない（「〜ということがよくあります」「〜という場合もあります」程度の言い方にとどめる）
- 不安を煽る書き方にせず、「対応の選択肢はいろいろある」という前向きなトーンでまとめる
- 1段落の長文にせず、必ず「①よくある傾向の説明」「②対応の考え方・前向きなまとめ」の2つの段落に分け、段落の間は改行2つ（\n\n）で区切ること。1段落あたり3〜4文程度を目安にする
- 出力は、前置きや説明を含めず、次のJSON形式のみにしてください（コードブロックや他の文章は不要。overview内の改行は\n\nで表現すること）：
{"overview": "…"}`;
}
