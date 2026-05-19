import type { Metadata } from "next";
import { allTileDefinitions } from "@/lib/toolbox/registry";
import styles from "./page.module.css";

/**
 * /internal/tiles — タイル定義レジストリの hidden 検証ルート（Phase 7.3）。
 *
 * 来訪者向けではなく開発者向けのデバッグ用ページ。
 * 隠蔽は noindex meta（`metadata.robots`）+ サイトナビ動線なしで実現する。
 * robots.txt の disallow には書かない（URL が公開ファイルから漏れて
 * 逆効果になるため。cycle-175 で同型事故が確認済 + /storybook 運用方針として確立済）。
 * Phase 8 で個別タイルが追加されるたびにレジストリに反映される。
 */
export const metadata: Metadata = {
  title: "タイル一覧（開発者向け） | yolos.net",
  description: "登録されたタイル定義の一覧。開発者向けの hidden 検証ルート。",
  robots: { index: false, follow: false },
};

export default function TilesIndexPage() {
  const tiles = allTileDefinitions;

  return (
    <main className={styles.container}>
      <h1 className={styles.pageTitle}>タイル定義レジストリ</h1>
      <p className={styles.notice}>
        このページは開発者向けの hidden
        検証ルートです。来訪者向けではありません。
      </p>

      {tiles.length === 0 ? (
        <p className={styles.empty}>タイルはまだ 0 件です</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">slug</th>
              <th scope="col">表示名</th>
              <th scope="col">サイズ（colSpan × rowSpan）</th>
            </tr>
          </thead>
          <tbody>
            {tiles.map((tile) => (
              <tr key={tile.slug}>
                <td>
                  <code>{tile.slug}</code>
                </td>
                <td>{tile.displayName}</td>
                <td>
                  {tile.size.colSpan} × {tile.size.rowSpan}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
