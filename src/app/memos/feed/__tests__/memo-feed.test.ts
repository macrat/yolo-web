import { describe, expect, test } from "vitest";
import { GET as getRss } from "../route";
import { GET as getAtom } from "../atom/route";

describe("RSS route handler (/memos/feed)", () => {
  test("GET returns 410 Gone", async () => {
    const response = await getRss();
    expect(response.status).toBe(410);
  });

  test("GET body contains removal message", async () => {
    const response = await getRss();
    const body = await response.text();
    expect(body).toContain("permanently removed");
  });
});

describe("Atom route handler (/memos/feed/atom)", () => {
  test("GET returns 410 Gone", async () => {
    const response = await getAtom();
    expect(response.status).toBe(410);
  });

  test("GET body contains removal message", async () => {
    const response = await getAtom();
    const body = await response.text();
    expect(body).toContain("permanently removed");
  });
});
