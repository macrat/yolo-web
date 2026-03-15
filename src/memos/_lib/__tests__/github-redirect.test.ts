import { describe, expect, test } from "vitest";
import {
  MEMO_COMMIT_HASH,
  GITHUB_MEMO_LIST_URL,
  buildGitHubMemoFileUrl,
} from "../github-redirect";

describe("github-redirect constants", () => {
  test("MEMO_COMMIT_HASH is 6f35080", () => {
    expect(MEMO_COMMIT_HASH).toBe("6f35080");
  });

  test("GITHUB_MEMO_LIST_URL points to memo tree on correct commit", () => {
    expect(GITHUB_MEMO_LIST_URL).toBe(
      "https://github.com/macrat/yolo-web/tree/6f35080/memo",
    );
  });
});

describe("buildGitHubMemoFileUrl", () => {
  test("returns URL with file path appended to blob URL", () => {
    const url = buildGitHubMemoFileUrl("memo/agent/inbox/abc123-.md");
    expect(url).toBe(
      "https://github.com/macrat/yolo-web/blob/6f35080/memo/agent/inbox/abc123-.md",
    );
  });

  test("works with nested paths", () => {
    const url = buildGitHubMemoFileUrl(
      "memo/agent/archive/19c54f3a6a0-bootstrap-instructions.md",
    );
    expect(url).toBe(
      "https://github.com/macrat/yolo-web/blob/6f35080/memo/agent/archive/19c54f3a6a0-bootstrap-instructions.md",
    );
  });
});
