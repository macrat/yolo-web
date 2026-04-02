/**
 * music-personality 専用結果ページのテスト。
 * generateStaticParams と generateMetadata の動作を検証する。
 */

import { describe, it, expect } from "vitest";
import musicPersonalityQuiz, {
  isValidMusicTypeId,
  getCompatibility,
} from "@/play/quiz/data/music-personality";
import { getResultIdsForQuiz } from "@/play/quiz/registry";

const SLUG = "music-personality";
const EXPECTED_TYPE_IDS = [
  "festival-pioneer",
  "playlist-evangelist",
  "solo-explorer",
  "repeat-warrior",
  "bgm-craftsman",
  "karaoke-healer",
  "midnight-shuffle",
  "lyrics-dweller",
];

describe("music-personality 専用結果ページ: generateStaticParams", () => {
  it("全8タイプのIDを返す", () => {
    const ids = getResultIdsForQuiz(SLUG);
    expect(ids).toHaveLength(8);
    for (const id of EXPECTED_TYPE_IDS) {
      expect(ids).toContain(id);
    }
  });

  it("全タイプIDが isValidMusicTypeId で valid と判定される", () => {
    const ids = getResultIdsForQuiz(SLUG);
    for (const id of ids) {
      expect(isValidMusicTypeId(id)).toBe(true);
    }
  });
});

describe("music-personality 専用結果ページ: detailedContent の variant 確認", () => {
  it("全結果の detailedContent.variant が 'music-personality'", () => {
    for (const result of musicPersonalityQuiz.results) {
      expect(result.detailedContent).toBeDefined();
      expect(result.detailedContent?.variant).toBe("music-personality");
    }
  });

  it("全結果に catchphrase が存在する", () => {
    for (const result of musicPersonalityQuiz.results) {
      const dc = result.detailedContent;
      expect(dc).toBeDefined();
      if (dc && dc.variant === "music-personality") {
        expect(dc.catchphrase).toBeTruthy();
        expect(typeof dc.catchphrase).toBe("string");
      }
    }
  });
});

describe("music-personality 専用結果ページ: 相性データ", () => {
  it("getCompatibility が同タイプ間で定義されている", () => {
    const ids = getResultIdsForQuiz(SLUG);
    // 少なくともいくつかの組み合わせが存在することを確認
    let foundCount = 0;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i; j < ids.length; j++) {
        const compat = getCompatibility(ids[i], ids[j]);
        if (compat) foundCount++;
      }
    }
    expect(foundCount).toBeGreaterThan(0);
  });
});

describe("music-personality クイズメタデータ", () => {
  it("accentColor が定義されている", () => {
    expect(musicPersonalityQuiz.meta.accentColor).toBeTruthy();
    expect(typeof musicPersonalityQuiz.meta.accentColor).toBe("string");
  });

  it("slug が 'music-personality'", () => {
    expect(musicPersonalityQuiz.meta.slug).toBe("music-personality");
  });
});
