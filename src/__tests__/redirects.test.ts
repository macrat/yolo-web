/**
 * next.config.ts の redirects 設定の回帰テスト
 *
 * cycle-232 T-3（B-336 Phase 10.3）: 道具箱の本公開で旧プレビュー URL
 * /toolbox はトップ `/` への permanent redirect になった。redirect は
 * Next.js の設定としてしか存在しない（ルートファイルが無い）ため、
 * 設定オブジェクトを直接検証して回帰を防ぐ。
 */
import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("next.config redirects", () => {
  it("/toolbox はトップ `/` へ permanent redirect される（Phase 10.3 本公開）", async () => {
    expect(nextConfig.redirects).toBeDefined();
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual({
      source: "/toolbox",
      destination: "/",
      permanent: true,
    });
  });
});
