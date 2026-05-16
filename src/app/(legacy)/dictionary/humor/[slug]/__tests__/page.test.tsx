import { expect, test, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock humor-dict data
vi.mock("@/humor-dict/data", () => ({
  getAllSlugs: () => ["morning"],
  getEntryBySlug: (slug: string) => {
    if (slug === "morning") {
      return {
        slug: "morning",
        word: "朝",
        reading: "あさ",
        definition:
          "1日の中で唯一、根拠のない清々しさと根拠のある眠気が同時に存在する時間帯。",
        explanation: "テスト解説",
        example: "テスト用例",
        relatedSlugs: [],
      };
    }
    return undefined;
  },
}));

// Mock SEO utilities
vi.mock("@/lib/seo", () => ({
  generateHumorDictEntryMetadata: () => ({}),
  generateHumorDictJsonLd: () => ({}),
  safeJsonLdStringify: (v: unknown) => JSON.stringify(v),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

// Mock ShareButtons
vi.mock("@/components/common/ShareButtons", () => ({
  default: ({
    url,
    title,
    contentType,
    contentId,
  }: {
    url: string;
    title: string;
    contentType?: string;
    contentId?: string;
  }) => (
    <div
      data-testid="share-buttons"
      data-url={url}
      data-title={title}
      data-content-type={contentType}
      data-content-id={contentId}
    >
      ShareButtons
    </div>
  ),
}));

// Mock common components
vi.mock("@/components/common/Breadcrumb", () => ({
  default: () => <nav>Breadcrumb</nav>,
}));

vi.mock("@/humor-dict/_components/RecordPlay", () => ({
  default: () => null,
}));

// Mock EntryRatingButton
vi.mock("@/humor-dict/_components/EntryRatingButton", () => ({
  default: ({ slug }: { slug: string }) => (
    <div data-testid="entry-rating-button" data-slug={slug}>
      EntryRatingButton
    </div>
  ),
}));

describe("HumorDictEntryPage", () => {
  async function renderPage(slug: string) {
    const { default: Page } = await import("../page");
    return render(await Page({ params: Promise.resolve({ slug }) }));
  }

  test("renders the word as heading", async () => {
    await renderPage("morning");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("朝");
  });

  test("renders ShareButtons component", async () => {
    await renderPage("morning");
    expect(screen.getByTestId("share-buttons")).toBeDefined();
  });

  test("passes correct url prop to ShareButtons", async () => {
    await renderPage("morning");
    const shareButtons = screen.getByTestId("share-buttons");
    expect(shareButtons.getAttribute("data-url")).toBe(
      "/dictionary/humor/morning",
    );
  });

  test("passes contentType='humor-dictionary' to ShareButtons", async () => {
    await renderPage("morning");
    const shareButtons = screen.getByTestId("share-buttons");
    expect(shareButtons.getAttribute("data-content-type")).toBe(
      "humor-dictionary",
    );
  });

  test("passes contentId=slug to ShareButtons", async () => {
    await renderPage("morning");
    const shareButtons = screen.getByTestId("share-buttons");
    expect(shareButtons.getAttribute("data-content-id")).toBe("morning");
  });

  test("share title includes word and definition", async () => {
    await renderPage("morning");
    const shareButtons = screen.getByTestId("share-buttons");
    const title = shareButtons.getAttribute("data-title") ?? "";
    expect(title).toContain("朝");
    expect(title).toContain("yolos.net");
  });

  test("renders EntryRatingButton with correct slug", async () => {
    await renderPage("morning");
    const ratingButton = screen.getByTestId("entry-rating-button");
    expect(ratingButton).toBeDefined();
    expect(ratingButton.getAttribute("data-slug")).toBe("morning");
  });

  test("EntryRatingButton appears before ShareButtons in DOM order", async () => {
    await renderPage("morning");
    const ratingButton = screen.getByTestId("entry-rating-button");
    const shareButtons = screen.getByTestId("share-buttons");
    // compareDocumentPosition: DOCUMENT_POSITION_FOLLOWING = 4 means ratingButton comes before shareButtons
    expect(
      ratingButton.compareDocumentPosition(shareButtons) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("throws notFound for unknown slug", async () => {
    vi.resetModules();
    await expect(async () => {
      const { default: Page } = await import("../page");
      await Page({ params: Promise.resolve({ slug: "unknown" }) });
    }).rejects.toThrow("NOT_FOUND");
  });
});
