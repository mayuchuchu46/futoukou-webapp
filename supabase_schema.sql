-- どうする先生（不登校編） Supabase スキーマ
-- Supabaseのプロジェクト作成後、SQL Editorでこのファイルの内容を実行してください。
-- 既に作成済みのDBに対しては、下の create table 文は無視されます（if not exists のため）。
-- その場合は、新しく追加した列を反映するため、次の1行も実行してください（既にある場合はエラーなく無視されます）。
-- alter table consultations add column if not exists views int not null default 0;
-- 専門家の審査状況を pending/verified/needs_fix/rejected で区別できるようにする場合
-- （2026-10-13追加）、既存DBでは次を実行してください。
-- alter table experts add column if not exists review_status text not null default 'pending';
-- alter table experts add column if not exists review_note text;
-- update experts set review_status = 'verified' where verified = true and review_status = 'pending';
-- create table if not exists expert_memberships (
--   author_id text primary key,
--   expires_at timestamptz not null,
--   updated_at timestamptz not null default now()
-- );
-- 新テーマ「関わり方」(approach) を追加した場合、既存DBでは次の2つも実行してください。
-- alter table consultations drop constraint if exists consultations_category_check;
-- alter table consultations add constraint consultations_category_check check (category in ('body','social','will','approach','course','other'));
-- update guidelines set categories = jsonb_set(categories, '{approach}', '{"dos": [], "donts": [], "samplePhrases": []}'::jsonb) where not (categories ? 'approach');
-- （中身の下書きを入れる場合は、このファイル下部の update guidelines ... の "approach" ブロックをコピーして個別に実行してください）
-- 利用者アカウント（ログイン機能）を追加した場合、既存DBでは次を実行してください。
-- create table if not exists members (
--   id uuid primary key default gen_random_uuid(),
--   email text not null unique,
--   password_hash text not null,
--   name text,
--   created_at timestamptz not null default now()
-- );
-- 読み放題会員（月¥800のStripeサブスクリプション）を追加した場合、既存DBでは次を実行してください。
-- alter table members add column if not exists stripe_customer_id text;
-- alter table members add column if not exists stripe_subscription_id text;
-- alter table members add column if not exists subscription_status text not null default 'inactive';
-- alter table members add column if not exists subscription_current_period_end timestamptz;
-- create index if not exists members_stripe_subscription_id_idx on members (stripe_subscription_id);
-- 専門家登録時の登録証（本人確認書類）アップロードを追加した場合、既存DBでは次を実行してください。
-- alter table experts add column if not exists license_doc_path text;
-- 本人確認完了後に登録証を自動削除する仕組み（lib/expertLicenseDoc.ts）を追加した場合、
-- 既存DBでは次を実行してください。
-- alter table experts add column if not exists verified_at timestamptz;
-- ホーム画面サイドバーの広告・アフィリエイトバナー枠を追加した場合、既存DBでは次を実行してください。
-- create table if not exists sidebar_banners (
--   id text primary key default 'default',
--   enabled boolean not null default false,
--   image_url text not null default '',
--   link_url text not null default '',
--   alt_text text not null default '',
--   updated_at timestamptz not null default now()
-- );
-- insert into storage.buckets (id, name, public) values ('expert-documents', 'expert-documents', false) on conflict (id) do nothing;
-- （このバケットはアプリがservice_roleキー経由でのみ読み書きするため、storage.objectsへの
-- 　RLSポリシーは不要。一般ユーザー・他の専門家・匿名ユーザーからは直接アクセスできない）
-- 利用者への返金と同時に専門家への報酬を無効化する仕組み（payout_status: 'void'）を
-- 追加した場合、既存DBでは次を実行してください。
-- alter table consultations drop constraint if exists consultations_payout_status_check;
-- alter table consultations add constraint consultations_payout_status_check
--   check (payout_status in ('unpaid','paid','void'));
-- 専門家回答への利用者フィードバック（役に立ったか）を追加した場合、
-- 既存DBでは次を実行してください。
-- alter table consultations add column if not exists expert_answer_helpful boolean;
-- 専門家一覧から「この専門家に相談する」を選んで質問できる機能（特定の専門家を
-- 指名した有料相談）を追加した場合、既存DBでは次を実行してください。
-- alter table consultations add column if not exists requested_expert_id uuid references experts(id);
-- 専門家への質問を「月1回無料（会員特典）／チケット（6回¥3000）／都度¥600」の
-- 3通りにした価格体系見直しを追加した場合、既存DBでは次を実行してください。
-- alter table members add column if not exists expert_credits int not null default 0;
-- alter table members add column if not exists last_free_expert_question_period_end timestamptz;
-- alter table consultations add column if not exists expert_funding text check (expert_funding in ('paid','ticket','free_monthly'));
-- create table if not exists expert_ticket_purchases (
--   stripe_session_id text primary key,
--   member_id uuid not null references members(id),
--   credits int not null,
--   created_at timestamptz not null default now()
-- );
-- 会員登録すると、別の端末・ブラウザでも相談履歴が引き継げる（member_idでの紐付け）機能と、
-- 会員の過去の相談内容をAIが踏まえて回答する機能を追加した場合、既存DBでは次を実行してください。
-- alter table consultations add column if not exists member_id uuid references members(id);
-- create index if not exists consultations_member_id_idx on consultations (member_id);
-- マイページの「AIによる状況サマリー」機能（会員の過去相談をまとめて表示）を追加した場合、
-- 既存DBでは次を実行してください。
-- create table if not exists member_summaries (
--   member_id uuid primary key references members(id),
--   status_summary text not null default '',
--   advice text not null default '',
--   consultation_count int not null default 0,
--   generated_at timestamptz not null default now()
-- );
-- 専門家プロフィールへの「プロフィール写真のアップロード」「ご自身のサービス等へのリンク」を
-- 追加した場合、既存DBでは次を実行してください。
-- alter table experts add column if not exists link_url text not null default '';
-- insert into storage.buckets (id, name, public) values ('expert-photos', 'expert-photos', true) on conflict (id) do nothing;
-- （このバケットは一般公開（public: true）。プロフィール写真は専門家一覧などで誰でも閲覧する
-- 　前提のため、登録証（expert-documents、非公開）とは別バケットにしている）
-- 専門家への報酬振込をStripe Connect（Express）経由の自動送金にした場合、
-- 既存DBでは次を実行してください。
-- alter table experts add column if not exists stripe_account_id text;
-- alter table experts add column if not exists stripe_payouts_enabled boolean not null default false;
-- alter table consultations add column if not exists stripe_transfer_id text;
-- alter table consultations add column if not exists paid_at timestamptz;
-- （StripeダッシュボードでConnect機能自体の有効化も別途必要です）
-- 分析ノートのAIサマリーに「言葉かけの提案」「環境面の工夫の提案」を追加した場合、
-- 既存DBでは次を実行してください。
-- alter table member_summaries add column if not exists phrasing_suggestion text not null default '';
-- alter table member_summaries add column if not exists environment_suggestion text not null default '';
-- 分析ノートのAIサマリーに「学校・居場所選びの着眼点（簡易版）」を追加した場合、
-- 既存DBでは次を実行してください。実在の学校名は出さない暫定版の着眼点提案です
-- （本格的な学校ごとの相性診断は、実在の学校データが揃うまでのカミングソーン扱い）。
-- alter table member_summaries add column if not exists school_fit_points text not null default '';
-- 会員登録時に「お知らせ・メルマガを受け取る」の同意（デフォルトOFF＝オプトイン）を
-- 追加した場合、既存DBでは次を実行してください。配信自体は別途実装予定で、今回は
-- 同意の記録のみ（2026-10-12）。
-- alter table members add column if not exists newsletter_opt_in boolean not null default false;
-- 相談への「通報する」機能（個人情報の混入・不適切な内容などを閲覧者が運営に知らせる手段。
-- 自動非表示はせず、運営が管理画面で確認するための件数記録のみ）を追加した場合、
-- 既存DBでは次を実行してください（2026-10-12）。
-- alter table consultations add column if not exists reports int not null default 0;
-- alter table consultations add column if not exists reported_by text[] not null default '{}';
-- 無料AI相談の1日10回の上限に実際に当たった人を計測するログテーブルを追加した場合、
-- 既存DBでは次を実行してください（2026-10-13）。
-- create table if not exists ai_limit_hits (
--   id uuid primary key default gen_random_uuid(),
--   author_id text not null,
--   client_ip text,
--   created_at timestamptz not null default now()
-- );
-- 新テーマ「学校との関係」(school)・「発達のこと」(dev)・「家庭・自分のこと」(home) を
-- lib/categories.ts に追加した際、このDB側の制約・ガイドライン初期値への反映が漏れていた
-- （2026-10-13発覚・修正）。既存DBでは次を実行してください。
-- alter table consultations drop constraint if exists consultations_category_check;
-- alter table consultations add constraint consultations_category_check
--   check (category in ('body','social','school','will','approach','course','dev','home','other'));
-- update guidelines set categories = jsonb_set(categories, '{school}', '{"dos": [], "donts": [], "samplePhrases": []}'::jsonb) where not (categories ? 'school');
-- update guidelines set categories = jsonb_set(categories, '{dev}', '{"dos": [], "donts": [], "samplePhrases": []}'::jsonb) where not (categories ? 'dev');
-- update guidelines set categories = jsonb_set(categories, '{home}', '{"dos": [], "donts": [], "samplePhrases": []}'::jsonb) where not (categories ? 'home');
-- （中身の下書きを入れる場合は、このファイル下部の update guidelines ... の "school"/"dev"/"home" ブロックをコピーして個別に実行してください）
-- サンプル相談9件（body/social/will/course/school/approach/dev/home/other）について、
-- 既存DBでは次を実行してください。
-- ※回答の文字数は何度か調整している。最終的に、lib/prompt.tsの実際のAI回答の目標値
--   （専門家の有料回答＝300文字以上を想定に対し、AIは100文字程度に短縮）に合わせて、
--   「①状況の受け止め（一言）」「②今日からできる一手（一言）」の2段落・100文字前後に統一した
--   （2026-10-13）。元の9件は既に本番DBに投入済みのため、INSERTではなく
--   質問文（投入時点のもの）をキーにしたUPDATEで本文を差し替える。
-- update consultations set
--   question = '3週間前、提出物を出し忘れたことを担任の先生にクラス全員の前で注意されました。それ以来、小4の娘は学校に行かなくなり、先生の名前を聞くだけで固まってしまいます。本人の中で何が起きているのか、親としてどう動けばいいのか、整理できずにいます。',
--   answer = '人前で叱られたことが理由そのものです。

