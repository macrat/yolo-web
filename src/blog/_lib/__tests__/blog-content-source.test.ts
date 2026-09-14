/**
 * 記事の読み取り元（src/blog/content）が読めなかったときの振る舞い。
 *
 * 「記事が 1 本も無い」と「記事を読めなかった」は、どちらも空のブログとして
 * 同じ見た目になる。読み取りの失敗を空の一覧で返すと、記事が全部消えたページが
 * 誰にも気づかれないまま公開されるため、失敗は失敗として表に出す必要がある。
 */
import fs from "node:fs";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAllBlogPosts, getBlogPostBySlug } from "@/blog/_lib/blog";

/** 記事ディレクトリが存在しない状態を、fs が答えるすべての経路で作る。 */
function hideContentDirectory(): void {
  vi.spyOn(fs, "existsSync").mockReturnValue(false);
  vi.spyOn(fs, "readdirSync").mockImplementation(() => {
    throw Object.assign(
      new Error(
        "ENOENT: no such file or directory, scandir 'src/blog/content'",
      ),
      { code: "ENOENT" },
    );
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("記事ディレクトリを読めないとき", () => {
  test("一覧は「記事が 0 件」として返さない", () => {
    hideContentDirectory();

    expect(() => getAllBlogPosts()).toThrow(/ENOENT/);
  });

  test("記事単体の取得も「その記事は無い」として返さない", async () => {
    hideContentDirectory();

    await expect(getBlogPostBySlug("any-slug")).rejects.toThrow(/ENOENT/);
  });
});
