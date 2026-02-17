import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { loadPrompt, promptExists } from "../prompt-loader.js";

describe("prompt-loader", () => {
  const originalCwd = process.cwd();
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync("/tmp/spawner-prompt-test-");
    const promptDir = path.join(tmpDir, "agents", "prompt");
    fs.mkdirSync(promptDir, { recursive: true });
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("loads a prompt file and replaces $INPUT_MEMO_FILES", () => {
    const promptDir = path.join(tmpDir, "agents", "prompt");
    fs.writeFileSync(
      path.join(promptDir, "builder.md"),
      "# Builder\n\nCheck your inbox: $INPUT_MEMO_FILES\n\nDo the work.",
    );

    const result = loadPrompt("builder", "memo/builder/inbox/123-task.md");
    expect(result).toBe(
      "# Builder\n\nCheck your inbox: memo/builder/inbox/123-task.md\n\nDo the work.",
    );
  });

  it("does not replace $INPUT_MEMO_FILES when memoFiles is null (PM case)", () => {
    const promptDir = path.join(tmpDir, "agents", "prompt");
    fs.writeFileSync(
      path.join(promptDir, "project-manager.md"),
      "# PM\n\nManage the project.\n",
    );

    const result = loadPrompt("project-manager", null);
    expect(result).toBe("# PM\n\nManage the project.\n");
  });

  it("replaces multiple occurrences of $INPUT_MEMO_FILES", () => {
    const promptDir = path.join(tmpDir, "agents", "prompt");
    fs.writeFileSync(
      path.join(promptDir, "reviewer.md"),
      "Read $INPUT_MEMO_FILES first.\nThen review $INPUT_MEMO_FILES again.",
    );

    const result = loadPrompt("reviewer", "memo/reviewer/inbox/abc.md");
    expect(result).toBe(
      "Read memo/reviewer/inbox/abc.md first.\nThen review memo/reviewer/inbox/abc.md again.",
    );
  });

  it("promptExists returns true for existing prompt", () => {
    const promptDir = path.join(tmpDir, "agents", "prompt");
    fs.writeFileSync(path.join(promptDir, "builder.md"), "# Builder");
    expect(promptExists("builder")).toBe(true);
  });

  it("promptExists returns false for missing prompt", () => {
    expect(promptExists("researcher")).toBe(false);
  });
});