-- 担任には経過だけ事実として伝え、保健室登校など出席扱いになる制度を確認してみましょう。'
-- where category = 'school' and author_id = 'seed'
--   and question = '小4の娘が、担任の先生に提出物を忘れたことを強く叱られてから学校に行けなくなりました。先生とどう関わればいいか分かりません。';
--
-- update consultations set
--   question = '毎日つい「学校どうするの」って聞いてしまう自分に、正直疲れてきました。中1の息子が不登校になって、もう3ヶ月。息子も私の顔色をうかがってる気がして、顔を合わせるのも気まずいです。',
--   answer = '毎日その言葉をかけるのは、真剣に考えているからです。

-- 今日から1週間、学校の話題は持ち出さず、朝晩の挨拶だけ続けてみてください。'
-- where category = 'approach' and author_id = 'seed'
--   and question = '中1の息子が不登校になって3ヶ月。毎日「学校どうするの」と聞いてしまい、本人も私もしんどくなっています。';
--
-- update consultations set
--   question = '授業中に席を立つ、忘れ物が多い、宿題も進まない……先生から次々に指摘されるようになったのは、小3の息子です。本人も「どうせできない」と言って学校を渋るようになりました。発達の特性を疑ったほうがいいんでしょうか。',
--   answer = '「どうせできない」は、自信が下がっているサインです。

