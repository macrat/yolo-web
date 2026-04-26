/**
 * dev-preview/page.tsx — design-system コンポーネント動作確認ページ
 *
 * ## 目的
 * T-3 / T-4 で実装した design-system コンポーネント（Button / Input / Textarea /
 * SiteHeader / SiteFooter / Panel / SectionHead / ArticleArea）が
 * Next.js のビルドを通り、ブラウザで意図した見た目になることを確認する。
 *
 * ## パスの選択について（builder メモ）
 * 計画書では `src/app/_dev/` と指定されていたが、Next.js App Router では
 * `_` で始まるフォルダはプライベートフォルダとして扱われルーティングから除外される。
 * 受け入れ基準「ビルド出力 HTML に noindex が含まれること」を満たすため、
 * builder の判断として `dev-preview/` を使用する。
 *
 * ## 検索エンジン対応（三層遮断）
 * 第一層: このファイルの metadata.robots で noindex/nofollow を設定
 * 第二層: src/app/robots.ts の disallow に /dev-preview/ を追加
 * 第三層: src/app/sitemap.ts に dev-preview が含まれない（既存の仕様のまま）
 *
 * ## フォント読み込み
 * Noto Sans JP の読み込みは layout.tsx（dev-preview/ 専用）で行う。
 * globals.css には @import を書かない（cycle-170 T-03 Rev1 Blocker B1 の再発防止）。
 */

import type { Metadata } from "next";
import DevComponents from "./DevComponents";
import styles from "./page.module.css";

/** 検索エンジンへの露出を多層で遮断する（三層遮断の第一層） */
export const metadata: Metadata = {
  title: "[Dev] design-system コンポーネント確認",
  description:
    "design-system コンポーネントの動作確認ページ。本番サイトには存在しません。",
  // ルートレイアウトから継承される keywords を空配列で上書きする（本番キーワードを開発ページに残さない）
  keywords: [],
  robots: {
    index: false,
    follow: false,
  },
};

export default function DevPreviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>[Dev] design-system 動作確認</h1>
        <p className={styles.pageNote}>
          このページは開発用の確認ページです。本番サイトには公開されません。
          各コンポーネントの variant・サイズ・状態を実機で確認できます。
        </p>
        <p className={styles.pageNote}>
          注:
          ページ最上部・最下部に表示されているヘッダー／フッターはルートレイアウト由来の既存サイトのものです。
          design-system の SiteHeader・SiteFooter
          は下記の各セクションで個別に確認できます。
        </p>
      </header>
      <DevComponents />
    </div>
  );
}
