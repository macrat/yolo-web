import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import DictionaryDetailLayout from "../DictionaryDetailLayout";
import Section from "@/components/Section";
import type { DictionaryMeta } from "@/dictionary/_lib/types";
import type { PlayContentMeta } from "@/play/types";

// 辞典の詳細のページの組み方（DESIGN.md §5 ページの割り方）を見る。ページの頭を項目の本文のセクションに渡すこと、
// FAQ・共有・遊びのおすすめがそれぞれ兄弟のセクションになること、JSON-LD の数。

const meta: DictionaryMeta = {
  slug: "test-dict",
  name: "テスト辞典",
  publishedAt: "2026-02-19",
  valueProposition: "テスト用の一行価値テキスト",
  faq: [
    { question: "テスト質問1？", answer: "テスト回答1。" },
    { question: "テスト質問2？", answer: "テスト回答2。" },
  ],
};

const breadcrumbItems = [
  { label: "ホーム", href: "/" },
  { label: "辞典", href: "/dictionary" },
  { label: "テスト辞典", href: "/dictionary/test" },
  { label: "テスト項目", href: "/dictionary/test/item" },
];

const jsonLd = { "@context": "https://schema.org", "@type": "DefinedTerm" };

const shareHeading = ["この", "項目を", "共有"];

const playRecommendations: PlayContentMeta[] = [
  {
    slug: "test-play-1",
    title: "テスト占いコンテンツ",
    description: "テスト用の占いコンテンツです",
    shortDescription: "テスト占い",
    keywords: ["占い", "テスト"],
    publishedAt: "2026-01-01T00:00:00+09:00",
    contentType: "fortune",
    category: "fortune",
  },
];

/** 辞典の Detail と同じく、受け取った頭を最初のセクションの頭に置き、そのあとに項目の本文と関連のセクションを返す。 */
function detail(head: ReactNode) {
  return (
    <>
      <Section data-testid="item-body">
        {head}
        <h1>テスト項目</h1>
      </Section>
      <Section data-testid="item-related">
        <h2>同じ仲間</h2>
      </Section>
    </>
  );
}

function renderLayout(
  props: Partial<Parameters<typeof DictionaryDetailLayout>[0]> = {},
) {
  return render(
    <DictionaryDetailLayout
      meta={meta}
      breadcrumbItems={breadcrumbItems}
      jsonLd={jsonLd}
      shareUrl="/dictionary/test/item"
      shareTitle="テスト項目"
      shareHeading={shareHeading}
      {...props}
    >
      {detail}
    </DictionaryDetailLayout>,
  );
}

/** ページに並ぶ最上位のセクション（入れ子でないもの）。 */
function topLevelSections(container: HTMLElement): HTMLElement[] {
  return Array.from(container.children).filter(
    (el): el is HTMLElement => el.tagName === "SECTION",
  );
}

describe("DictionaryDetailLayout", () => {
  test("パンくずと名乗りの一言を、項目の本文のセクションの頭に、主見出しより前に置く", () => {
    renderLayout();
    const body = screen.getByTestId("item-body");
    const nav = within(body).getByRole("navigation", {
      name: "パンくずリスト",
    });
    const valueProposition =
      within(body).getByText("テスト用の一行価値テキスト");
    const h1 = within(body).getByRole("heading", { level: 1 });
    expect(body.firstElementChild).toContainElement(nav);
    expect(
      nav.compareDocumentPosition(valueProposition) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      valueProposition.compareDocumentPosition(h1) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("名乗りの一言が無い辞典では、頭はパンくずだけになる", () => {
    renderLayout({ meta: { ...meta, valueProposition: undefined } });
    expect(
      screen.queryByText("テスト用の一行価値テキスト"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "パンくずリスト" }),
    ).toBeInTheDocument();
  });

  test("項目のセクションのあとに、FAQ・共有・遊びのおすすめを、この順に兄弟のセクションとして並べる", () => {
    const { container } = renderLayout({ playRecommendations });
    const sections = topLevelSections(container);
    expect(sections).toHaveLength(5);
    expect(sections[0]).toBe(screen.getByTestId("item-body"));
    expect(sections[1]).toBe(screen.getByTestId("item-related"));
    expect(
      within(sections[2]).getByRole("heading", { name: "よくある質問" }),
    ).toBeInTheDocument();
    expect(
      within(sections[3]).getByRole("heading", { name: "この項目を共有" }),
    ).toBeInTheDocument();
    expect(within(sections[3]).getByText("URLをコピー")).toBeInTheDocument();
    expect(
      within(sections[4]).getByRole("heading", { name: "こちらもおすすめ" }),
    ).toBeInTheDocument();
    // FAQ から後ろの見出しは、どれもセクションの見出し（h2）
    for (const section of sections.slice(2)) {
      expect(section.querySelector("h2")).not.toBeNull();
    }
  });

  test("FAQ の問いを並べ、FAQ が無い辞典では FAQ のセクションを描かない", () => {
    const { container, unmount } = renderLayout();
    expect(screen.getByText("テスト質問1？")).toBeInTheDocument();
    expect(screen.getByText("テスト質問2？")).toBeInTheDocument();
    expect(topLevelSections(container)).toHaveLength(4);
    unmount();

    const without = renderLayout({ meta: { ...meta, faq: undefined } });
    expect(screen.queryByText("よくある質問")).not.toBeInTheDocument();
    expect(topLevelSections(without.container)).toHaveLength(3);
  });

  test("遊びのおすすめが無いか空なら、そのセクションを描かない", () => {
    const { container, unmount } = renderLayout({ playRecommendations: [] });
    expect(screen.queryByText("こちらもおすすめ")).not.toBeInTheDocument();
    expect(topLevelSections(container)).toHaveLength(4);
    unmount();

    renderLayout();
    expect(screen.queryByText("こちらもおすすめ")).not.toBeInTheDocument();
  });

  test("共有の見出しは、渡した区切りの切れ目でだけ折れる（DESIGN.md §4）", () => {
    renderLayout();
    const heading = screen.getByRole("heading", { name: "この項目を共有" });
    expect(heading.innerHTML).toBe(shareHeading.join("<wbr>"));
  });

  test("構造化データが1つなら script を1つ、並びなら要素ごとに出し、パンくずと FAQ の分が加わる", () => {
    const single = renderLayout();
    const singleScripts = single.container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    // 渡した1つ・パンくず・FAQPage
    expect(singleScripts).toHaveLength(3);
    expect(singleScripts[0].textContent).toContain("DefinedTerm");
    single.unmount();

    const multiple = renderLayout({
      jsonLd: [
        jsonLd,
        { "@context": "https://schema.org", "@type": "WebPage" },
      ],
    });
    const multipleScripts = multiple.container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(multipleScripts).toHaveLength(4);
    expect(multipleScripts[0].textContent).toContain("DefinedTerm");
    expect(multipleScripts[1].textContent).toContain("WebPage");
  });
});