-- まずはスクールカウンセラーに具体的なエピソードを伝え、今日からできる工夫を一緒に探しましょう。'
-- where category = 'dev' and author_id = 'seed'
--   and question = '小3の息子が、授業中じっとしていられない・忘れ物が多いと先生から度々指摘され、本人も嫌になって行き渋るようになりました。発達障害を疑った方がいいでしょうか。';
--
-- update consultations set
--   question = '正直に言うと、夫と対応方針が合わなくて、話すたびケンカになります。先日はついに子どもの前で怒鳴ってしまって、自分でもまずいと分かってます。でもどう直せばいいのか分かりません。',
--   answer = '子どもの前での言い合いを後悔しているなら変えられます。

-- 話し合いは子どもが見ていない時間に移す、と今日ひとつだけ決めてみてください。'
-- where category = 'home' and author_id = 'seed'
--   and question = '子どもが不登校になってから、夫と対応方針が合わず、話すたびに喧嘩になります。子どもの前でも言い合いをしてしまいました。';
--
-- update consultations set
--   question = '不登校になって半年が経ちます。娘に理由を聞いても「よく分からない」と言うばかりで、どこから手をつければいいのか分かりません。',
--   answer = 'きっかけが分からないのは珍しくありません。

-- まずは1週間、起床・食事・睡眠の時間を記録してみましょう。'
-- where category = 'other' and author_id = 'seed'
--   and question = '小5の娘が不登校になってから半年経ちますが、きっかけが本人にもはっきり分からないと言います。何から手をつければいいでしょうか。';
--
-- update consultations set
--   question = 'ここ2週間、毎朝「お腹痛い」と言って学校に行きたがりません。小児科で検査しても異常なしと言われ、仮病なのか分からず困っています。',
--   answer = '2週間続く腹痛は、体の状態も確認したいサインです。

