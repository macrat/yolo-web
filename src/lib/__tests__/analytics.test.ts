import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  trackContentStart,
  trackContentEnd,
  trackContentRating,
  trackSearch,
  trackShare,
  trackSave,
  trackSearchModalOpen,
  trackSearchModalClose,
  trackSearchResultClick,
  trackSearchAbandoned,
  trackTileFirstInteraction,
} from "@/lib/analytics";
import type { CloseReasonValue, TileSurface } from "@/lib/analytics";

describe("analytics", () => {
  let mockGtag: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGtag = vi.fn();
    Object.defineProperty(window, "gtag", {
      value: mockGtag,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Clean up window.gtag
    Object.defineProperty(window, "gtag", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  describe("trackContentStart", () => {
    it("sends level_start event with correct parameters", () => {
      trackContentStart("irodori", "game");

      expect(mockGtag).toHaveBeenCalledWith("event", "level_start", {
        level_name: "irodori",
        content_type: "game",
        content_id: "irodori",
      });
    });

    it("sends level_start for quiz content type", () => {
      trackContentStart("quiz-kanji-level", "quiz");

      expect(mockGtag).toHaveBeenCalledWith("event", "level_start", {
        level_name: "quiz-kanji-level",
        content_type: "quiz",
        content_id: "quiz-kanji-level",
      });
    });

    it("omits ab_variant/experiment_id when ab is not given", () => {
      trackContentStart("quiz-kanji-level", "quiz");

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("ab_variant" in params).toBe(false);
      expect("experiment_id" in params).toBe(false);
    });

    it("sends ab_variant and experiment_id when ab is given", () => {
      trackContentStart("character-personality", "quiz", {
        experimentId: "quiz_result_visual_v1",
        variant: "A",
      });

      expect(mockGtag).toHaveBeenCalledWith("event", "level_start", {
        level_name: "character-personality",
        content_type: "quiz",
        content_id: "character-personality",
        ab_variant: "A",
        experiment_id: "quiz_result_visual_v1",
      });
    });
  });

  describe("trackContentEnd", () => {
    it("sends level_end event with success=true", () => {
      trackContentEnd("irodori", "game", true);

      expect(mockGtag).toHaveBeenCalledWith("event", "level_end", {
        level_name: "irodori",
        success: true,
        content_type: "game",
        content_id: "irodori",
      });
    });

    it("sends level_end event with success=false", () => {
      trackContentEnd("kanji-kanaru", "game", false);

      expect(mockGtag).toHaveBeenCalledWith("event", "level_end", {
        level_name: "kanji-kanaru",
        success: false,
        content_type: "game",
        content_id: "kanji-kanaru",
      });
    });

    it("sends level_end for diagnosis content type", () => {
      trackContentEnd("quiz-personality-test", "diagnosis", true);

      expect(mockGtag).toHaveBeenCalledWith("event", "level_end", {
        level_name: "quiz-personality-test",
        success: true,
        content_type: "diagnosis",
        content_id: "quiz-personality-test",
      });
    });

    it("omits ab_variant/experiment_id when ab is not given", () => {
      trackContentEnd("irodori", "game", true);

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("ab_variant" in params).toBe(false);
      expect("experiment_id" in params).toBe(false);
    });

    it("sends ab_variant and experiment_id when ab is given", () => {
      trackContentEnd("character-personality", "quiz", true, {
        experimentId: "quiz_result_visual_v1",
        variant: "B",
      });

      expect(mockGtag).toHaveBeenCalledWith("event", "level_end", {
        level_name: "character-personality",
        success: true,
        content_type: "quiz",
        content_id: "character-personality",
        ab_variant: "B",
        experiment_id: "quiz_result_visual_v1",
      });
    });

    it("does not send ab_variant: undefined when ab is omitted", () => {
      // Explicit guard: GA must never receive a key whose value is undefined
      // (same discipline as buildTileParams for the toolbox `variant` key).
      trackContentEnd("irodori", "game", true);

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect(params.ab_variant).toBeUndefined();
      expect("ab_variant" in params).toBe(false);
    });
  });

  describe("trackSearch", () => {
    it("sends search event with trimmed term", () => {
      trackSearch("  kanji quiz  ");

      expect(mockGtag).toHaveBeenCalledWith("event", "search", {
        search_term: "kanji quiz",
      });
    });

    it("does not send event for empty string", () => {
      trackSearch("");

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it("does not send event for whitespace-only string", () => {
      trackSearch("   ");

      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe("trackShare", () => {
    it("sends share event for twitter with dual-written content_id", () => {
      trackShare("twitter", "quiz", "quiz-kanji-level");

      expect(mockGtag).toHaveBeenCalledWith("event", "share", {
        method: "twitter",
        content_type: "quiz",
        item_id: "quiz-kanji-level",
        content_id: "quiz-kanji-level",
      });
    });

    it("sends share event for clipboard", () => {
      trackShare("clipboard", "game", "irodori");

      expect(mockGtag).toHaveBeenCalledWith("event", "share", {
        method: "clipboard",
        content_type: "game",
        item_id: "irodori",
        content_id: "irodori",
      });
    });

    it("sends share event for hatena", () => {
      trackShare("hatena", "blog", "my-post");

      expect(mockGtag).toHaveBeenCalledWith("event", "share", {
        method: "hatena",
        content_type: "blog",
        item_id: "my-post",
        content_id: "my-post",
      });
    });

    it("dual-writes content_id to equal item_id (single-key join)", () => {
      trackShare("line", "quiz", "quiz-kanji-level");

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect(params.content_id).toBe(params.item_id);
    });

    it("adds surface when given, and omits it when not given", () => {
      trackShare(
        "web_share",
        "diagnosis",
        "quiz-character-personality",
        "text",
      );

      expect(mockGtag).toHaveBeenCalledWith("event", "share", {
        method: "web_share",
        content_type: "diagnosis",
        item_id: "quiz-character-personality",
        content_id: "quiz-character-personality",
        surface: "text",
      });
    });

    it("omits the surface key entirely when surface is not given", () => {
      trackShare("twitter", "quiz", "quiz-kanji-level");

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("surface" in params).toBe(false);
    });

    it("omits ab_variant/experiment_id when ab is not given", () => {
      trackShare("twitter", "quiz", "quiz-kanji-level");

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("ab_variant" in params).toBe(false);
      expect("experiment_id" in params).toBe(false);
    });

    it("sends surface, ab_variant and experiment_id together when both are given", () => {
      trackShare("twitter", "quiz", "character-personality", "fuda", {
        experimentId: "quiz_result_visual_v1",
        variant: "A",
      });

      expect(mockGtag).toHaveBeenCalledWith("event", "share", {
        method: "twitter",
        content_type: "quiz",
        item_id: "character-personality",
        content_id: "character-personality",
        surface: "fuda",
        ab_variant: "A",
        experiment_id: "quiz_result_visual_v1",
      });
    });

    it("sends ab_variant/experiment_id with surface omitted when only ab is given", () => {
      trackShare("twitter", "quiz", "character-personality", undefined, {
        experimentId: "quiz_result_visual_v1",
        variant: "A",
      });

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("surface" in params).toBe(false);
      expect(params.ab_variant).toBe("A");
      expect(params.experiment_id).toBe("quiz_result_visual_v1");
    });
  });

  describe("trackSave", () => {
    it("sends save event with content_id, content_type and method", () => {
      trackSave("quiz-character-personality", "diagnosis", "download");

      expect(mockGtag).toHaveBeenCalledWith("event", "save", {
        content_id: "quiz-character-personality",
        content_type: "diagnosis",
        method: "download",
      });
    });

    it("supports the web_share_files method", () => {
      trackSave("quiz-character-personality", "diagnosis", "web_share_files");

      expect(mockGtag).toHaveBeenCalledWith("event", "save", {
        content_id: "quiz-character-personality",
        content_type: "diagnosis",
        method: "web_share_files",
      });
    });

    it("adds surface when given", () => {
      trackSave("quiz-character-personality", "diagnosis", "download", "fuda");

      expect(mockGtag).toHaveBeenCalledWith("event", "save", {
        content_id: "quiz-character-personality",
        content_type: "diagnosis",
        method: "download",
        surface: "fuda",
      });
    });

    it("omits the surface key entirely when surface is not given", () => {
      trackSave("quiz-character-personality", "diagnosis", "download");

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("surface" in params).toBe(false);
    });

    it("omits ab_variant/experiment_id when ab is not given", () => {
      trackSave("quiz-character-personality", "diagnosis", "download");

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("ab_variant" in params).toBe(false);
      expect("experiment_id" in params).toBe(false);
    });

    it("sends surface, ab_variant and experiment_id together when both are given", () => {
      trackSave(
        "quiz-character-personality",
        "diagnosis",
        "web_share_files",
        "fuda",
        { experimentId: "quiz_result_visual_v1", variant: "B" },
      );

      expect(mockGtag).toHaveBeenCalledWith("event", "save", {
        content_id: "quiz-character-personality",
        content_type: "diagnosis",
        method: "web_share_files",
        surface: "fuda",
        ab_variant: "B",
        experiment_id: "quiz_result_visual_v1",
      });
    });
  });

  describe("trackContentRating", () => {
    it("sends content_rating event with no parameters when ab is not given", () => {
      trackContentRating();

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "content_rating",
        undefined,
      );
    });

    it("sends ab_variant and experiment_id when ab is given", () => {
      trackContentRating({
        experimentId: "quiz_result_visual_v1",
        variant: "B",
      });

      expect(mockGtag).toHaveBeenCalledWith("event", "content_rating", {
        ab_variant: "B",
        experiment_id: "quiz_result_visual_v1",
      });
    });
  });

  describe("trackSearchModalOpen", () => {
    it("sends search_modal_open event with no parameters", () => {
      trackSearchModalOpen();

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "search_modal_open",
        undefined,
      );
    });
  });

  describe("trackSearchModalClose", () => {
    const closeReasons: CloseReasonValue[] = [
      "escape",
      "backdrop",
      "close_button",
      "popstate",
      "navigation",
      "cmd_k",
    ];

    closeReasons.forEach((reason) => {
      it(`sends search_modal_close event with close_reason="${reason}"`, () => {
        trackSearchModalClose({ close_reason: reason });

        expect(mockGtag).toHaveBeenCalledWith("event", "search_modal_close", {
          close_reason: reason,
        });
      });
    });
  });

  describe("trackSearchResultClick", () => {
    it("sends search_result_click event with trimmed search_term and result_url", () => {
      trackSearchResultClick({
        search_term: "  kanji  ",
        result_url: "/tools/kanji-test",
      });

      expect(mockGtag).toHaveBeenCalledWith("event", "search_result_click", {
        search_term: "kanji",
        result_url: "/tools/kanji-test",
      });
    });

    it("sends search_result_click with query params and hash in result_url", () => {
      trackSearchResultClick({
        search_term: "quiz",
        result_url: "/play/quiz?level=1#section",
      });

      expect(mockGtag).toHaveBeenCalledWith("event", "search_result_click", {
        search_term: "quiz",
        result_url: "/play/quiz?level=1#section",
      });
    });

    it("does not send event when result_url is empty string", () => {
      trackSearchResultClick({
        search_term: "kanji",
        result_url: "",
      });

      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe("trackSearchAbandoned", () => {
    it("sends search_abandoned event with had_query=true", () => {
      trackSearchAbandoned({ had_query: true });

      expect(mockGtag).toHaveBeenCalledWith("event", "search_abandoned", {
        had_query: true,
      });
    });

    it("sends search_abandoned event with had_query=false", () => {
      trackSearchAbandoned({ had_query: false });

      expect(mockGtag).toHaveBeenCalledWith("event", "search_abandoned", {
        had_query: false,
      });
    });
  });

  describe("trackTileFirstInteraction", () => {
    const surfaces: TileSurface[] = ["detail"];

    surfaces.forEach((surface) => {
      it(`sends tile_first_interaction event with surface="${surface}"`, () => {
        trackTileFirstInteraction({ item_id: "color-picker", surface });

        expect(mockGtag).toHaveBeenCalledWith(
          "event",
          "tile_first_interaction",
          {
            item_id: "color-picker",
            surface,
          },
        );
      });
    });

    it("sends variant alongside item_id and surface when given", () => {
      trackTileFirstInteraction({
        item_id: "unit-converter",
        surface: "detail",
        variant: "length",
      });

      expect(mockGtag).toHaveBeenCalledWith("event", "tile_first_interaction", {
        item_id: "unit-converter",
        surface: "detail",
        variant: "length",
      });
    });

    it("omits the variant key entirely when variant is not given", () => {
      trackTileFirstInteraction({ item_id: "color-picker", surface: "detail" });

      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("variant" in params).toBe(false);
    });
  });

  describe("safety guards", () => {
    it("does not throw when window.gtag is undefined", () => {
      Object.defineProperty(window, "gtag", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(() => trackContentStart("irodori", "game")).not.toThrow();
      expect(() =>
        trackContentStart("character-personality", "quiz", {
          experimentId: "quiz_result_visual_v1",
          variant: "A",
        }),
      ).not.toThrow();
      expect(() => trackContentEnd("irodori", "game", true)).not.toThrow();
      expect(() =>
        trackContentEnd("character-personality", "quiz", true, {
          experimentId: "quiz_result_visual_v1",
          variant: "B",
        }),
      ).not.toThrow();
      expect(() => trackSearch("test")).not.toThrow();
      expect(() => trackShare("twitter", "game", "irodori")).not.toThrow();
      expect(() =>
        trackShare("twitter", "quiz", "character-personality", "fuda", {
          experimentId: "quiz_result_visual_v1",
          variant: "A",
        }),
      ).not.toThrow();
      expect(() =>
        trackSave("quiz-character-personality", "diagnosis", "download"),
      ).not.toThrow();
      expect(() =>
        trackSave(
          "quiz-character-personality",
          "diagnosis",
          "web_share_files",
          "fuda",
          { experimentId: "quiz_result_visual_v1", variant: "B" },
        ),
      ).not.toThrow();
      expect(() => trackContentRating()).not.toThrow();
      expect(() =>
        trackContentRating({
          experimentId: "quiz_result_visual_v1",
          variant: "A",
        }),
      ).not.toThrow();
      expect(() => trackSearchModalOpen()).not.toThrow();
      expect(() =>
        trackSearchModalClose({ close_reason: "escape" }),
      ).not.toThrow();
      expect(() =>
        trackSearchResultClick({
          search_term: "test",
          result_url: "/tools/test",
        }),
      ).not.toThrow();
      expect(() => trackSearchAbandoned({ had_query: false })).not.toThrow();
      expect(() =>
        trackTileFirstInteraction({
          item_id: "color-picker",
          surface: "detail",
        }),
      ).not.toThrow();
    });
  });
});
