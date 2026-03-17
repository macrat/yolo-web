import { describe, test, expect } from "vitest";
import { getPlayPath, getPlayResultPath, getDailyFortunePath } from "../paths";

describe("getPlayPath", () => {
  test("returns /play/{slug} for a given slug", () => {
    expect(getPlayPath("kanji-kanaru")).toBe("/play/kanji-kanaru");
  });

  test("returns /play/{slug} for another slug", () => {
    expect(getPlayPath("animal-personality")).toBe("/play/animal-personality");
  });
});

describe("getPlayResultPath", () => {
  test("returns /play/{slug}/result/{resultId}", () => {
    expect(getPlayResultPath("animal-personality", "result-1")).toBe(
      "/play/animal-personality/result/result-1",
    );
  });
});

describe("getDailyFortunePath", () => {
  test("returns /play/daily", () => {
    expect(getDailyFortunePath()).toBe("/play/daily");
  });
});
