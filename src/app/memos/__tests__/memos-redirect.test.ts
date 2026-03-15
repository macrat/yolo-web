import { describe, expect, test } from "vitest";
import { GET as getMemosIndex } from "../route";
import { GET as getMemoById } from "../[id]/route";
import { GET as getMemoThread } from "../thread/[id]/route";

// Helper to build a Next.js-style route context for dynamic routes.
// The second argument to route handler GET functions is
// { params: Promise<{ id: string }> }.
function makeContext(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

describe("GET /memos (index redirect)", () => {
  test("returns 301 redirect", async () => {
    const response = await getMemosIndex();
    expect(response.status).toBe(301);
  });

  test("redirects to GitHub memo tree", async () => {
    const response = await getMemosIndex();
    expect(response.headers.get("location")).toBe(
      "https://github.com/macrat/yolo-web/tree/6f35080/memo",
    );
  });
});

describe("GET /memos/[id] (individual memo redirect)", () => {
  test("returns 301 redirect for a known memo ID", async () => {
    // Use a real ID from the mapping file.
    const response = await getMemoById(
      new Request("http://localhost"),
      makeContext("19c54f3a6a0"),
    );
    expect(response.status).toBe(301);
  });

  test("redirects to correct GitHub blob URL for known ID", async () => {
    const response = await getMemoById(
      new Request("http://localhost"),
      makeContext("19c54f3a6a0"),
    );
    expect(response.headers.get("location")).toBe(
      "https://github.com/macrat/yolo-web/blob/6f35080/memo/agent/archive/19c54f3a6a0-bootstrap-instructions.md",
    );
  });

  test("returns 404 for unknown memo ID", async () => {
    const response = await getMemoById(
      new Request("http://localhost"),
      makeContext("unknown-id-does-not-exist"),
    );
    expect(response.status).toBe(404);
  });
});

describe("GET /memos/thread/[id] (thread redirect)", () => {
  test("returns 301 redirect for a known memo ID", async () => {
    const response = await getMemoThread(
      new Request("http://localhost"),
      makeContext("19c54f3a6a0"),
    );
    expect(response.status).toBe(301);
  });

  test("redirects to correct GitHub blob URL for known ID", async () => {
    const response = await getMemoThread(
      new Request("http://localhost"),
      makeContext("19c54f3a6a0"),
    );
    expect(response.headers.get("location")).toBe(
      "https://github.com/macrat/yolo-web/blob/6f35080/memo/agent/archive/19c54f3a6a0-bootstrap-instructions.md",
    );
  });

  test("returns 404 for unknown thread ID", async () => {
    const response = await getMemoThread(
      new Request("http://localhost"),
      makeContext("unknown-thread-does-not-exist"),
    );
    expect(response.status).toBe(404);
  });
});
