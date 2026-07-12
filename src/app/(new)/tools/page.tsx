import type { Metadata } from "next";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { allToolMetas } from "@/tools/registry";
import type { ToolCategory } from "@/tools/types";
import styles from "./page.module.css";

/**
 * ツール一覧トップ — DESIGN.md フェーズ R で新デザイン「店構え」へ変換。
 *
 * 旧トップ（Panel + ToolsFilterableList/ToolsGrid・カードグリッド・クライアント側検索/
 * フィルタUI・旧トークン --fg/--bg/--border 等）を全廃し、DESIGN.md の店構えへ組み直した。
 * ツールは実務の道具であり、器は静か（§1/§4）——罫区切りの品書き1枚に全36ツールを載せる。
 *
 * 構成（§1「器は静か」/ §4「一覧の既定は品書き」/ §6 文章）:
 * - 名乗り（器・Shinagaki 外）: h1「ツール」+ 何が揃っているか・登録不要である旨を具体で。
 * - 全ツールを種別ごとの棚（見出し付き Shinagaki）に分ける。カードのグリッド・同型アイコン
 *   （§8-4）は使わない。各行 = 品名（ツールページへのリンク）+ ひとこと（shortDescription）。
 *   種別（棚見出し）自体が分類情報を担うため、行内に種別タグは重ねない
 *   （§4「値札は情報であって装飾ではない」——全行共通になる情報はラベル化しない）。
 * - 検索/絞り込み UI は持たない。36件は罫区切りの品書きを上から辿るだけで一望でき、
 *   旧トップのクライアント側フィルタ（JS 依存・状態を持つ UI）を追加する必要がないと判断した
 *   （迷った判断・要報告: 件数が増え一覧が長くなった場合は再検討が要る）。
 *
 * データは src/tools/registry.ts（生成元は generated/tools-registry.ts）から取得する唯一の
 * 真実源。ツール名・説明文をこのファイルにハードコードしない（meta.ts が更新されれば
 * 自動的に反映される）。
 */

/** 種別（棚）の並び順と見出し文言。日常的によく使う種別を先に、開発者向けを後に置く。 */
const CATEGORY_SHELVES: { category: ToolCategory; heading: string }[] = [
  { category: "text", heading: "文章の道具" },
  { category: "generator", heading: "計算・生成の道具" },
  { category: "security", heading: "パスワードとハッシュの道具" },
  { category: "developer", heading: "開発の道具" },
  { category: "encoding", heading: "エンコード変換の道具" },
];

export function generateMetadata(): Metadata {
  const count = allToolMetas.length;
  const description = `文字数カウント、日付計算、パスワード生成などの便利ツールから、JSON整形・正規表現テストなどの開発者向けツールまで、${count}個を無料で提供。登録不要でブラウザ上ですぐに使えます。`;

  return {
    title: "無料オンラインツール一覧 | yolos.net Tools",
    description,
    keywords: [
      "オンラインツール",
      "無料ツール",
      "便利ツール",
      "開発者ツール",
      "文字数カウント",
      "日付計算",
    ],
    openGraph: {
      title: "無料オンラインツール一覧 | yolos.net Tools",
      description,
      type: "website",
      url: `${BASE_URL}/tools`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: "無料オンラインツール一覧 | yolos.net Tools",
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/tools`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

export default function ToolsPage() {
  const count = allToolMetas.length;

  return (
    <div className={styles.page}>
      {/* 名乗り（器・読む面）。何が揃っているかを具体で（§6）。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>ツール</h1>
        <p className={styles.description}>
          文字数のカウントやパスワード生成といった日々のちょっとした作業から、JSON整形や正規表現のテストのような開発の下ごしらえまで、
          {count}
          個を揃えました。登録は不要です。入力した内容はすべてブラウザの中で処理され、外部に送信されません。
        </p>
      </div>

      {/* 種別ごとの棚。各棚 = 見出し付き品書き（§4）。 */}
      <div className={styles.shelves}>
        {CATEGORY_SHELVES.map(({ category, heading }) => {
          const items: ShinagakiItem[] = allToolMetas
            .filter((tool) => tool.category === category)
            .map((tool) => ({
              name: tool.name,
              href: `/tools/${tool.slug}`,
              note: tool.shortDescription,
            }));

          return (
            <Shinagaki
              key={category}
              heading={heading}
              items={items}
              ariaLabel={`${heading}の品書き`}
            />
          );
        })}
      </div>
    </div>
  );
}