-- 朝と起立後の脈拍を3日間測り、差が大きければその記録を持って小児科を受診しましょう。'
-- where category = 'body' and author_id = 'seed'
--   and question = '小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません。小児科で検査しても異常なしと言われました。仮病なんでしょうか。';
--
-- update consultations set
--   question = 'クラスでのトラブルをきっかけに、もう1ヶ月学校に行っていません。本人は「クラスには戻りたくない」の一点張りで、中2の娘とどう話せばいいのか悩んでいます。',
--   answer = 'クラスのトラブルがきっかけなら、戻る以外の道もあります。

-- 別室登校や保健室登校など、選べる選択肢を今週中に書き出してみましょう。'
-- where category = 'social' and author_id = 'seed'
--   and question = '中2の娘がクラスでのトラブルをきっかけに1ヶ月不登校です。本人は「クラスには戻りたくない」と言っています。';
--
-- update consultations set
--   question = '「学校の意味が分からない」と言い出してから、小6の息子は1週間学校を休んでいます。叱っても響かず、どう声をかけたらいいのか分かりません。',
--   answer = '「学校の意味が分からない」は、叱っても響きにくいサインです。

-- まず1週間叱るのをやめて、好きなことを1つ見つけて褒めてみてください。'
-- where category = 'will' and author_id = 'seed'
--   and question = '小6の息子が「学校の意味が分からない」と言い出し、1週間休んでいます。叱っても効果がありません。';
--
-- update consultations set
--   question = '進路を決める時期になりましたが、中3の娘は不登校のまま、高校に行くのか通信制にするのか決められずにいます。',
--   answer = '進路を今すぐ決めなくても大丈夫です。

-- まずは見学だけできる学校を1校、一緒に探してみましょう。'
-- where category = 'course' and author_id = 'seed'
--   and question = '中3の娘が不登校のまま進路を決める時期になりました。高校に行くのか、通信制にするのか、本人も決められずにいます。';

create extension if not exists "pgcrypto";

create table if not exists experts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  credential text not null default '公認心理師',
  license_number text not null default '', -- 資格の登録番号など、本人確認用に申告してもらう情報
  license_doc_path text, -- 登録証（画像/PDF）のStorageパス。非公開バケット（expert-documents）に保存し、
                          -- 一般には公開しない。管理画面で署名付きURLを発行して運営のみ確認する。
  bio text not null default '',
  photo_url text,
  link_url text not null default '', -- 専門家ご本人のサービス・サイトなどへの任意リンク（一覧に公開表示）
  stripe_account_id text, -- 報酬振込用のStripe Express（Connect）アカウントID
  stripe_payouts_enabled boolean not null default false, -- Stripe側の本人確認・口座情報登録が完了し、振込を受け取れる状態か
  verified boolean not null default false, -- 運営が資格を確認したらtrueにする。falseの間は回答できない
  verified_at timestamptz, -- 本人確認（verified=true）にした時刻。登録証（license_doc_path）の自動削除の起点に使う
  -- 審査状況の内訳（2026-10-13追加）。verifiedは「回答できるかどうか」の判定に
  -- 引き続き使う（既存コードとの互換のため残す）が、それだけだと「未確認（pending）」
  -- 「差し戻し（needs_fix・本人に直してもらい再提出待ち）」「却下（rejected・登録不可）」
  -- の3つを区別できず、却下した相手が管理画面の「本人確認待ち」に残り続けてしまう。
  -- review_statusでこの3状態＋verifiedを区別し、review_noteに運営からの
  -- コメント（差し戻しの理由・本人向けの一言）を入れる。
  review_status text not null default 'pending', -- 'pending' | 'verified' | 'needs_fix' | 'rejected'
  review_note text, -- 運営から本人向けのコメント（差し戻し理由・却下時の一言など）。ダッシュボードに表示
  created_at timestamptz not null default now()
);

