import { FREE_SCHOOLS, FreeSchool } from './data/freeSchools';
import { CORRESPONDENCE_HIGH_SCHOOLS, CorrespondenceHighSchool } from './data/correspondenceHighSchools';
import { ONLINE_FREE_SCHOOLS, OnlineFreeSchool } from './data/onlineFreeSchools';
import { ALTERNATIVE_SCHOOLS, AlternativeSchool, METHOD_LABEL } from './data/alternativeSchools';

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
// 呼び出すようにした。
//
// 【2026-10-28再追記】上記の「フリースクールは対象外」という方針も撤回した。
// 「学びスペース あうるの森」「レアレア」にnote（運営方針・支援内容等）を追加した
// 直後、ユーザーから「レアレアの情報いれたのに、回答がかわらない」との指摘を受けて
// 確認したところ、通信制高校と同様、findMentionedFreeSchoolの結果をAIプロンプトに
// 渡す処理が無く、フリースクールのnoteは内部リンク表示にしか使われていなかった
// （通信制高校で起きたのと全く同じ抜け）。buildFreeSchoolFactsBlockを追加し、
// 各API routeから通信制高校と同じ要領で呼び出すようにした。

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

export function findMentionedOnlineFreeSchool(
  texts: (string | null | undefined)[]
): OnlineFreeSchool | null {
  return findByName(texts, ONLINE_FREE_SCHOOLS);
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
  if (school.admission) {
    facts.push(
      `入学・入試について確認できている情報（出典：${school.admission.sourceUrl}）：${school.admission.text}（これ以外の入試情報——倍率・合格基準など——は確認できていないため、断定しないこと）`
    );
  }
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

// AIに渡す「確認済みのフリースクール情報」ブロック。buildCorrespondenceSchoolFactsBlockと
// 同じ考え方（2026-10-28追加、上記コメント参照）。
export function buildFreeSchoolFactsLines(school: FreeSchool): string[] {
  const facts: string[] = [`施設名：${school.name}`, `所在地：${school.prefecture}${school.city}`];
  if (school.officialUrl) facts.push(`公式サイト：${school.officialUrl}`);
  if (school.ageRange && school.ageRange !== '記載なし') facts.push(`対象：${school.ageRange}`);
  if (school.note) facts.push(`その他の確認済み情報（運営団体・支援内容等）：${school.note}`);
  return facts;
}

export function buildFreeSchoolFactsBlock(school: FreeSchool): string {
  const facts = buildFreeSchoolFactsLines(school);

  return `
相談文に、当サイトが情報を持っているフリースクール「${school.name}」が含まれているようです。
以下は、この施設について確認できている情報（当サイト側で事前に調査・確認済みのもの）です。
- この施設について答える際は、質問にどんぴしゃで一致していなくても、関連しそうな確認済み情報は
  積極的に回答に取り入れてください。
- 下の【確認済みの施設情報】に書かれている事実は、必ずこの範囲内の情報だけを使い、推測や
  断定で情報を足さないこと。
- 「どんなタイプの子に合うか」「雰囲気はどうか」「どんな支援があるか」のような、施設ごとの特色に
  関する質問については、下の【確認済みの施設情報】（特に「その他の確認済み情報」欄）の中に
  関連しそうな記述があれば、それを相談文に書かれているお子さんの特徴と照らし合わせて、でき
  るだけこの施設固有の内容で具体的に答えること。確認済みの情報の範囲を超える事実を断定しない
  こと（web検索は使えないため、確認済みデータに無いことは「無い」と扱うこと）。
  (1) 「その他の確認済み情報」に特色に関する記述がある場合は、それを踏まえて具体的に答える
      こと。「公式サイトを見てみましょう」のような、どの施設にも当てはまる一般論だけで
      終わらせないこと。
  (2) 「その他の確認済み情報」が無い、またはあっても特色に関する記述が無い場合に限り、
      フリースクールを比較・見学する際に一般的に確認すると良い着眼点（例：開所日時、
      学習支援の有無、在籍校との連携実績）を1つ具体的に挙げ、見学・問い合わせの際に
      それを確認するとよい、という形で答え、施設への確認も案内すること。この場合、
      確認できていない特色を推測で答えないこと。
  「ここでは確認できていません。施設に直接お問い合わせください」だけで終わる、中身のない
  回答にはしないこと。
【確認済みの施設情報】
${facts.map((f) => '- ' + f).join('\n')}`;
}

// AIに渡す「確認済みのオンラインフリースクール情報」ブロック。
// buildFreeSchoolFactsBlock・buildCorrespondenceSchoolFactsBlockと同じ考え方（2026-10-29追加）。
export function buildOnlineFreeSchoolFactsLines(school: OnlineFreeSchool): string[] {
  const facts: string[] = [
    `施設名：${school.name}`,
    `運営：${school.operator}`,
    `対象：${school.ageRange}`,
    `連絡先：${school.contact}`,
  ];
  if (school.note) facts.push(`その他の確認済み情報（指導内容・料金・特徴等）：${school.note}`);
  return facts;
}

export function buildOnlineFreeSchoolFactsBlock(school: OnlineFreeSchool): string {
  const facts = buildOnlineFreeSchoolFactsLines(school);
  return `
相談文に、当サイトが情報を持っているオンラインフリースクール「${school.name}」が含まれているようです。
以下は、この施設について確認できている情報（当サイト側で事前に調査・確認済みのもの）です。
- この施設について答える際は、質問にどんぴしゃで一致していなくても、関連しそうな確認済み情報は
  積極的に回答に取り入れてください。
- 下の【確認済みの施設情報】に書かれている事実は、必ずこの範囲内の情報だけを使い、推測や
  断定で情報を足さないこと。
- 「どんなタイプの子に合うか」「料金はどのくらいか」「どんな支援があるか」のような、施設ごとの特色に
  関する質問については、下の【確認済みの施設情報】（特に「その他の確認済み情報」欄）の中に
  関連しそうな記述があれば、それを相談文に書かれているお子さんの特徴と照らし合わせて、でき
  るだけこの施設固有の内容で具体的に答えること。確認済みの情報の範囲を超える事実を断定しない
  こと（web検索は使えないため、確認済みデータに無いことは「無い」と扱うこと）。
  (1) 「その他の確認済み情報」に特色に関する記述がある場合は、それを踏まえて具体的に答える
      こと。「公式サイトを見てみましょう」のような、どの施設にも当てはまる一般論だけで
      終わらせないこと。
  (2) 「その他の確認済み情報」が無い、またはあっても特色に関する記述が無い場合に限り、
      オンラインフリースクールを検討する際に一般的に確認すると良い着眼点（例：無料体験の有無、
      講師変更の可否、授業時間の柔軟性）を1つ具体的に挙げ、問い合わせの際にそれを確認するとよい、
      という形で答え、施設への確認も案内すること。この場合、確認できていない特色を推測で答えないこと。
  「ここでは確認できていません。施設に直接お問い合わせください」だけで終わる、中身のない
  回答にはしないこと。
【確認済みの施設情報】
${facts.map((f) => '- ' + f).join('\n')}`;
}


// オルタナティブスクール（lib/data/alternativeSchools.ts）についても同様に、相談文に学校名が
// 出てきたら確認済みの情報をAIに渡す（2026-10-30追加。「自由の森学園中学校・高等学校が
// うちの子に合うか知りたい」という相談で、このデータが検出されず「確認済み情報を持っておらず」
// と答えてしまったため）。
export function findMentionedAlternativeSchool(
  texts: (string | null | undefined)[]
): AlternativeSchool | null {
  return findByName(texts, ALTERNATIVE_SCHOOLS);
}

export function buildAlternativeSchoolFactsBlock(school: AlternativeSchool): string {
  const facts: string[] = [
    `学校名：${school.name}`,
    `所在地：${school.prefecture}${school.city}`,
    `対象：${school.schoolType}`,
    `教育の特色の分類：${METHOD_LABEL[school.method]}`,
    `一条校（学校教育法上の学校）か：${school.isAccredited ? 'はい' : 'いいえ（認可外の施設）'}`,
  ];
  if (school.officialUrl) facts.push(`公式サイト：${school.officialUrl}`);
  if (school.note) facts.push(`その他の確認済み情報：${school.note}`);
  if (school.specialties && school.specialties.length > 0) {
    facts.push(`公式サイトで確認できた専門コース・活動：${school.specialties.map((x) => x.course).join('、')}`);
  }
  if (school.admission) {
    facts.push(
      `入学・入試について確認できている情報（出典：${school.admission.sourceUrl}）：${school.admission.text}（これ以外の入試情報——倍率・合格基準など——は確認できていないため、断定しないこと）`
    );
  }
  return `
相談文に、当サイトが情報を持っているオルタナティブスクール「${school.name}」が含まれているようです。
以下は、この学校について確認できている情報（当サイト側で事前に調査・確認済みのもの）です。
- 下の【確認済みの学校情報】に書かれている事実だけを使い、推測や断定で情報を足さないこと。
- 入試・入学について聞かれた場合：「入学・入試について確認できている情報」があればそれを具体的に
  伝え、無い場合や、聞かれた内容（倍率・合格基準・学力の目安など）がそこに無い場合は、「当サイトでは
  確認できていない」と正直に述べ、学校の公式サイトや説明会での確認方法を具体的に案内すること。
- 「合うかどうか」の質問には、確認済み情報（教育の特色・コース）と相談文のお子さんの様子を結びつけて
  答え、確認できていない特色を推測で答えないこと。
【確認済みの学校情報】
${facts.map((f) => '- ' + f).join('\n')}`;
}

export function buildAlternativeFactsBlockFor(texts: (string | null | undefined)[]): string | undefined {
  const school = findMentionedAlternativeSchool(texts);
  return school ? buildAlternativeSchoolFactsBlock(school) : undefined;
}
