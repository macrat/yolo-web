/**
 * 遊びの一覧（/play）のテスト。レジストリはモックせず実データを使い、データが変わってもテストが追従する。
 */
import { describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import PlayPage, { metadata } from "../page";
import {
  allPlayContents,
  DAILY_UPDATE_SLUGS,
  quizQuestionCountBySlug,
} from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { resolveDisplayCategory } from "@/play/seo";
import { PLAY_KINDS } from "@/play/play-list";
import { formatDate } from "@/lib/date";

const navigation = vi.hoisted(() => ({ pathname: "/play" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

function visit(path: string) {
  navigation.pathname = "/play";
  window.history.replaceState(null, "", path);
}

function rows(): HTMLElement[] {
  return within(screen.getByRole("list", { name: "遊びの一覧" })).getAllByRole(
    "listitem",
  );
}

function rowNames(): string[] {
  return rows().map((row) => within(row).getByRole("link").textContent ?? "");
}

function displayName(slug: string): string {
  const content = allPlayContents.find((c) => c.slug === slug);
  if (!content) throw new Error(`no play content: ${slug}`);
  return content.shortTitle ?? content.title;
}

const kindOrder = PLAY_KINDS.map((kind) => kind.label);

describe("app/play/page.tsx", () => {
  test("パンくずの2つ目と h1 が、上端のナビと同じ「遊び」である", () => {
    visit("/play");
    render(<PlayPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("遊び");
    const crumbs = screen.getByRole("navigation", { name: "パンくずリスト" });
    expect(within(crumbs).getByText("遊び")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("タブと OGP・Twitter の題が「遊び | yolos.net」である", () => {
    expect(metadata.title).toBe("遊び | yolos.net");
    expect(metadata.openGraph?.title).toBe("遊び | yolos.net");
    expect(metadata.twitter?.title).toBe("遊び | yolos.net");
    expect(metadata.description).toContain(`全${allPlayContents.length}種`);
  });

  test("全件を1つの一覧に並べ、行のリンクの名前は名前だけで、行き先は遊びのページである", () => {
    visit("/play");
    render(<PlayPage />);
    expect(rows()).toHaveLength(allPlayContents.length);
    for (const content of allPlayContents) {
      const link = within(
        screen.getByRole("list", { name: "遊びの一覧" }),
      ).getByRole("link", { name: content.shortTitle ?? content.title });
      expect(link).toHaveAttribute("href", getContentPath(content));
    }
  });

  test("件数の行が全件を言う", () => {
    visit("/play");
    render(<PlayPage />);
    expect(
      screen.getByText(`全${allPlayContents.length}件`),
    ).toBeInTheDocument();
  });

  test("既定の並びは種別順で、同じ種別の中は公開日の新しい順である", () => {
    visit("/play");
    render(<PlayPage />);
    const shown = rowNames().map((name) =>
      allPlayContents.find((c) => (c.shortTitle ?? c.title) === name)!,
    );
    for (let i = 1; i < shown.length; i++) {
      const prev = shown[i - 1];
      const next = shown[i];
      const kindDiff =
        kindOrder.indexOf(resolveDisplayCategory(next)) -
        kindOrder.indexOf(resolveDisplayCategory(prev));
      expect(kindDiff).toBeGreaterThanOrEqual(0);
      if (kindDiff === 0) {
        expect(
          formatDate(next.publishedAt) <= formatDate(prev.publishedAt),
        ).toBe(true);
      }
    }
  });

  test("行は種別・公開日を持ち、毎日更新とクイズの問題数を補助情報に持つ", () => {
    visit("/play");
    render(<PlayPage />);
    for (const content of allPlayContents) {
      const row = within(screen.getByRole("list", { name: "遊びの一覧" }))
        .getByRole("link", { name: content.shortTitle ?? content.title })
        .closest("li") as HTMLElement;
      expect(row).toHaveTextContent(resolveDisplayCategory(content));
      expect(row.querySelector("time")).toHaveAttribute(
        "datetime",
        content.publishedAt,
      );
      expect(row).toHaveTextContent(formatDate(content.publishedAt));
      expect(row.textContent?.includes("毎日更新")).toBe(
        DAILY_UPDATE_SLUGS.has(content.slug),
      );
      const count = quizQuestionCountBySlug.get(content.slug);
      if (count !== undefined) expect(row).toHaveTextContent(`全${count}問`);
    }
  });

  test("種別の組で絞ると、その種別の行だけが残り、URL に kind が入る", () => {
    visit("/play");
    render(<PlayPage />);
    const group = screen.getByRole("radiogroup", { name: "種別" });
    fireEvent.click(within(group).getByRole("radio", { name: "パズル" }));

    const puzzles = allPlayContents.filter(
      (c) => resolveDisplayCategory(c) === "パズル",
    );
    expect(rows()).toHaveLength(puzzles.length);
    expect(window.location.search).toBe("?kind=puzzle");
  });

  test("新しい順では、種別をまたいで公開日の新しい順に並ぶ", () => {
    visit("/play?sort=newest");
    render(<PlayPage />);
    const dates = rowNames().map((name) =>
      formatDate(
        allPlayContents.find((c) => (c.shortTitle ?? c.title) === name)!
          .publishedAt,
      ),
    );
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test("名前の欄に打つと、名前と説明で絞られる", () => {
    vi.useFakeTimers();
    try {
      visit("/play");
      render(<PlayPage />);
      const [first] = allPlayContents;
      const name = displayName(first.slug);
      fireEvent.change(
        screen.getByRole("searchbox", { name: "名前・説明で探す" }),
        {
          target: { value: name },
        },
      );
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(rowNames()[0]).toBe(name);
    } finally {
      vi.useRealTimers();
    }
  });
});