-- 専門家登録証（本人確認書類）用の非公開バケット。
-- アプリは常にservice_roleキー経由でのみ読み書きするため、storage.objectsへの
-- RLSポリシーは不要（一般ユーザー・他の専門家・匿名ユーザーからは直接アクセスできない）。
insert into storage.buckets (id, name, public)
values ('expert-documents', 'expert-documents', false)
on conflict (id) do nothing;

-- 専門家プロフィール写真用の公開バケット（専門家一覧などで誰でも閲覧する前提）。
insert into storage.buckets (id, name, public)
values ('expert-photos', 'expert-photos', true)
on conflict (id) do nothing;

-- 利用者（保護者）アカウント。メール／パスワードでの登録・ログイン・ログアウトに加え、
-- 読み放題会員（月¥800のStripeサブスクリプション）の状態もこのテーブルで管理する。
-- consultations テーブルが member_id で参照するため、consultations より先に作成する。
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now(),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive', -- inactive / active / past_due / canceled 等（Stripeのsubscription.statusをほぼそのまま記録）
  subscription_current_period_end timestamptz,
  expert_credits int not null default 0, -- 専門家への質問チケット残数（6回¥3000パック購入分）
  last_free_expert_question_period_end timestamptz, -- 直近で「月1回無料」枠を使った時点のsubscription_current_period_end。
                                                     -- 現在のsubscription_current_period_endより古ければ、新しい周期＝無料枠が復活している。
  newsletter_opt_in boolean not null default false -- 「お知らせ・メルマガを受け取る」への同意。特定電子メール法のオプトイン
                                                     -- 要件に合わせ、登録時チェックボックスのデフォルトはOFF。配信機能自体は未実装で、
                                                     -- 今は同意の記録のみ（2026-10-12）。
);

create index if not exists members_stripe_subscription_id_idx on members (stripe_subscription_id);

-- 専門家への質問チケットパック（¥3000で6回分）の購入履歴。Stripeチェックアウトの
-- session_idを主キーにすることで、確認エンドポイントが何度呼ばれてもチケットが
-- 二重に付与されないようにする（insertが1回しか成功しない）。
create table if not exists expert_ticket_purchases (
  stripe_session_id text primary key,
  member_id uuid not null references members(id),
  credits int not null,
  created_at timestamptz not null default now()
);

create table if not exists consultations (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('body','social','school','will','approach','course','dev','home','other')),
  question text not null,
  answer text not null default '',
  grade text,
  gender text,
  author_id text not null,
  member_id uuid references members(id), -- 投稿時にログイン中だった会員。別端末・別ブラウザでも履歴を追えるようにするための紐付け
  client_ip text,
  likes int not null default 0,
  liked_by text[] not null default '{}',
  views int not null default 0,
  reports int not null default 0, -- 「通報する」が押された件数（自動非表示はせず、運営が管理画面で確認するための記録）
  reported_by text[] not null default '{}', -- 通報済みのuid一覧（同じ人の多重通報で件数が膨らまないようにするため）
  created_at timestamptz not null default now(),
  hidden boolean not null default false, -- 運営が非表示にした相談

  -- 公認心理師への有料相談
  request_type text not null default 'ai' check (request_type in ('ai','expert')),
  price_jpy int,                       -- 利用者が支払った金額
  paid boolean not null default false, -- Stripe決済が完了したか
  stripe_session_id text,
  expert_id uuid references experts(id),
  requested_expert_id uuid references experts(id), -- 利用者が専門家一覧から指名した相談先（未指名ならnull＝誰でも回答可）
  expert_status text check (expert_status in ('pending','answered')),
  expert_answer text,
  expert_payout_jpy int,               -- 専門家への報酬額（振込管理用）
  payout_status text not null default 'unpaid' check (payout_status in ('unpaid','paid','void')), -- void: 返金により報酬を無効化
  stripe_transfer_id text, -- 報酬をStripe Connect経由で振込済みの場合、その送金（Transfer）ID
  paid_at timestamptz, -- 報酬を振込済みにした時刻
  refunded boolean not null default false, -- 期限超過等でStripe側を返金した場合にtrue
  expert_answer_helpful boolean, -- 専門家回答への利用者フィードバック（null=未評価, true=役に立った, false=役に立たなかった）
  expert_funding text check (expert_funding in ('paid','ticket','free_monthly')) -- 専門家質問の財源（都度払い／チケット消費／月1回無料枠）。request_type='expert'のみ使用
);

