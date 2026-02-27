import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import DictionaryDetailLayout from "../DictionaryDetailLayout";
import type { DictionaryMeta } from "@/dictionary/_lib/types";

const mockMeta: DictionaryMeta = {
  slug: "test-dict",
  name: "テスト辞典",
  trustLevel: "curated",
  valueProposition: "テスト用の一行価値テキスト",
  faq: [
    { question: "テスト質問1？", answer: "テスト回答1。" },
    { question: "テスト質問2？", answer: "テスト回答2。" },
  ],
};

const mockBreadcrumbItems = [
  { label: "ホーム", href: "/" },
  { label: "辞典", href: "/dictionary" },
  { label: "テスト辞典", href: "/dictionary/test" },
  { label: "テスト項目" },
];

const mockJsonLd = { "@context": "https://schema.org", "@type": "DefinedTerm" };

test("DictionaryDetailLayout renders breadcrumb navigation", () => {
  render(
    <DictionaryDetailLayout
      meta={mockMeta}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Detail content</div>
    </DictionaryDetailLayout>,
  );
  expect(
    screen.getByRole("navigation", { name: "パンくずリスト" }),
  ).toBeInTheDocument();
});

test("DictionaryDetailLayout renders children", () => {
  render(
    <DictionaryDetailLayout
      meta={mockMeta}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Detail content here</div>
    </DictionaryDetailLayout>,
  );
  expect(screen.getByText("Detail content here")).toBeInTheDocument();
});

test("DictionaryDetailLayout renders TrustLevelBadge based on meta.trustLevel", () => {
  render(
    <DictionaryDetailLayout
      meta={mockMeta}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Content</div>
    </DictionaryDetailLayout>,
  );
  // TrustLevelBadge for "curated" shows "AI作成データ"
  expect(screen.getByText("AI作成データ")).toBeInTheDocument();
});

test("DictionaryDetailLayout renders FaqSection when faq is provided", () => {
  render(
    <DictionaryDetailLayout
      meta={mockMeta}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Content</div>
    </DictionaryDetailLayout>,
  );
  expect(screen.getByText("よくある質問")).toBeInTheDocument();
  expect(screen.getByText("テスト質問1？")).toBeInTheDocument();
  expect(screen.getByText("テスト質問2？")).toBeInTheDocument();
});

test("DictionaryDetailLayout does not render FaqSection when faq is undefined", () => {
  const metaWithoutFaq: DictionaryMeta = {
    slug: "no-faq",
    name: "FAQなし辞典",
    trustLevel: "curated",
  };
  render(
    <DictionaryDetailLayout
      meta={metaWithoutFaq}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Content</div>
    </DictionaryDetailLayout>,
  );
  expect(screen.queryByText("よくある質問")).not.toBeInTheDocument();
});

test("DictionaryDetailLayout renders valueProposition when provided", () => {
  render(
    <DictionaryDetailLayout
      meta={mockMeta}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Content</div>
    </DictionaryDetailLayout>,
  );
  expect(screen.getByText("テスト用の一行価値テキスト")).toBeInTheDocument();
});

test("DictionaryDetailLayout does not render valueProposition when undefined", () => {
  const metaWithoutVp: DictionaryMeta = {
    slug: "no-vp",
    name: "VP無し辞典",
    trustLevel: "curated",
  };
  render(
    <DictionaryDetailLayout
      meta={metaWithoutVp}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Content</div>
    </DictionaryDetailLayout>,
  );
  expect(
    screen.queryByText("テスト用の一行価値テキスト"),
  ).not.toBeInTheDocument();
});

test("DictionaryDetailLayout renders ShareButtons", () => {
  render(
    <DictionaryDetailLayout
      meta={mockMeta}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Content</div>
    </DictionaryDetailLayout>,
  );
  // ShareButtons renders buttons with text labels like "X", "LINE", "コピー"
  expect(screen.getByText("コピー")).toBeInTheDocument();
});

test("DictionaryDetailLayout outputs single JSON-LD script tag for object", () => {
  const { container } = render(
    <DictionaryDetailLayout
      meta={mockMeta}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={mockJsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Content</div>
    </DictionaryDetailLayout>,
  );
  const scripts = container.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  // 1 for the jsonLd prop + 1 from Breadcrumb component = 2 total
  expect(scripts.length).toBe(2);
  // The first script should contain the DefinedTerm JSON-LD
  expect(scripts[0].textContent).toContain("DefinedTerm");
});

test("DictionaryDetailLayout outputs multiple JSON-LD script tags for array", () => {
  const jsonLdArray = [
    { "@context": "https://schema.org", "@type": "DefinedTerm" },
    { "@context": "https://schema.org", "@type": "WebPage" },
  ];
  const { container } = render(
    <DictionaryDetailLayout
      meta={mockMeta}
      breadcrumbItems={mockBreadcrumbItems}
      jsonLd={jsonLdArray}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
    >
      <div>Content</div>
    </DictionaryDetailLayout>,
  );
  const scripts = container.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  // 2 for the jsonLd array + 1 from Breadcrumb component = 3 total
  expect(scripts.length).toBe(3);
  expect(scripts[0].textContent).toContain("DefinedTerm");
  expect(scripts[1].textContent).toContain("WebPage");
});
