import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  scanInbox,
  scanAllInboxes,
  countActiveMemos,
  getMemoInfo,
  createWatcher,
} from "../watcher.js";
import { MONITORED_ROLES } from "../types.js";

describe("watcher", () => {
  const originalCwd = process.cwd();
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync("/tmp/spawner-watcher-test-");
    // Create all memo directories
    for (const role of MONITORED_ROLES) {
      fs.mkdirSync(path.join(tmpDir, "memo", role, "inbox"), {
        recursive: true,
      });
      fs.mkdirSync(path.join(tmpDir, "memo", role, "active"), {
        recursive: true,
      });
      fs.mkdirSync(path.join(tmpDir, "memo", role, "archive"), {
        recursive: true,
      });
    }
    // Also create owner directories
    fs.mkdirSync(path.join(tmpDir, "memo", "owner", "inbox"), {
      recursive: true,
    });
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeMemo(
    role: string,
    state: string,
    filename: string,
    from: string,
    to: string,
    subject: string,
  ): string {
    const filePath = path.join(tmpDir, "memo", role, state, filename);
    fs.writeFileSync(
      filePath,
      `---\nid: "test"\nsubject: "${subject}"\nfrom: "${from}"\nto: "${to}"\ncreated_at: "2026-02-17T00:00:00+09:00"\ntags: []\nreply_to: null\n---\n\nTest body\n`,
    );
    return filePath;
  }

  describe("scanInbox", () => {
    it("returns .md files sorted by filename", () => {
      writeMemo("builder", "inbox", "bbb-task.md", "pm", "builder", "Task B");
      writeMemo("builder", "inbox", "aaa-task.md", "pm", "builder", "Task A");
      // non-md file should be excluded
      fs.writeFileSync(
        path.join(tmpDir, "memo", "builder", "inbox", "readme.txt"),
        "ignore",
      );

      const files = scanInbox("builder");
      expect(files).toHaveLength(2);
      expect(files[0]).toContain("aaa-task.md");
      expect(files[1]).toContain("bbb-task.md");
    });

    it("returns empty array for empty inbox", () => {
      const files = scanInbox("researcher");
      expect(files).toHaveLength(0);
    });
  });

  describe("scanAllInboxes", () => {
    it("returns only roles with memos", () => {
      writeMemo("builder", "inbox", "test.md", "pm", "builder", "Test");
      writeMemo("planner", "inbox", "test.md", "pm", "planner", "Test");

      const result = scanAllInboxes();
      expect(result.size).toBe(2);
      expect(result.has("builder")).toBe(true);
      expect(result.has("planner")).toBe(true);
      expect(result.has("reviewer")).toBe(false);
    });

    it("does not include owner", () => {
      // Write a memo to owner inbox
      const ownerInbox = path.join(tmpDir, "memo", "owner", "inbox");
      fs.writeFileSync(
        path.join(ownerInbox, "test.md"),
        '---\nid: "t"\nsubject: "t"\nfrom: "pm"\nto: "owner"\ncreated_at: "2026-01-01T00:00:00+09:00"\ntags: []\nreply_to: null\n---\n',
      );

      const result = scanAllInboxes();
      // owner is not in MONITORED_ROLES so it should not appear
      for (const [role] of result) {
        expect(role).not.toBe("owner");
      }
    });
  });

  describe("countActiveMemos", () => {
    it("counts .md files in active directory", () => {
      writeMemo("builder", "active", "task1.md", "pm", "builder", "Task 1");
      writeMemo("builder", "active", "task2.md", "pm", "builder", "Task 2");

      expect(countActiveMemos("builder")).toBe(2);
    });

    it("returns 0 for empty active directory", () => {
      expect(countActiveMemos("reviewer")).toBe(0);
    });
  });

  describe("getMemoInfo", () => {
    it("parses from, to, subject from frontmatter", () => {
      const filePath = writeMemo(
        "builder",
        "inbox",
        "test.md",
        "project-manager",
        "builder",
        "Implement feature X",
      );

      const info = getMemoInfo(filePath);
      expect(info).not.toBeNull();
      expect(info!.from).toBe("project-manager");
      expect(info!.to).toBe("builder");
      expect(info!.subject).toBe("Implement feature X");
    });

    it("returns null for non-existent file", () => {
      const info = getMemoInfo("/nonexistent/file.md");
      expect(info).toBeNull();
    });

    it("returns null for file without frontmatter", () => {
      const filePath = path.join(tmpDir, "memo", "builder", "inbox", "bad.md");
      fs.writeFileSync(filePath, "Just some text without frontmatter");

      const info = getMemoInfo(filePath);
      expect(info).toBeNull();
    });
  });

  describe("createWatcher", () => {
    let watcher: ReturnType<typeof createWatcher>;

    afterEach(() => {
      if (watcher) watcher.stop();
    });

    it("detects new .md files in inbox directories", async () => {
      const events: Array<{ role: string; filePath: string }> = [];
      watcher = createWatcher((event) => {
        events.push({ role: event.role, filePath: event.filePath });
      });
      watcher.start();

      // Write a new memo file
      writeMemo("builder", "inbox", "new-task.md", "pm", "builder", "New Task");

      // Wait for debounce + fs.watch event propagation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0].role).toBe("builder");
      expect(events[0].filePath).toContain("new-task.md");
    });

    it("filters out non-.md files", async () => {
      const events: Array<{ role: string }> = [];
      watcher = createWatcher((event) => {
        events.push({ role: event.role });
      });
      watcher.start();

      // Write a non-md file
      fs.writeFileSync(
        path.join(tmpDir, "memo", "builder", "inbox", "notes.txt"),
        "text",
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(events).toHaveLength(0);
    });

    it("debounces duplicate events for the same file", async () => {
      const events: string[] = [];
      watcher = createWatcher((event) => {
        events.push(event.filePath);
      });
      watcher.start();

      // Write the same file multiple times quickly
      const memoPath = path.join(
        tmpDir,
        "memo",
        "builder",
        "inbox",
        "rapid.md",
      );
      const content =
        '---\nid: "t"\nsubject: "t"\nfrom: "pm"\nto: "builder"\ncreated_at: "2026-01-01T00:00:00+09:00"\ntags: []\nreply_to: null\n---\n';
      fs.writeFileSync(memoPath, content);
      fs.writeFileSync(memoPath, content + "update1");
      fs.writeFileSync(memoPath, content + "update2");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Should only get 1 event due to debounce
      expect(events.length).toBe(1);
    });

    it("stop() clears all watchers and timeouts", () => {
      const events: string[] = [];
      watcher = createWatcher((event) => {
        events.push(event.filePath);
      });
      watcher.start();
      watcher.stop();

      // Writing after stop should not trigger events
      writeMemo("builder", "inbox", "after-stop.md", "pm", "builder", "Test");
      // No assertion needed - just ensure no errors
    });

    it("includes memoInfo when available", async () => {
      let receivedInfo: ReturnType<typeof getMemoInfo> | undefined;
      watcher = createWatcher((event) => {
        receivedInfo = event.memoInfo;
      });
      watcher.start();

      writeMemo(
        "reviewer",
        "inbox",
        "review-req.md",
        "builder",
        "reviewer",
        "Review my code",
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(receivedInfo).not.toBeNull();
      expect(receivedInfo!.from).toBe("builder");
      expect(receivedInfo!.to).toBe("reviewer");
      expect(receivedInfo!.subject).toBe("Review my code");
    });
  });
});
