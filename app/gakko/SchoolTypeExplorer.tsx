'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ManabiTayoukaGakko } from '@/lib/data/manabiTayoukaGakko';

// 学びの多様化学校タブの「学校種で絞り込む」チップ＋結果一覧。
// 以前はLinkによるページ遷移（サーバー側の再レンダリング）でこの絞り込みを
// 実現していたため、スクロール位置は保てても、押すたびにページ全体が
// 作り直される「リロードされる感じ」「反応が遅い」という指摘を受けた
// （2026-10-18）。MANABI_TAYOUKA_GAKKO自体は84件の静的データで全件すでに
// クライアントに送られているので、絞り込み自体はネットワークを一切介さず
// useStateでその場で行い、URL（共有用リンク・他セクションとの整合性のため）
// はバックグラウンドでrouter.replaceして追いつかせる方式にした。
type SchoolTypeFilter = '小学校' | '中学校' | '高等学校' | '小・中';
const SCHOOL_TYPES: SchoolTypeFilter[] = ['小学校', '中学校', '高等学校', '小・中'];
// 「すべて」表示時のグループ見出しの並び順。学齢の低い順（小学校→小・中→中学校→
// 高等学校）に並べ、進路を考える上で見渡しやすくしている。
const GROUP_ORDER: SchoolTypeFilter[] = ['小学校', '小・中', '中学校', '高等学校'];

function SchoolRow({ school: s }: { school: ManabiTayoukaGakko }) {
  // 学校名を押すと1校ごとの紹介ページ（/gakko/school/[no]）へ飛べるようにした
  // （2026-10-18、「学校名を押したらその学校の紹介ページに行くようにできる？」との
  // 指摘を受けて追加）。「すべて」のグループ表示・学校種で絞り込んだ時のフラット表示の
  // 両方で使うため、行自体をコンポーネントとして切り出した（2026-10-18）。
  return (
    <Link
      href={`/gakko/school/${s.no}`}
      style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 10, textDecoration: 'none', color: 'inherit' }}
    >
      <div className="qtext" style={{ fontWeight: 700 }}>
        {s.name}
        {s.branchName ? `（${s.branchName}）` : ''}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
        {s.city}・{s.schoolType}・{s.publicPrivate}・{s.type}・{s.designatedYear}指定
      </div>
    </Link>
  );
}

export default function SchoolTypeExplorer({
  allSchools,
  schoolsInPref,
  selectedPref,
  initialSchoolType,
}: {
  allSchools: ManabiTayoukaGakko[];
  schoolsInPref: ManabiTayoukaGakko[];
  selectedPref: string | null;
  initialSchoolType: SchoolTypeFilter | null;
}) {
  const router = useRouter();
  const [schoolType, setSchoolType] = useState<SchoolTypeFilter | null>(initialSchoolType);

  function select(st: SchoolTypeFilter | null) {
    // 画面の更新はここで即座に完了する（ネットワーク待ちなし）。
    setSchoolType(st);
    const params = [
      selectedPref ? `pref=${encodeURIComponent(selectedPref)}` : '',
      st ? `school=${encodeURIComponent(st)}` : '',
    ].filter(Boolean);
    const href = params.length ? `/gakko?${params.join('&')}` : '/gakko';
    // URL同期はバックグラウンドで行う。共有リンクや、下にある「都道府県から探す」の
    // 件数表示・セレクトボックスの遷移先に選択中の学校種を引き継ぐためのもので、
    // 画面の見た目自体はもう更新済みなので多少遅れてもユーザー体験には影響しない。
    router.replace(href, { scroll: false });
  }

  const filteredInPref = schoolType ? schoolsInPref.filter((s) => s.schoolType === schoolType) : schoolsInPref;

  return (
    <>
      <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
        <div className="answer-label" style={{ fontSize: 14 }}>学校種で絞り込む</div>
        <div className="chip-row chip-row-wrap">
          <button
            type="button"
            onClick={() => select(null)}
            className={`chip chip-tag${!schoolType ? ' active' : ''}`}
          >
            すべて（{allSchools.length}）
          </button>
          {SCHOOL_TYPES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => select(st)}
              className={`chip chip-tag${schoolType === st ? ' active' : ''}`}
            >
              {st}（{allSchools.filter((s) => s.schoolType === st).length}）
            </button>
          ))}
        </div>
      </div>

      {selectedPref && (
        <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div className="answer-label" style={{ fontSize: 14 }}>{selectedPref}の学びの多様化学校</div>
          {filteredInPref.length === 0 ? (
            <div className="muted">
              {schoolsInPref.length > 0 && schoolType ? (
                <>
                  {selectedPref}の学びの多様化学校に「{schoolType}」はありません。
                  <button
                    type="button"
                    onClick={() => select(null)}
                    style={{
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      color: 'inherit',
                    }}
                  >
                    絞り込みを解除する
                  </button>
                  と他の学校種が見られます。
                </>
              ) : (
                <>現時点で{selectedPref}には指定校がありません。指定校は年々増えているため、今後追加される可能性があります。下記の文部科学省の最新一覧もあわせてご確認ください。</>
              )}
            </div>
          ) : schoolType ? (
            // 学校種チップで絞り込み済みなので、その種類だけのフラットな一覧でよい。
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {filteredInPref.map((s) => (
                <SchoolRow key={s.no} school={s} />
              ))}
            </div>
          ) : (
            // 「すべて」表示時は、学校種ごとにチップを押し比べなくても一度に見比べられる
            // よう、小学校→小・中→中学校→高等学校の順で見出し付きグループ分け表示にする
            // （2026-10-18、「小中高とチップを何回も押し比べないといけない」との指摘を
            // 受けて追加）。チップ自体は、逆に1種類だけに絞りたい人のために残している。
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              {GROUP_ORDER.map((st) => {
                const group = filteredInPref.filter((s) => s.schoolType === st);
                if (group.length === 0) return null;
                return (
                  <div key={st} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                      {st}（{group.length}）
                    </div>
                    {group.map((s) => (
                      <SchoolRow key={s.no} school={s} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
