import { describe, expect, test } from "vitest";
import { countFullStars, formatRating } from "../rating";

describe("formatRating", () => {
  test.each([
    [4, "4.0"],
    [5, "5.0"],
    [4.4, "4.4"],
  ])("writes %s as %s", (rating, text) => {
    expect(formatRating(rating)).toBe(text);
  });
});

describe("countFullStars", () => {
  test.each([
    [4.8, 5],
    [4.4, 4],
    [2.5, 3],
    [1.2, 1],
    [5, 5],
  ])("gives %s the nearest %s stars", (rating, stars) => {
    expect(countFullStars(rating)).toBe(stars);
  });
});
