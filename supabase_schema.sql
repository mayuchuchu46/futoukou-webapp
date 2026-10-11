-- どうする先生（不登校編） Supabase スキーマ
-- Supabaseのプロジェクト作成後、SQL Editorでこのファイルの内容を実行してください。
-- 既に作成済みのDBに対しては、下の create table 文は無視されます（if not exists のため）。
-- その場合は、新しく追加した列を反映するため、次の1行も実行してください（既にある場合はエラーなく無視されます）。
-- alter table consultations add column if not exists views int not null default 0;
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
-- insert into storage.buckets (id, name, public) values ('expert-documents', 'expert-documents', false) on conflict (id) do nothing;
-- （このバケットはアプリがservice_roleキー経由でのみ読み書きするため、storage.objectsへの
-- 　RLSポリシーは不要。一般ユーザー・他の専門家・匿名ユーザーからは直接アクセスできない）

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
  verified boolean not null default false, -- 運営が資格を確認したらtrueにする。falseの間は回答できない
  created_at timestamptz not null default now()
);

-- 専門家登録証（本人確認書類）用の非公開バケット。
-- アプリは常にservice_roleキー経由でのみ読み書きするため、storage.objectsへの
-- RLSポリシーは不要（一般ユーザー・他の専門家・匿名ユーザーからは直接アクセスできない）。
insert into storage.buckets (id, name, public)
values ('expert-documents', 'expert-documents', false)
on conflict (id) do nothing;

create table if not exists consultations (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('body','social','will','approach','course','other')),
  question text not null,
  answer text not null default '',
  grade text,
  gender text,
  author_id text not null,
  client_ip text,
  likes int not null default 0,
  liked_by text[] not null default '{}',
  views int not null default 0,
  created_at timestamptz not null default now(),
  hidden boolean not null default false, -- 運営が非表示にした相談

  -- 公認心理師への有料相談
  request_type text not null default 'ai' check (request_type in ('ai','expert')),
  price_jpy int,                       -- 利用者が支払った金額
  paid boolean not null default false, -- Stripe決済が完了したか
  stripe_session_id text,
  expert_id uuid references experts(id),
  expert_status text check (expert_status in ('pending','answered')),
  expert_answer text,
  expert_payout_jpy int,               -- 専門家への報酬額（手動振込管理用）
  payout_status text not null default 'unpaid' check (payout_status in ('unpaid','paid')),
  refunded boolean not null default false -- 期限超過等でStripe側を返金した場合にtrue
);

create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  author_id text not null,
  client_ip text,
  agreed_at timestamptz not null default now()
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

-- 利用者（保護者）アカウント。メール／パスワードでの登録・ログイン・ログアウトに加え、
-- 読み放題会員（月¥800のStripeサブスクリプション）の状態もこのテーブルで管理する。
-- 既存の匿名投稿（author_id、ブラウザのlocalStorage）との紐付けは行わない
-- （「誰の投稿か」は匿名ID、「読み放題かどうか」はこのアカウントのログイン、という役割分担）。
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now(),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive', -- inactive / active / past_due / canceled 等（Stripeのsubscription.statusをほぼそのまま記録）
  subscription_current_period_end timestamptz
);

create index if not exists members_stripe_subscription_id_idx on members (stripe_subscription_id);

create table if not exists guidelines (
  id text primary key default 'default',
  supervised boolean not null default false, -- true になるのは、公認心理師が内容を確認・承認した後のみ
  supervised_by text,
  last_reviewed timestamptz,
  categories jsonb not null default '{
    "body":    {"dos": [], "donts": [], "samplePhrases": []},
    "social":  {"dos": [], "donts": [], "samplePhrases": []},
    "will":    {"dos": [], "donts": [], "samplePhrases": []},
    "approach":{"dos": [], "donts": [], "samplePhrases": []},
    "course":  {"dos": [], "donts": [], "samplePhrases": []},
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
  "other": {
    "dos": [
      "相談内容の背景（きっかけ、期間、変化）を整理する",
      "身体・対人関係・本人の意思・進路のいずれかに近い部分があれば、それぞれの対応方針も参考にする"
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
insert into consultations (category, question, answer, author_id, likes) values
('body', '小5の息子が、ここ2週間毎朝「お腹痛い」と言って学校に行きたがりません。小児科で検査しても異常なしと言われました。仮病なんでしょうか。',
 '今日から3日間、起床直後と立ち上がった直後の脈拍を測ってください。やり方：朝、目が覚めたら横になったまま1分間脈を測る→その後立ち上がって1分後にもう一度測る。差が20以上あれば、起立性調節障害の可能性が高まります。この記録を持って小児科を受診してください。',
 'seed', 12),
('social', '中2の娘がクラスでのトラブルをきっかけに1ヶ月不登校です。本人は「クラスには戻りたくない」と言っています。',
 'まずは「クラスに戻る」以外の選択肢を本人と一緒に書き出してみてください。別室登校、保健室登校、オンライン授業など、学校に確認できる選択肢を今週中にリストアップし、本人に選んでもらう形にすると、本人の主体性が戻りやすくなります。',
 'seed', 8),
('will', '小6の息子が「学校の意味が分からない」と言い出し、1週間休んでいます。叱っても効果がありません。',
 '叱るのをまず1週間やめて、「学校以外で学んでいること」を1つ見つけて褒めてみてください。ゲームの攻略法を調べる、好きな本を読む、工作をするなど、何でも構いません。学ぶこと自体への抵抗をなくすのが最初の一歩です。',
 'seed', 15),
('course', '中3の娘が不登校のまま進路を決める時期になりました。高校に行くのか、通信制にするのか、本人も決められずにいます。',
 '「高校に行く・行かない」を今すぐ決めなくて大丈夫です。まずは見学だけできる学校を1校、一緒に探して候補に入れてみてください。見学して初めて見えてくることが多いです。',
 'seed', 61)
on conflict do nothing;
