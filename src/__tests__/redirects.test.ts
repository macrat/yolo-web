/**
 * next.config.ts の redirects 設定の回帰テスト
 *
 * cycle-276 (B-545 決定(a)): 道具箱をトップ `/` から実用層 /toolbox へ
 * 降ろし、/toolbox を実ページ化した。これに伴い cycle-232 の
 * /toolbox → `/` permanent redirect を撤去した。redirect は Next.js の
 * 設定としてしか存在しない（ルートファイルが無い）ため、設定オブジェクトを
 * 直接検証して「redirect が残って実ページに到達できない」回帰を防ぐ。
 */
import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("next.config redirects", () => {
  it("/toolbox は redirect されない（実ページとして動く・cycle-276 で降格）", async () => {
    expect(nextConfig.redirects).toBeDefined();
    const redirects = await nextConfig.redirects!();
    const toolboxRedirect = redirects.find((r) => r.source === "/toolbox");
    expect(toolboxRedirect).toBeUndefined();
  });
});
