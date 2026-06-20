/**
 * codegen ロジックの回帰テスト（in-memory テスト）
 *
 * resolveReleaseId() / buildReleaseIdContent() を直接呼び出し、
 * フォールバック優先順位（Vercel env → git → unknown）と出力形式を検証する。
 *
 * 優先順位1（VERCEL_GIT_COMMIT_SHA）は env を注入するだけで決定的に検証できる。
 * 優先順位2（ローカル git）と優先順位3（unknown）は実行環境の git 有無に依存する
 * ため、ここでは「優先順位1が他より強い」「short-7 短縮」「日付導出」を中心に固定する。
 */
import { describe, expect, test } from "vitest";

import {
  buildReleaseIdContent,
  resolveReleaseId,
} from "../generate-release-id";

describe("resolveReleaseId", () => {
  test("優先順位1: VERCEL_GIT_COMMIT_SHA を先頭7桁に短縮し、COMMIT_DATE から日付を導出する", () => {
    const release = resolveReleaseId({
      VERCEL_GIT_COMMIT_SHA: "1a2b3c4d5e6f7890",
      VERCEL_GIT_COMMIT_DATE: "2026-06-20T12:00:00.000Z",
    });
    expect(release).toBe("1a2b3c4-20260620");
  });

  test("優先順位1: VERCEL_GIT_COMMIT_SHA があれば git フォールバックより優先される", () => {
    // ローカル git が存在しても env が勝つことを、決定的な env だけで確認する。
    const release = resolveReleaseId({
      VERCEL_GIT_COMMIT_SHA: "abcdef01234567",
      VERCEL_GIT_COMMIT_DATE: "Sat Jun 20 2026 09:00:00 GMT+0000",
    });
    expect(release).toMatch(/^abcdef0-\d{8}$/);
    expect(release.startsWith("abcdef0-")).toBe(true);
  });

  test("日付は UTC で解釈され、タイムゾーン跨ぎでも決定的", () => {
    // 23:30 UTC は UTC 上では同日。ローカル TZ に依存しないことを確認。
    const release = resolveReleaseId({
      VERCEL_GIT_COMMIT_SHA: "0000000",
      VERCEL_GIT_COMMIT_DATE: "2026-01-15T23:30:00.000Z",
    });
    expect(release).toBe("0000000-20260115");
  });

  test("VERCEL_GIT_COMMIT_DATE が不正/欠落なら SHA は使いつつビルド日付にフォールバックする", () => {
    const release = resolveReleaseId({
      VERCEL_GIT_COMMIT_SHA: "deadbeef",
      VERCEL_GIT_COMMIT_DATE: "not-a-date",
    });
    // SHA は env のものを使い、日付は YYYYMMDD 形式であること。
    expect(release).toMatch(/^deadbee-\d{8}$/);
  });

  test("優先順位3: env も git も無い環境では unknown-<日付> にフォールバックする", () => {
    // PATH を空にして git を起動不能にし、env からも SHA を渡さない。
    // → 優先順位1・2 が両方落ち、最終フォールバックに到達する。
    const release = resolveReleaseId({
      PATH: "",
      VERCEL_GIT_COMMIT_SHA: undefined,
    });
    expect(release).toMatch(/^unknown-\d{8}$/);
  });
});

describe("buildReleaseIdContent", () => {
  test("AUTO-GENERATED ヘッダコメントが含まれる", () => {
    const content = buildReleaseIdContent("1a2b3c4-20260620");
    expect(content).toContain("AUTO-GENERATED FILE — DO NOT EDIT MANUALLY");
  });

  test("RELEASE_ID が文字列リテラルとして export される", () => {
    const content = buildReleaseIdContent("1a2b3c4-20260620");
    expect(content).toContain('export const RELEASE_ID = "1a2b3c4-20260620";');
  });

  test("値はエスケープされて埋め込まれる（任意文字列でも壊れない）", () => {
    const content = buildReleaseIdContent('weird"value');
    expect(content).toContain('export const RELEASE_ID = "weird\\"value";');
  });
});