create index if not exists consultations_member_id_idx on consultations (member_id);

-- マイページに表示する「今のお子さんの状況」のAIサマリー。会員の過去の相談をまとめて
-- 生成し、ここにキャッシュする（毎回のページ表示でAIを呼び直さないようにするため）。
-- consultation_count は生成時点でのその会員の相談件数。マイページ表示時にこの値と
-- 実際の件数を比較し、増えていれば再生成する（lib/memberSummary.ts）。
create table if not exists member_summaries (
  member_id uuid primary key references members(id),
  status_summary text not null default '',
  advice text not null default '',
  phrasing_suggestion text not null default '',
  environment_suggestion text not null default '',
  school_fit_points text not null default '',
  consultation_count int not null default 0,
  generated_at timestamptz not null default now()
);

-- ホーム画面（PCの広い画面のみ）のサイドバーに表示する、差し替え可能な広告・アフィリエイト
-- バナー枠。管理画面（/admin）から画像URL・リンク先・代替テキスト・表示ON/OFFを編集する。
-- 1行だけの設定（id='default'）で、バナー枠は今のところ1つのみ。
create table if not exists sidebar_banners (
  id text primary key default 'default',
  enabled boolean not null default false,
  image_url text not null default '',
  link_url text not null default '',
  alt_text text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  author_id text not null,
  client_ip text,
  agreed_at timestamptz not null default now()
);

-- 無料AI相談の1日あたり上限（1人10回）に実際に当たった人がどれくらいいるかを
-- 計測するためのログ。「10回を超えてもっと使いたい人」向けの有料プランを
-- 本格的に作るかどうかを、ここの件数を見てから判断する（2026-10-13追加）。
-- 同一IP・全体の上限（20回/300回）に当たったケースはここには記録しない
-- （知りたいのはあくまで「個人単位で10回を使い切る人がどれだけいるか」のため）。
create table if not exists ai_limit_hits (
  id uuid primary key default gen_random_uuid(),
  author_id text not null,
  client_ip text,
  created_at timestamptz not null default now()
);

-- [旧モデル・現在は未使用] かつては専門家への都度質問（¥500）を一度払うと、その日から
-- 30日間、他の人の専門家回答も読み放題になる特典を、匿名のブラウザID（author_id）単位で
-- このテーブルに記録していた。2026-10-10 決定の価格体系（月¥800の会員登録／都度¥500の
-- 専門家質問の2階建て）への移行により、読み放題の判定は members テーブルの
-- subscription_status（アカウント単位）に一本化したため、このテーブルはもう参照されない。
-- 既存データが残っていても実害はないため、削除せずそのまま残している。
create table if not exists expert_memberships (
  author_id text primary key,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists guidelines (
  id text primary key default 'default',
  supervised boolean not null default false, -- true になるのは、公認心理師が内容を確認・承認した後のみ
  supervised_by text,
  last_reviewed timestamptz,
  categories jsonb not null default '{
    "body":    {"dos": [], "donts": [], "samplePhrases": []},
    "social":  {"dos": [], "donts": [], "samplePhrases": []},
    "school":  {"dos": [], "donts": [], "samplePhrases": []},
    "will":    {"dos": [], "donts": [], "samplePhrases": []},
    "approach":{"dos": [], "donts": [], "samplePhrases": []},
    "course":  {"dos": [], "donts": [], "samplePhrases": []},
    "dev":     {"dos": [], "donts": [], "samplePhrases": []},
    "home":    {"dos": [], "donts": [], "samplePhrases": []},
    "other":   {"dos": [], "donts": [], "samplePhrases": []}
  }'::jsonb
);

insert into guidelines (id) values ('default') on conflict (id) do nothing;

