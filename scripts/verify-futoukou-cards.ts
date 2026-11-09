// 「データで見る不登校」(/data/futoukou) のカードに表示される文字列を、実際に
// 計算・生成した上でそのまま出力するスクリプト（2026-11-10追加）。
//
// きっかけ：予算試算カード（yosan）で、割合を100倍し忘れて「約0.039%」と表示される
// バグが本番公開後に見つかった。原因は、型チェック（tsc --noEmit）だけでは「計算式の
// 単位・桁が合っているか」までは検証できないこと。数値ミスはサイトの信頼に関わる、
// という方針を受けて、型チェックとは別に「実際に表示される文字列を必ず目で読んで
// 確認する」工程を仕組み化した。
//
// 使い方：`npm run verify:futoukou` でこのスクリプトを実行し、出力された
// headlineValue／headlineLabel／description／tweetText を1行ずつ、元データ
// （文部科学省の資料など）と突き合わせて確認する。新しいカードを追加・pushする前に
// 必ず実行すること（毎日の自動追加タスクでも同様）。
import { FUTOUKOU_DATA_CARDS } from '../lib/data/futoukouDataCards';

for (const c of FUTOUKOU_DATA_CARDS) {
  console.log('='.repeat(60));
  console.log('slug:', c.slug);
  console.log('addedAt:', c.addedAt);
  console.log('headlineValue:', c.headlineValue);
  console.log('headlineLabel:', c.headlineLabel);
  console.log('description:', c.description);
  console.log('tweetText:', c.tweetText);
}
console.log('='.repeat(60));
console.log(`カード数: ${FUTOUKOU_DATA_CARDS.length}`);
console.log(
  '↑ 上記の数字・割合・単位（%、億円、人など）を、出典資料と1行ずつ突き合わせて確認してください。'
);
