/**
 * next.config.ts の redirects 設定の回帰テスト
 *
 * /toolbox にはページが無い。ツールは /tools 一覧と各詳細ページにあるため、
 * /toolbox は 410 にせず最も近い面 /tools へ 308 恒久リダイレクトする。redirect は
 * Next.js の設定としてしか存在しない（ルートファイルが無い）ため、設定
 * オブジェクトを直接検証して「リダイレクトが欠落し死リンクになる」回帰を防ぐ。
 */
import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("next.config redirects", () => {
  it("/toolbox は /tools へ 308 恒久リダイレクトされる", async () => {
    expect(nextConfig.redirects).toBeDefined();
    const redirects = await nextConfig.redirects!();
    const toolboxRedirect = redirects.find((r) => r.source === "/toolbox");
    expect(toolboxRedirect).toBeDefined();
    expect(toolboxRedirect!.destination).toBe("/tools");
    // permanent: true = 308 Permanent Redirect（被リンク・ブックマークの価値を
    // 保ち、関連する面へ確実に着地させる）
    expect(toolboxRedirect!.permanent).toBe(true);
  });
});