-- 下書きの対応方針（未監修）。supervised は false のまま。
-- 公認心理師が内容を確認し、問題なければ supervised を true・supervised_by を名前にしてください。
-- アプリ側は supervised が false の間、「監修済み」とは表示せず、AIへの指示も「下書き」扱いにしています。
update guidelines set categories = '{
  "body": {
    "dos": [
      "起立性調節障害など身体的な要因の可能性を考え、小児科や起立性調節障害外来での検査を勧める",
      "起床時と起立時の脈拍など、具体的な記録をとってから受診すると診断の助けになることを伝える",
      "怠けているとは決めつけず、身体症状として受け止める姿勢を保つ",
      "無理に登校させず、本人の体調に合わせて生活リズムを一緒に整える"
    ],
    "donts": [
      "気合が足りない、甘えているといった精神論で片付けない",
      "検査で異常なしと言われただけで終わらせず、心理的要因や学校環境の確認も並行して行う",
      "本人の前でどうしてできないのと問い詰めない"
    ],
    "samplePhrases": [
      "お腹が痛いの、つらいね。まずは体のことを一緒に調べてみよう",
      "学校に行けなくても、あなたのせいじゃないよ"
    ]
  },
  "social": {
    "dos": [
      "クラスに戻る以外の選択肢（別室登校、保健室登校、オンライン授業など）を一緒に整理する",
      "戻りたくないという気持ちをまず受け止め、理由を急かさずに聞く",
      "学校側に、トラブルの経緯や現在の対応状況を確認する"
    ],
    "donts": [
      "気にしすぎ、そんなことでと本人の感じ方を否定しない",
      "本人の同意なしに、相手の子やクラス全体に事情を広めない",
      "無理に仲直りしなさいと対面を迫らない"
    ],
    "samplePhrases": [
      "クラスに戻る以外にも、できることはいろいろあるよ",
      "何があったか、話せるところだけ教えてくれる？"
    ]
  },
  "school": {
    "dos": [
      "担任やスクールカウンセラーと、無理のない範囲で早めに情報共有し、連携の窓口をつくる",
      "出席の扱いについて、保健室登校・別室登校・オンライン出席など、学校ごとの制度を確認する",
      "学校に相談する際は、本人の気持ちを代弁しすぎず、先に本人の意向を確認する"
    ],
    "donts": [
      "学校との連絡を本人に任せきりにしない（保護者が窓口になる）",
      "一度の対応がうまくいかなかったからと、学校を頼ること自体をやめない",
      "先生の対応への不満を、本人の前で感情的に話さない"
    ],
    "samplePhrases": [
      "学校の先生と少し話してみようと思うけど、いい？",
      "行けるときだけでも、先生に顔を見せられる方法を一緒に考えてみようか"
    ]
  },
  "will": {
    "dos": [
      "叱る・説得するのを一旦やめて、学校以外で学んでいること・興味を持っていることを認める",
      "学校の意味が分からないという言葉の背景にある気持ちを聞く",
      "小さなできたを一緒に見つけて言葉にする"
    ],
    "donts": [
      "将来どうするのといった不安を煽る言葉で追い詰めない",
      "他の子と比較しない",
      "登校を条件にした交換条件を出さない"
    ],
    "samplePhrases": [
      "今、学校に行く意味が見えなくなってるんだね",
      "それ、すごく詳しいね"
    ]
  },
  "approach": {
    "dos": [
      "「学校に行く・行かない」の話題を毎日は持ち出さず、まずは安心して過ごせる家庭の雰囲気を優先する",
      "話したくなった時にいつでも聞く姿勢を示し、話してくれたこと自体を認める",
      "生活リズム（食事・睡眠・外出）など、学校以外の小さな土台から一緒に整える"
    ],
    "donts": [
      "いつになったら行くのと期限を迫るような聞き方をしない",
      "他のきょうだいや周りの子と比べない",
      "不安な気持ちをぶつけるように叱ったり、態度で責めたりしない"
    ],
    "samplePhrases": [
      "今日は何も聞かないから、ゆっくりしてていいよ",
      "話したくなったらいつでも聞くからね"
    ]
  },
  "course": {
    "dos": [
      "今すぐ決めなくていいという前提を、本人と共有する",
      "見学だけできる学校やオンライン説明会など、負担の少ない情報収集から始める",
      "通信制高校・フリースクール・高卒認定など、複数の選択肢があることを伝える"
    ],
    "donts": [
      "普通の高校に行かないと将来が、という決めつけをしない",
      "本人の意思を確認せずに願書や申込みを進めない"
    ],
    "samplePhrases": [
      "高校に行く・行かないを、今すぐ決めなくて大丈夫だよ",
      "見るだけ、話を聞くだけでもいいところを探そう"
    ]
  },
  "dev": {
    "dos": [
      "気になる様子があれば、スクールカウンセラーや発達外来など専門機関への相談を選択肢として伝える",
      "診断の有無にかかわらず、本人が実際に困っていることに目を向けて対応を考える",
      "得意・不得意の差が大きいことを、わがままではなく特性として理解する姿勢を持つ"
    ],
    "donts": [
      "保護者の判断だけで診断名を決めつけない",
      "診断がついていない段階で、発達障害だからと本人に伝えない",
      "他の子どもと比べて能力を評価しない"
    ],
    "samplePhrases": [
      "得意なことと苦手なこと、両方あっていいんだよ",
      "困っていること、一緒に整理してみようか"
    ]
  },
  "home": {
    "dos": [
      "保護者自身が一人で抱え込まず、自治体の相談窓口や家族内での役割分担を検討する",
      "夫婦間で対応方針に差がある場合は、子どもの前で対立を見せないようにしつつ、二人で話す時間を持つ",
      "保護者自身の心身の余裕を保つことも、子どもへの対応の土台になると伝える"
    ],
    "donts": [
      "保護者自身を責めすぎない（原因探しより、今できることに目を向ける）",
      "家庭内の対立を子どもに仲裁させない",
      "一人で全てを背負おうとしない"
    ],
    "samplePhrases": [
      "あなた一人で頑張らなくていいんですよ",
      "ご夫婦で少し役割分担してみるのはどうでしょう"
    ]
  },
  "other": {
    "dos": [
      "相談内容の背景（きっかけ、期間、変化）を整理する",
      "他のテーマ（身体的要因・友人関係・学校との関係・本人の意思・関わり方・進路・発達のこと・家庭のこと）に近い部分があれば、それぞれの対応方針も参考にする"
    ],
    "donts": [
      "情報が少ない段階で、断定的な原因を決めつけない"
    ],
    "samplePhrases": [
      "まずは状況を一緒に整理してみよう"
    ]
  }
}'::jsonb
where id = 'default';

