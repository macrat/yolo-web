/**
 * next.config.ts の redirects 設定の回帰テスト
 *
 * cycle-279 フェーズ R: 道具箱ダッシュボード（/toolbox）を完全撤去した。
 * ツール本体は /tools 一覧と各詳細ページとして存続するため、/toolbox は
 * 410 にせず最も近い生存面 /tools へ 308 恒久リダイレクトする。redirect は
 * Next.js の設定としてしか存在しない（ルートファイルが無い）ため、設定
 * オブジェクトを直接検証して「リダイレクトが欠落し死リンクになる」回帰を防ぐ。
 */
import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("next.config redirects", () => {
  it("/toolbox は /tools へ 308 恒久リダイレクトされる（cycle-279 で撤去）", async () => {
    expect(nextConfig.redirects).toBeDefined();
    const redirects = await nextConfig.redirects!();
    const toolboxRedirect = redirects.find((r) => r.source === "/toolbox");
    expect(toolboxRedirect).toBeDefined();
    expect(toolboxRedirect!.destination).toBe("/tools");
    // permanent: true = 308 Permanent Redirect（面の廃止だが被リンク・
    // ブックマークの価値を保持し、関連する生存面へ確実に着地させる）
    expect(toolboxRedirect!.permanent).toBe(true);
  });
});
