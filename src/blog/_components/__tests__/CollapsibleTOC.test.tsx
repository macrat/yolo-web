import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CollapsibleTOC from "@/blog/_components/CollapsibleTOC";

const headings = [
  { level: 2, text: "はじめに", id: "intro" },
  { level: 3, text: "背景", id: "background" },
  { level: 4, text: "細かい話", id: "details" },
];

const SLUG = "javascript-date-pitfalls-and-fixes";

function renderToc() {
  const view = render(
    <>
      <CollapsibleTOC headings={headings} contentId={SLUG} />
      <a href="#after">目次のあとのリンク</a>
    </>,
  );
  const details = view.container.querySelector("details");
  if (!details) throw new Error("details が無い");
  const summary = details.querySelector("summary");
  if (!summary) throw new Error("summary が無い");
  return { ...view, details, summary };
}

/** 来訪者が開閉の行を押したときのように、details の開閉を変えて toggle を起こす。 */
function toggle(details: HTMLDetailsElement, open: boolean) {
  act(() => {
    details.open = open;
    fireEvent(details, new Event("toggle"));
  });
}

/**
 * 目次を留める画面の条件（`matchMedia`）の代わり。部品が問い合わせた条件を覚え、条件が変わったことを、登録された
 * 受け手に知らせられる。
 */
const stickyMedia = {
  queries: [] as string[],
  matches: true,
  listeners: new Set<() => void>(),
  change() {
    for (const listener of this.listeners) listener();
  },
};

/** requestAnimationFrame に渡されたもの。試験が順に呼ぶ。 */
const frames: FrameRequestCallback[] = [];

function runFrames() {
  while (frames.length > 0) frames.shift()!(0);
}

/**
 * document.elementFromPoint を置く。jsdom はこれを持たないので、試験が置き、試験のあとで取り除く（afterEach）。
 */
function placeElementFromPoint(hit: () => Element | null) {
  Object.defineProperty(document, "elementFromPoint", {
    value: hit,
    configurable: true,
    writable: true,
  });
}