-- サンプルデータ（デザインプロトタイプと同じ3件）
-- 2026-10-13: 9件のサンプル相談の出だしが「〇年生の〇〇が」という同じ型に
-- 偏っているとの指摘を受け、この4件（新規DB向け初期データ）も出だしを変えた。
-- 本番DBには元の文言で投入済みのため、下の「新規DB向け初期データここまで」の
-- 後ろにある migration コメント（UPDATE）で本番側も揃える。
insert into consultations (category, question, answer, author_id, likes) values
('body', 'ここ2週間、毎朝「お腹痛い」と言って学校に行きたがりません。小児科で検査しても異常なしと言われ、仮病なのか分からず困っています。',
 '2週間続く腹痛は、体の状態も確認したいサインです。

朝と起立後の脈拍を3日間測り、差が大きければその記録を持って小児科を受診しましょう。',
 'seed', 12),
('social', 'クラスでのトラブルをきっかけに、もう1ヶ月学校に行っていません。本人は「クラスには戻りたくない」の一点張りで、中2の娘とどう話せばいいのか悩んでいます。',
 'クラスのトラブルがきっかけなら、戻る以外の道もあります。

別室登校や保健室登校など、選べる選択肢を今週中に書き出してみましょう。',
 'seed', 8),
('will', '「学校の意味が分からない」と言い出してから、小6の息子は1週間学校を休んでいます。叱っても響かず、どう声をかけたらいいのか分かりません。',
 '「学校の意味が分からない」は、叱っても響きにくいサインです。

まず1週間叱るのをやめて、好きなことを1つ見つけて褒めてみてください。',
 'seed', 15),
('course', '進路を決める時期になりましたが、中3の娘は不登校のまま、高校に行くのか通信制にするのか決められずにいます。',
 '進路を今すぐ決めなくても大丈夫です。

まずは見学だけできる学校を1校、一緒に探してみましょう。',
 'seed', 61)
on conflict do nothing;
-- 新規DB向け初期データここまで
