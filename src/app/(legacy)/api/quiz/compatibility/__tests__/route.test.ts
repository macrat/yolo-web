import { describe, test, expect } from "vitest";
import { GET } from "../route";

/**
 * Helper to create a GET Request with query parameters.
 */
function createGetRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/quiz/compatibility");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

/** Valid type IDs for character-personality quiz */
const VALID_TYPE_A = "blazing-strategist";
const VALID_TYPE_B = "gentle-fortress";

describe("GET /api/quiz/compatibility", () => {
  test("returns compatibility data for valid parameters", async () => {
    const request = createGetRequest({
      slug: "character-personality",
      typeA: VALID_TYPE_A,
      typeB: VALID_TYPE_B,
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(typeof data.label).toBe("string");
    expect(data.label.length).toBeGreaterThan(0);
    expect(typeof data.description).toBe("string");
    expect(data.description.length).toBeGreaterThan(0);
    expect(typeof data.myType).toBe("object");
    expect(typeof data.myType.title).toBe("string");
    expect(typeof data.myType.icon).toBe("string");
    expect(typeof data.friendType).toBe("object");
    expect(typeof data.friendType.title).toBe("string");
    expect(typeof data.friendType.icon).toBe("string");
  });

  test("returns same compatibility data regardless of typeA/typeB order", async () => {
    const request1 = createGetRequest({
      slug: "character-personality",
      typeA: VALID_TYPE_A,
      typeB: VALID_TYPE_B,
    });
    const request2 = createGetRequest({
      slug: "character-personality",
      typeA: VALID_TYPE_B,
      typeB: VALID_TYPE_A,
    });

    const response1 = await GET(request1);
    const response2 = await GET(request2);
    const data1 = await response1.json();
    const data2 = await response2.json();

    // label and description should be the same regardless of order
    expect(data1.label).toBe(data2.label);
    expect(data1.description).toBe(data2.description);
    // myType/friendType should be swapped
    expect(data1.myType.title).toBe(data2.friendType.title);
    expect(data1.friendType.title).toBe(data2.myType.title);
  });

  test("returns 400 for missing slug parameter", async () => {
    const request = createGetRequest({
      typeA: VALID_TYPE_A,
      typeB: VALID_TYPE_B,
    });

    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("returns 400 for unsupported slug", async () => {
    const request = createGetRequest({
      slug: "unknown-quiz",
      typeA: VALID_TYPE_A,
      typeB: VALID_TYPE_B,
    });

    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("returns 400 for missing typeA parameter", async () => {
    const request = createGetRequest({
      slug: "character-personality",
      typeB: VALID_TYPE_B,
    });

    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("returns 400 for missing typeB parameter", async () => {
    const request = createGetRequest({
      slug: "character-personality",
      typeA: VALID_TYPE_A,
    });

    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("returns 400 for invalid typeA", async () => {
    const request = createGetRequest({
      slug: "character-personality",
      typeA: "invalid-type-id",
      typeB: VALID_TYPE_B,
    });

    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("returns 400 for invalid typeB", async () => {
    const request = createGetRequest({
      slug: "character-personality",
      typeA: VALID_TYPE_A,
      typeB: "invalid-type-id",
    });

    const response = await GET(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test("sets Cache-Control header", async () => {
    const request = createGetRequest({
      slug: "character-personality",
      typeA: VALID_TYPE_A,
      typeB: VALID_TYPE_B,
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("max-age=86400");
  });

  test("works with same type for both typeA and typeB", async () => {
    const request = createGetRequest({
      slug: "character-personality",
      typeA: VALID_TYPE_A,
      typeB: VALID_TYPE_A,
    });

    const response = await GET(request);
    // Should return 200 or 404 depending on whether self-compatibility data exists
    expect([200, 404]).toContain(response.status);
  });
});