describe("CollapsibleTOC", () => {
  let gtag: ReturnType<typeof vi.fn>;
  let scrollBy: ReturnType<typeof vi.fn>;

  function placeToc(top: number) {
    const nav = screen.getByRole("navigation", { name: "目次" });
    vi.spyOn(nav, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: top, width: 300, height: 66 }),
    );
  }

  beforeEach(() => {
    stickyMedia.listeners.clear();
    stickyMedia.queries = [];
    stickyMedia.matches = true;
    frames.length = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      frames.push(callback),
    );
    vi.stubGlobal("cancelAnimationFrame", () => {});
    placeElementFromPoint(() => null);
    scrollBy = vi.fn();
    vi.stubGlobal("scrollBy", scrollBy);
    vi.stubGlobal("matchMedia", (query: string) => {
      stickyMedia.queries.push(query);
      return {
        media: query,
        get matches() {
          return stickyMedia.matches;
        },
        addEventListener: (_type: string, listener: () => void) =>
          stickyMedia.listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) =>
          stickyMedia.listeners.delete(listener),
      };
    });
    gtag = vi.fn();
    Object.defineProperty(window, "gtag", {
      value: gtag,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "gtag", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (document as { elementFromPoint?: unknown }).elementFromPoint;
  });

  test("「目次」という名前のナビゲーションの中に、閉じた開閉の行「目次」を置く", () => {
    const { details, summary } = renderToc();
    expect(screen.getByRole("navigation", { name: "目次" })).toContainElement(
      details,
    );
    expect(summary).toHaveTextContent("目次");
    expect(details.open).toBe(false);
  });

  test("描いただけでは何も送らない", () => {
    renderToc();
    expect(gtag).not.toHaveBeenCalled();
  });

  test("来訪者が開くと toc_open を1回送り、閉じても送らない", () => {
    const { details } = renderToc();
    toggle(details, true);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "toc_open", {
      content_type: "blog",
      content_id: SLUG,
    });

    toggle(details, false);
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  test("項目を押すと toc_jump を1回送り、目次を閉じる", () => {
    const { details } = renderToc();
    toggle(details, true);
    gtag.mockClear();

    fireEvent.click(screen.getByRole("link", { name: "細かい話" }));
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "toc_jump", {
      content_type: "blog",
      content_id: SLUG,
      section_id: "details",
      section_level: 4,
    });
    expect(details.open).toBe(false);
  });

  test("フォーカスが目次の外へ移ると閉じ、目次の中で移るあいだは開いたまま", () => {
    const { details, summary } = renderToc();
    toggle(details, true);
    const firstItem = screen.getByRole("link", { name: "はじめに" });

    fireEvent.blur(summary, { relatedTarget: firstItem });
    expect(details.open).toBe(true);

    fireEvent.blur(firstItem, {
      relatedTarget: screen.getByRole("link", { name: "目次のあとのリンク" }),
    });
    expect(details.open).toBe(false);
  });

  test("開いているとき Escape で閉じ、フォーカスを開閉の行へ戻す", () => {
    const { details, summary } = renderToc();
    toggle(details, true);
    const item = screen.getByRole("link", { name: "背景" });
    item.focus();

    fireEvent.keyDown(item, { key: "Escape" });
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });

  test("閉じているときの Escape は何もしない", () => {
    const { details, summary } = renderToc();
    summary.focus();
    const event = fireEvent.keyDown(summary, { key: "Escape" });
    expect(event).toBe(true);
    expect(details.open).toBe(false);
  });

  describe("開くとき、目次が画面の上端にないと、目次が上端に来るまでページを送る", () => {
    test("読み始めの画面（目次が上端より下）では、その距離だけ即時に送る", () => {
      const { summary } = renderToc();
      placeToc(540);
      fireEvent.click(summary);
      expect(scrollBy).toHaveBeenCalledTimes(1);
      expect(scrollBy).toHaveBeenCalledWith({ top: 540, behavior: "instant" });
    });

    test("留めない低い画面で目次が上に外れているときも、上端に戻す", () => {
      const { summary } = renderToc();
      placeToc(-30);
      fireEvent.click(summary);
      expect(scrollBy).toHaveBeenCalledWith({ top: -30, behavior: "instant" });
    });

    test("すでに上端に留まっているときは送らない", () => {
      const { summary } = renderToc();
      placeToc(0);
      fireEvent.click(summary);
      expect(scrollBy).not.toHaveBeenCalled();
    });

    test("閉じるための押し下げでは送らない", () => {
      const { details, summary } = renderToc();
      toggle(details, true);
      placeToc(540);
      fireEvent.click(summary);
      expect(scrollBy).not.toHaveBeenCalled();
    });
  });

  describe("画面の高さが目次を留める条件をまたいだとき", () => {
    /** 試験ごとに置いた段落。試験のあとで取り除く。 */
    const paragraphs: HTMLElement[] = [];

    afterEach(() => {
      for (const paragraph of paragraphs.splice(0)) paragraph.remove();
    });

    /** 本文の段落の代わり。読み始めの線の下の点に当たる要素で、矩形を試験が決める。 */
    function placeParagraph(top: number, height: number) {
      const paragraph = document.createElement("p");
      document.body.appendChild(paragraph);
      paragraphs.push(paragraph);
      vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(
        DOMRect.fromRect({ x: 0, y: top, width: 300, height }),
      );
      placeElementFromPoint(() => paragraph);
      return paragraph;
    }

    function resizeTo(width: number, height: number, sticky: boolean) {
      vi.stubGlobal("innerWidth", width);
      vi.stubGlobal("innerHeight", height);
      stickyMedia.matches = sticky;
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });
    }

    beforeEach(() => {
      vi.stubGlobal("innerWidth", 375);
      vi.stubGlobal("innerHeight", 667);
    });

    test("開いたままなら、閉じずに目次を上端まで送る", () => {
      const { details } = renderToc();
      toggle(details, true);
      placeToc(-3482);
      act(() => stickyMedia.change());
      expect(scrollBy).toHaveBeenCalledWith({
        top: -3482,
        behavior: "instant",
      });
      expect(details.open).toBe(true);
    });

    test("閉じたまま回して目次が留まらなくなると、読んでいた段落を読み始めの線から同じ距離へ戻す", () => {
      // 縦の画面: 目次は上端に留まり、読み始めの線は目次の下端（66）。段落はその 34px 下。
      const paragraph = placeParagraph(100, 50);
      renderToc();
      placeToc(0);
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
      runFrames();
      // 横の画面: 目次は記事の頭の元の位置へ戻り（ブラウザは段落を 700 へ送った）、読み始めの線は画面の上端（0）。
      placeToc(-3000);
      vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(
        DOMRect.fromRect({ x: 0, y: 700, width: 300, height: 50 }),
      );
      resizeTo(667, 375, false);
      expect(scrollBy).toHaveBeenCalledWith({ top: 666, behavior: "instant" });
    });

    test("読み始めの線をまたぐ段落は、線より上に出ていた割合で戻し、行数が変わっても同じあたりの行を線に合わせる", () => {
      const paragraph = placeParagraph(-20, 100);
      renderToc();
      placeToc(0);
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
      runFrames();
      // 線（66）より上に 86px、段落の 86% が出ている。横の画面で段落の高さが 200px になっても、86% の所を線に合わせる。
      placeToc(-3000);
      vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(
        DOMRect.fromRect({ x: 0, y: 500, width: 300, height: 200 }),
      );
      resizeTo(667, 375, false);
      expect(scrollBy).toHaveBeenCalledWith({ top: 672, behavior: "instant" });
    });

    test("大きさが変わったあとの送り（ブラウザの拠り所の送り）では覚え直さず、回す前の所へ戻す", () => {
      const paragraph = placeParagraph(100, 50);
      renderToc();
      placeToc(0);
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
      runFrames();
      vi.stubGlobal("innerWidth", 667);
      placeToc(-3000);
      vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(
        DOMRect.fromRect({ x: 0, y: 700, width: 300, height: 50 }),
      );
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
      runFrames();
      resizeTo(667, 375, false);
      expect(scrollBy).toHaveBeenCalledWith({ top: 666, behavior: "instant" });
    });

    test("戻したあとの2フレームでも同じ所へ戻し直す（表の組み直しなどで本文が動いても合わせる）", () => {
      const paragraph = placeParagraph(100, 50);
      renderToc();
      placeToc(0);
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
      runFrames();
      placeToc(-3000);
      vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(
        DOMRect.fromRect({ x: 0, y: 700, width: 300, height: 50 }),
      );
      resizeTo(667, 375, false);
      scrollBy.mockClear();
      vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(
        DOMRect.fromRect({ x: 0, y: 120, width: 300, height: 50 }),
      );
      runFrames();
      expect(scrollBy).toHaveBeenCalledWith({ top: 86, behavior: "instant" });
    });

    test("留める条件をまたがない大きさの変わりでは送らない（ブラウザの送りに任せる）", () => {
      const paragraph = placeParagraph(100, 50);
      renderToc();
      placeToc(0);
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });
      runFrames();
      vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(
        DOMRect.fromRect({ x: 0, y: 400, width: 300, height: 50 }),
      );
      resizeTo(375, 600, true);
      expect(scrollBy).not.toHaveBeenCalled();
    });

    test("閉じているあいだは、条件の知らせだけでは送らない", () => {
      renderToc();
      placeToc(-3482);
      act(() => stickyMedia.change());
      expect(scrollBy).not.toHaveBeenCalled();
    });

    test("開いて閉じたあとは、開いているあいだの条件の受け手が残らず、条件が変わっても送らない", () => {
      const { details } = renderToc();
      toggle(details, true);
      expect(stickyMedia.listeners.size).toBe(1);
      toggle(details, false);
      expect(stickyMedia.listeners.size).toBe(0);
      placeToc(-3482);
      act(() => stickyMedia.change());
      expect(scrollBy).not.toHaveBeenCalled();
    });

    test("問い合わせる画面の条件は、CSS の目次を留める規則の条件と同じ", () => {
      const css = readFileSync(
        resolve(__dirname, "../CollapsibleTOC.module.css"),
        "utf-8",
      );
      const stickyRule = css.match(
        /@media ([^{]+?)\s*\{\s*\.toc\s*\{\s*position:\s*sticky;/,
      );
      expect(stickyRule).not.toBeNull();
      const { details } = renderToc();
      toggle(details, true);
      expect(stickyMedia.queries.length).toBeGreaterThan(0);
      expect(new Set(stickyMedia.queries)).toEqual(new Set([stickyRule![1]]));
    });
  });

  describe("開いているあいだはページ全体を送らない", () => {
    const css = readFileSync(
      resolve(__dirname, "../CollapsibleTOC.module.css"),
      "utf-8",
    );

    test("目次が留まる高さの画面で開いているあいだだけ、ルートの送りを止める（留める条件と同じ）", () => {
      expect(css).toMatch(
        /@media \(min-height: 500px\) \{\s*:global\(html\):has\(\.toc > details\[open\]\)\s*\{\s*overflow:\s*hidden;\s*\}\s*\}/,
      );
      expect(css).toMatch(
        /@media \(min-height: 500px\) \{\s*\.toc\s*\{\s*position:\s*sticky;/,
      );
      expect(css.match(/overflow:\s*hidden/g)).toHaveLength(1);
    });

    test("目次を持つページは、スクロールバーの場所をいつも取っておき、開閉でページの幅を変えない", () => {
      expect(css).toMatch(
        /:global\(html\):has\(\.toc\)\s*\{\s*scrollbar-gutter:\s*stable;\s*\}/,
      );
    });

    test("一覧は自分の中で縦に送れる", () => {
      expect(css).toMatch(/\.list\s*\{[^}]*overflow-y:\s*auto;/);
    });
  });

  test("gtag の無い環境でも、開いて項目を押せる", () => {
    Object.defineProperty(window, "gtag", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { details } = renderToc();
    toggle(details, true);
    expect(() =>
      fireEvent.click(screen.getByRole("link", { name: "はじめに" })),
    ).not.toThrow();
    expect(details.open).toBe(false);
  });
});
