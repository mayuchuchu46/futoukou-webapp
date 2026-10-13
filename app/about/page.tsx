import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CATS } from '@/lib/categories';

const CATEGORY_KEYS = Object.keys(CATS);

// ビルド時の静的化はせず、監修状態（guidelines.supervised）を
// リクエストごとにサーバー側で取得して反映する。
export const instant = false;

async function getGuidelines() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  return data;
}

export default async function AboutPage() {
  const guidelines = await getGuidelines();

  const supervisionText = guidelines?.supervised
    ? `${guidelines.supervised_by ? guidelines.supervised_by + 'さんが監修した' : '公認心理師が監修した'}対応方針をもとに回答しています。`
    : '現在の回答内容は、公認心理師による正式な監修を受けていない下書きの対応方針をもとにしています。順次、専門家の確認を進めています。';

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
        <Link href="/mypage" className="backlink">← もどる</Link>

        <div className="card" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
          <img
            src="/assets/sensei_logo.png"
            alt="どうする先生"
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--sub)' }}
          />
          <div style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--main)' }}>
            どうする先生
          </div>
          <div style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>
            不登校のご家庭に、次の一手を。
          </div>
          <div className="muted">「今、どうしたらいい？」を、AIと専門家が一緒に考えます。</div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>どうする先生とは</div>
          <div className="qtext">
            「どうする先生」は、入力された状況をもとに、今できる具体的な対応を一緒に考えるAIです。実在する人物ではありません。一般的に知られている対応の目安をもとに回答しています。医療的・心理的な診断は行いません。
          </div>
        </div>

        {/* 「どうする先生とは」の一文だけではサービス全体像が伝わりにくいとの指摘を
            受けて、できること・対応する悩み・使い方の流れの3点を追加した
            （2026-10-13）。 */}
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>「どうする先生」でできること</div>
          <div className="qtext">
            <strong>AIへの相談（無料）</strong>：今の状況を入力すると、どうする先生が今日からできる次の一手を提案します。登録不要・匿名で利用できます（1日あたりのご利用回数には上限があります）。
          </div>
          <div className="qtext">
            <strong>専門家への相談（有料）</strong>：公認心理師など資格を持つ専門家本人が、相談文を直接読んで回答します（現在準備中で、近日公開予定です）。
          </div>
          <div className="qtext">
            <strong>分析ノート</strong>：会員登録すると、これまでの相談内容を一つのノートにまとめ、今のお子さんの状況や次にできそうなことを整理します。相談を重ねるほど詳しくなります。
          </div>
          {/* 自分が相談するだけでなく、他の人の相談・回答も読めることをサービスの特色として
              伝えてほしいとの要望を受けて追加（2026-10-13）。 */}
          <div className="qtext">
            <strong>みんなの相談</strong>：自分の相談だけでなく、同じように悩んでいる他の方の相談とその回答も、登録不要で読めます。自分だけじゃないと感じられたり、参考になるヒントが見つかることもあります。
          </div>
          <Link href="/" className="btn-secondary">みんなの相談を見る</Link>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>どんな悩みに対応していますか</div>
          <div className="qtext">
            身体的な不調、友人関係、学校との関係、本人の意思、ご家庭での関わり方、進路・勉強、発達のこと、ご家庭・保護者自身のこと、日常生活のことなど、不登校にまつわる幅広いテーマの相談に対応しています。
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORY_KEYS.map((key) => (
              <span key={key} className={`chip ${CATS[key].cls}`} style={{ fontSize: 12 }}>
                {CATS[key].label}
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>使い方の流れ</div>
          <div className="qtext">
            1. 登録不要・匿名のまま「相談する」から今の状況を相談できます。<br />
            2. 会員登録（無料）すると、これまでの相談が「分析ノート」として整理されるようになります。<br />
            3. さらに詳しく聞きたいときは、専門家への有料相談も利用できます。
          </div>
          <Link href="/ask" className="btn-secondary">相談するページへ</Link>
        </div>

        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>回答の監修について</div>
          <div className="qtext">{supervisionText}</div>
        </div>

        <Link href="/ask" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>
            <img src="/assets/icon_lock.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 0, border: 'none' }} />
            専門家による有料回答について
          </div>
          <div className="qtext">
            AIの自動回答とは別に、公認心理師など資格を持つ専門家本人が相談文を直接読んで回答する有料機能も用意しています。読み放題会員になると、他の人への専門家回答もすべて読めます。会員は月1回、無料で専門家に質問できます。
          </div>
          <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
            相談するページへ ›
          </div>
        </Link>

        <Link href="/experts" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>どんな専門家が回答していますか？</div>
          <div className="qtext">
            本人確認が完了した専門家のプロフィールを一覧で紹介しています。
          </div>
          <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
            専門家一覧へ ›
          </div>
        </Link>

        <Link href="/expert/recruit" className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>専門家としてご協力いただける方へ</div>
          <div className="qtext">
            公認心理師・臨床心理士など、不登校のご家庭への対応について専門知識をお持ちの方を募集しています。登録後、運営による本人確認（資格の確認）を経て、有料相談への回答をお願いします。
          </div>
          <div className="muted" style={{ alignSelf: 'flex-end', fontWeight: 700, color: 'var(--orange-text)' }}>
            専門家募集ページへ ›
          </div>
        </Link>
        <Link href="/expert/login" className="backlink" style={{ margin: '-10px 0 4px', fontSize: 13 }}>
          すでに登録済みの専門家の方はこちらからログイン →
        </Link>

        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>大切なお願い</div>
          <div className="qtext">
            緊急性が高いと感じるとき、またはお子さんの安全に関わる場合は、AIの回答を待たず、学校や医療機関、公的な相談窓口にご連絡ください。
          </div>
          <Link href="/support" className="btn-secondary">相談窓口の一覧を見る</Link>
        </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
