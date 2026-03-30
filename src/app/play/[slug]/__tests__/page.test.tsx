import { describe, it, expect } from "vitest";
import { getAllQuizSlugs } from "@/play/quiz/registry";
import { quizBySlug } from "@/play/quiz/registry";
import { generateStaticParams, generateMetadata } from "../page";

describe("play/[slug]/page", () => {
  describe("generateStaticParams", () => {
    it("returns all 15 quiz slugs", async () => {
      const params = await generateStaticParams();
      expect(params.length).toBe(15);
    });

    it("returns only quiz slugs (no game slugs)", async () => {
      const params = await generateStaticParams();
      const slugs = params.map((p) => p.slug);
      // All returned slugs must be valid quiz slugs
      const quizSlugs = getAllQuizSlugs();
      for (const slug of slugs) {
        expect(quizSlugs).toContain(slug);
      }
    });

    it("does not include game slugs", async () => {
      const params = await generateStaticParams();
      const slugs = params.map((p) => p.slug);
      // Game slugs are handled by static routes
      expect(slugs).not.toContain("irodori");
      expect(slugs).not.toContain("kanji-kanaru");
      expect(slugs).not.toContain("nakamawake");
      expect(slugs).not.toContain("yoji-kimeru");
    });
  });

  describe("FaqSection and ShareButtons integration", () => {
    it("quiz data has faq field for FaqSection to render", () => {
      // FaqSection relies on quiz.meta.faq. Verify at least one quiz has faq data.
      const quiz = quizBySlug.get("kanji-level");
      expect(quiz).toBeDefined();
      expect(quiz!.meta.faq).toBeDefined();
      expect(quiz!.meta.faq!.length).toBeGreaterThan(0);
    });

    it("FaqSection and ShareButtons are importable from expected paths", async () => {
      // Verify the components exist and are importable (used by page.tsx)
      const faqModule = await import("@/components/common/FaqSection");
      expect(faqModule.default).toBeDefined();

      const shareModule = await import("@/components/common/ShareButtons");
      expect(shareModule.default).toBeDefined();
    });
  });

  describe("RecommendedContent integration", () => {
    it("RecommendedContent is importable from expected path", async () => {
      // Verify RecommendedContent exists and is importable (used by page.tsx)
      const imported = await import("@/play/_components/RecommendedContent");
      expect(imported.default).toBeDefined();
    });
  });

  describe("generateMetadata", () => {
    it("returns metadata for a valid quiz slug", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "kanji-level" }),
        searchParams: Promise.resolve({}),
      });
      expect(metadata).toBeDefined();
      expect(metadata.title).toContain("漢字力診断");
    });

    it("returns empty object for unknown slug", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "nonexistent-slug" }),
        searchParams: Promise.resolve({}),
      });
      expect(metadata).toEqual({});
    });

    it("uses /play/ canonical URL (not /quiz/)", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "kanji-level" }),
        searchParams: Promise.resolve({}),
      });
      const canonical =
        typeof metadata.alternates?.canonical === "string"
          ? metadata.alternates.canonical
          : undefined;
      expect(canonical).toContain("/play/");
      expect(canonical).not.toContain("/quiz/");
    });
  });
});
