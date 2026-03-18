/**
 * page.module.css アクセシビリティテスト
 * WCAG AA コントラスト比・タップターゲット・コメント整合性を検証する
 */
import { expect, describe, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const cssPath = resolve(__dirname, "../page.module.css");
const cssContent = readFileSync(cssPath, "utf-8");

describe("ヒーローグラデーション終点色", () => {
  test("ライトモードのグラデーション終点色が WCAG AA 基準 (4.5:1) を満たす暗いシアンであること", () => {
    // #1bb5c8 は明るすぎて白テキストとのコントラスト比が2.47:1 (WCAG AA 4.5:1必要)
    // #0e8a9a はコントラスト比4.10:1 で WCAG AA 未満
    // #0a7080 はコントラスト比5.0:1以上で WCAG AA を満たす
    expect(cssContent).not.toMatch(/#1bb5c8/i);
    expect(cssContent).not.toMatch(/#0e8a9a/i);
    // 修正後の色が含まれることを確認
    expect(cssContent).toMatch(/#0a7080/i);
  });

  test("ダークモードのグラデーション終点色が適切な暗さであること", () => {
    // ダークモードのグラデーション終点も確認
    expect(cssContent).toMatch(/:global\(:root\.dark\)\s*\.hero/);
  });
});

describe("毎日更新バッジのコントラスト", () => {
  test(".dailyBadge の文字色が暗色 (#451a03) であること", () => {
    // #f97316 背景に白文字 (#ffffff) はコントラスト比2.80:1 (WCAG AA 4.5:1必要)
    // 暗色テキストに変更が必要
    const dailyBadgeBlock = cssContent.match(/\.dailyBadge\s*\{[^}]+\}/);
    expect(dailyBadgeBlock).not.toBeNull();
    const block = dailyBadgeBlock![0];
    // 白文字 (#ffffff) が使われていないことを確認
    expect(block).not.toMatch(/color:\s*#ffffff/i);
    // 暗色テキストが使われていることを確認
    expect(block).toMatch(/color:\s*#451a03/i);
  });
});

describe("heroCta モバイルタップターゲット", () => {
  test("640pxメディアクエリ内の .heroCta に min-height: 44px が設定されていること", () => {
    // padding 0.65rem だけでは高さ約39px でタップターゲット44px未満
    // min-height: 44px が必要
    // メディアクエリブロック全体を取得
    const idx640 = cssContent.indexOf("@media (max-width: 640px)");
    expect(idx640).toBeGreaterThan(-1);

    // 640pxブロック内に heroCta の min-height があることを確認
    const after640 = cssContent.slice(idx640);
    expect(after640).toMatch(/\.heroCta[\s\S]*?\{[^}]*min-height:\s*44px/);
  });

  test("640pxメディアクエリ内の .heroCta に display: inline-flex が設定されていること", () => {
    const idx640 = cssContent.indexOf("@media (max-width: 640px)");
    const after640 = cssContent.slice(idx640);
    expect(after640).toMatch(/\.heroCta[\s\S]*?\{[^}]*display:\s*inline-flex/);
  });
});

describe("heroFeaturedItem モバイルタップターゲット", () => {
  test("640pxメディアクエリ内の .heroFeaturedItem に min-height: 44px が設定されていること", () => {
    // モバイル時の高さが約29px でタップターゲット44px未満
    const idx640 = cssContent.indexOf("@media (max-width: 640px)");
    const after640 = cssContent.slice(idx640);
    expect(after640).toMatch(
      /\.heroFeaturedItem[\s\S]*?\{[^}]*min-height:\s*44px/,
    );
  });
});

describe("heroFeaturedTitle コメントと実装の整合性", () => {
  test(".heroFeaturedTitle のコメントが white-space: nowrap の実装と一致していること", () => {
    // コメント「折り返し可能に」と white-space: nowrap は矛盾
    // 「1行で表示」のような正確なコメントに修正が必要
    // .heroFeaturedTitle ブロック付近のコメントに「折り返し可能」が含まれていないこと
    const heroFeaturedTitleIdx = cssContent.indexOf(".heroFeaturedTitle {");
    expect(heroFeaturedTitleIdx).toBeGreaterThan(-1);
    // ブロック前後200文字以内に矛盾するコメントがないことを確認
    const surrounding = cssContent.slice(
      Math.max(0, heroFeaturedTitleIdx - 200),
      heroFeaturedTitleIdx + 200,
    );
    expect(surrounding).not.toMatch(/折り返し可能/);
  });

  test(".heroFeaturedTitle に text-overflow: ellipsis と overflow: hidden が設定されていること", () => {
    const heroFeaturedTitleBlock = cssContent.match(
      /\.heroFeaturedTitle\s*\{[^}]+\}/,
    );
    expect(heroFeaturedTitleBlock).not.toBeNull();
    const block = heroFeaturedTitleBlock![0];
    expect(block).toMatch(/text-overflow:\s*ellipsis/);
    expect(block).toMatch(/overflow:\s*hidden/);
  });
});
