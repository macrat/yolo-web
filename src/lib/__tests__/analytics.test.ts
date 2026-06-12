import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  trackContentStart,
  trackContentEnd,
  trackAchievementUnlock,
  trackSearch,
  trackShare,
  trackSearchModalOpen,
  trackSearchModalClose,
  trackSearchResultClick,
  trackSearchAbandoned,
  trackToolboxTileAdd,
  trackToolboxTileRemove,
  trackToolboxReset,
  trackToolboxPresetSelect,
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
  });

  describe("trackAchievementUnlock", () => {
    it("sends unlock_achievement event", () => {
      trackAchievementUnlock("streak-7");

      expect(mockGtag).toHaveBeenCalledWith("event", "unlock_achievement", {
        achievement_id: "streak-7",
      });
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
    it("sends share event for twitter", () => {
      trackShare("twitter", "quiz", "quiz-kanji-level");

      expect(mockGtag).toHaveBeenCalledWith("event", "share", {
        method: "twitter",
        content_type: "quiz",
        item_id: "quiz-kanji-level",
      });
    });

    it("sends share event for clipboard", () => {
      trackShare("clipboard", "game", "irodori");

      expect(mockGtag).toHaveBeenCalledWith("event", "share", {
        method: "clipboard",
        content_type: "game",
        item_id: "irodori",
      });
    });

    it("sends share event for hatena", () => {
      trackShare("hatena", "blog", "my-post");

      expect(mockGtag).toHaveBeenCalledWith("event", "share", {
        method: "hatena",
        content_type: "blog",
        item_id: "my-post",
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

  describe("trackToolboxTileAdd", () => {
    it("sends toolbox_tile_add event with item_id and variant", () => {
      trackToolboxTileAdd({ item_id: "unit-converter", variant: "length" });

      expect(mockGtag).toHaveBeenCalledWith("event", "toolbox_tile_add", {
        item_id: "unit-converter",
        variant: "length",
      });
    });

    it("omits the variant key entirely when variant is not given", () => {
      trackToolboxTileAdd({ item_id: "color-picker" });

      expect(mockGtag).toHaveBeenCalledWith("event", "toolbox_tile_add", {
        item_id: "color-picker",
      });
      // toEqual-based matching ignores undefined properties, so explicitly
      // assert the key itself is absent (gtag must not receive variant: undefined).
      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("variant" in params).toBe(false);
    });
  });

  describe("trackToolboxTileRemove", () => {
    it("sends toolbox_tile_remove event with item_id and variant", () => {
      trackToolboxTileRemove({ item_id: "unit-converter", variant: "weight" });

      expect(mockGtag).toHaveBeenCalledWith("event", "toolbox_tile_remove", {
        item_id: "unit-converter",
        variant: "weight",
      });
    });

    it("omits the variant key entirely when variant is not given", () => {
      trackToolboxTileRemove({ item_id: "color-picker" });

      expect(mockGtag).toHaveBeenCalledWith("event", "toolbox_tile_remove", {
        item_id: "color-picker",
      });
      const params = mockGtag.mock.calls[0][2] as Record<string, unknown>;
      expect("variant" in params).toBe(false);
    });
  });

  describe("trackToolboxReset", () => {
    it("sends toolbox_reset event with no parameters", () => {
      trackToolboxReset();

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "toolbox_reset",
        undefined,
      );
    });
  });

  describe("trackToolboxPresetSelect", () => {
    it("sends toolbox_preset_select event with preset_id", () => {
      trackToolboxPresetSelect({ preset_id: "daily-life" });

      expect(mockGtag).toHaveBeenCalledWith("event", "toolbox_preset_select", {
        preset_id: "daily-life",
      });
    });
  });

  describe("trackTileFirstInteraction", () => {
    const surfaces: TileSurface[] = ["toolbox", "detail"];

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
        surface: "toolbox",
        variant: "length",
      });

      expect(mockGtag).toHaveBeenCalledWith("event", "tile_first_interaction", {
        item_id: "unit-converter",
        surface: "toolbox",
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
      expect(() => trackContentEnd("irodori", "game", true)).not.toThrow();
      expect(() => trackAchievementUnlock("streak-7")).not.toThrow();
      expect(() => trackSearch("test")).not.toThrow();
      expect(() => trackShare("twitter", "game", "irodori")).not.toThrow();
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
        trackToolboxTileAdd({ item_id: "color-picker" }),
      ).not.toThrow();
      expect(() =>
        trackToolboxTileRemove({ item_id: "color-picker", variant: "length" }),
      ).not.toThrow();
      expect(() => trackToolboxReset()).not.toThrow();
      expect(() =>
        trackToolboxPresetSelect({ preset_id: "daily-life" }),
      ).not.toThrow();
      expect(() =>
        trackTileFirstInteraction({
          item_id: "color-picker",
          surface: "toolbox",
        }),
      ).not.toThrow();
    });
  });
});
