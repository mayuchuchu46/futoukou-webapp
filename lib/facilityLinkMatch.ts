import { FREE_SCHOOLS, FreeSchool } from './data/freeSchools';
import { CORRESPONDENCE_HIGH_SCHOOLS, CorrespondenceHighSchool } from './data/correspondenceHighSchools';

// 相談文（質問・AI回答）に、フリースクール一覧（freeSchools.ts）・通信制高校一覧
// （correspondenceHighSchools.ts）に載っている施設名が含まれている場合、その施設の
// 詳細ページへの内部リンクを出すための仕組み（2026-10-21追加）。
//
// lib/schoolFacts.ts（学びの多様化学校のfindMentionedSchool）と同じ「回答で話題に
// なった固有の学校・施設を当サイトのデータから特定し、詳細ページへ案内する」という
// 考え方を、フリースクール・通信制高校にも広げたもの（きっかけ：
// 「学校法人角川ドワンゴ学園N中等部秋葉原キャンパスについて」という相談で、同校が
// freeSchools.tsのデータにしか無く、学びの多様化学校向けのfindMentionedSchoolでは
// 検出できず、/gakko/free/149へのリンクが出ていなかった）。
//
// 【2026-10-28追記】上記の「AIへの事実注入はしない」という方針は、通信制高校に関しては
// 撤回した。通信制高校データ（correspondenceHighSchools.ts）にnote欄（不登校生徒への
// 対応・支援内容）を追加したにもかかわらず、findMentionedCorrespondenceSchoolの結果を
// AIプロンプトに渡していなかったため、noteにせっかく確認済み情報がある学校について
// 相談しても「当サイトでは確認できる情報を持っていません」という的外れな回答になって
// しまっていた（例：クラーク記念国際高等学校。CLARK SMARTコース等のnoteが既にあるのに
// 回答に一切反映されなかった、という指摘を受けて発覚）。lib/schoolFacts.tsと同じ考え方で
// buildCorrespondenceSchoolFactsBlockを追加し、各API route（app/api/consult等）から
// 呼び出すようにした。フリースクール（findMentionedFreeSchool）は現時点でnote欄の
// 「不登校生徒への対応」的な情報を積極整備する方針転換の対象外のため、ひとまず
// 内部リンク表示のみの従来方針のままにしている。

function findByName<T extends { name: string }>(
  texts: (string | null | undefined)[],
  items: readonly T[]
): T | null {
  const haystack = texts.filter(Boolean).join('\n');
  if (!haystack) return null;

  let best: T | null = null;
  let bestLen = -1;
  for (const item of items) {
    // 短すぎる名称は誤マッチしやすいため対象外（lib/schoolFacts.tsのcoreName判定と
    // 同じ閾値）。
    if (!item.name || item.name.length <= 3) continue;
    if (!haystack.includes(item.name)) continue;
    // 同時に複数件一致した場合は、より長い（＝より具体的な）名称が一致した方を優先する。
    if (item.name.length > bestLen) {
      best = item;
      bestLen = item.name.length;
    }
  }
  return best;
}

export function findMentionedFreeSchool(texts: (string | null | undefined)[]): FreeSchool | null {
  return findByName(texts, FREE_SCHOOLS);
}

export function findMentionedCorrespondenceSchool(
  texts: (string | null | undefined)[]
): CorrespondenceHighSchool | null {
  return findByName(texts, CORRESPONDENCE_HIGH_SCHOOLS);
}

// AIに渡す「確認済みの通信制高校情報」ブロック。lib/schoolFacts.tsのbuildSchoolFactsBlock
// と同じ考え方・同じ注意書き構成（2026-10-28追加、上記コメント参照）。
export function buildCorrespondenceSchoolFactsLines(school: CorrespondenceHighSchool): string[] {
  const facts: string[] = [
    `学校名：${school.name}`,
    `本校所在地（所轄庁）：${school.prefecture}${school.municipality}`,
    `設置者：${school.operator}`,
  ];
  if (school.officialUrl) facts.push(`公式サイト：${school.officialUrl}`);
  if (school.campuses && school.campuses.length > 0) {
    facts.push(
      `本校以外のキャンパス・学習センター（確認できたもの）：${school.campuses
        .map((c) => `${c.prefecture}${c.municipality || ''}`)
        .join('、')}`
    );
  }
  if (school.note) facts.push(`その他の確認済み情報（不登校生徒への対応・支援内容等）：${school.note}`);
  return facts;
}

export function buildCorrespondenceSchoolFactsBlock(school: CorrespondenceHighSchool): string {
  const facts = buildCorrespondenceSchoolFactsLines(school);

  return `
相談文に、当サイトが情報を持っている通信制高校「${school.name}」が含まれているようです。
以下は、この学校について確認できている情報（当サイト側で事前に調査・確認済みのもの）です。
- この学校について答える際は、質問にどんぴしゃで一致していなくても、関連しそうな確認済み情報は
  積極的に回答に取り入れてください。
- 下の【確認済みの学校情報】に書かれている事実は、必ずこの範囲内の情報だけを使い、推測や
  断定で情報を足さないこと。
- 「どんなタイプの子に合うか」「雰囲気はどうか」「どんな支援があるか」のような、学校ごとの特色に
  関する質問については、下の【確認済みの学校情報】（特に「その他の確認済み情報」欄）の中に
  関連しそうな記述があれば、それを相談文に書かれているお子さんの特徴と照らし合わせて、でき
  るだけこの学校固有の内容で具体的に答えること。確認済みの情報の範囲を超える事実を断定しない
  こと（web検索は使えないため、確認済みデータに無いことは「無い」と扱うこと）。
  (1) 「その他の確認済み情報」に特色に関する記述がある場合は、それを踏まえて具体的に答える
      こと。「公式サイトを見てみましょう」のような、どの学校にも当てはまる一般論だけで
      終わらせないこと。
  (2) 「その他の確認済み情報」が無い、またはあっても特色に関する記述が無い場合に限り、
      通信制高校を比較・見学する際に一般的に確認すると良い着眼点（例：スクーリングの頻度、
      通学日数の柔軟性、サポート体制の有無）を1つ具体的に挙げ、見学・問い合わせの際に
      それを確認するとよい、という形で答え、学校公式サイトへの確認も案内すること。この場合、
      確認できていない特色を推測で答えないこと。
  「ここでは確認できていません。学校に直接お問い合わせください」だけで終わる、中身のない
  回答にはしないこと。
【確認済みの学校情報】
${facts.map((f) => '- ' + f).join('\n')}`;
}
