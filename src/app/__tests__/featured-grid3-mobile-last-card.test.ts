import { expect, test, describe } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * モバイル表示での featuredGrid3 の3件目（全幅）カードのレイアウトを検証する。
 *
 * 要件:
 * 1. 640px以下のメディアクエリ内で、3件目カードが横並びレイアウト（flex-direction: row）になること
 * 2. 全幅カードのみ description が表示されること（通常モバイルカードでは非表示のまま）
 */
describe("featuredGrid3 mobile last-child card layout", () => {
  const cssPath = resolve(__dirname, "../page.module.css");
  const cssContent = readFileSync(cssPath, "utf-8");

  test("640px以下メディアクエリ内に featuredGrid3 > li:last-child .featuredCard の flex-direction: row が存在する", () => {
    // 640px以下のメディアクエリブロックを抽出
    const mobileMediaMatch = cssContent.match(
      /@media\s*\(max-width:\s*640px\)\s*\{([\s\S]*?)(?=@media|\s*$)/,
    );
    expect(
      mobileMediaMatch,
      "640pxのメディアクエリが存在する必要があります",
    ).not.toBeNull();

    const mobileBlock = mobileMediaMatch![1];

    // li:last-child .featuredCard に flex-direction: row が設定されていることを確認
    // CSS Modules では子孫セレクタで featuredCard を指定することで全幅カードのみ横並びにする
    expect(mobileBlock).toMatch(
      /\.featuredGrid3\s*>\s*li:last-child\s+\.featuredCard\s*\{[^}]*flex-direction\s*:\s*row/,
    );
  });

  test("640px以下メディアクエリ内に全幅カードの description 表示ルールが存在する", () => {
    const mobileMediaMatch = cssContent.match(
      /@media\s*\(max-width:\s*640px\)\s*\{([\s\S]*?)(?=@media|\s*$)/,
    );
    expect(
      mobileMediaMatch,
      "640pxのメディアクエリが存在する必要があります",
    ).not.toBeNull();

    const mobileBlock = mobileMediaMatch![1];

    // 全幅カードの description が display: block で表示されることを確認
    expect(mobileBlock).toMatch(
      /\.featuredGrid3\s*>\s*li:last-child\s+\.featuredCardDescription\s*\{[^}]*display\s*:\s*block/,
    );
  });

  test("通常モバイルカードでは featuredCardDescription が非表示のまま", () => {
    const mobileMediaMatch = cssContent.match(
      /@media\s*\(max-width:\s*640px\)\s*\{([\s\S]*?)(?=@media|\s*$)/,
    );
    expect(
      mobileMediaMatch,
      "640pxのメディアクエリが存在する必要があります",
    ).not.toBeNull();

    const mobileBlock = mobileMediaMatch![1];

    // 通常の .featuredCardDescription { display: none } が存在することを確認
    expect(mobileBlock).toMatch(
      /\.featuredCardDescription\s*\{[^}]*display\s*:\s*none/,
    );
  });
});
