import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CategoryNav from "../CategoryNav";

// IntersectionObserver コールバックをテストから手動で発火できるようにするモック
type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
) => void;

let observerCallback: IntersectionObserverCallback | null = null;
const observedElements: Element[] = [];

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }

  observe(element: Element) {
    observedElements.push(element);
  }

  disconnect() {
    observerCallback = null;
    observedElements.length = 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unobserve(_element: Element) {
    // no-op: テスト環境ではunobserveは使用しない
  }
}

const CATEGORIES = [
  { category: "fortune", label: "今日の運勢" },
  { category: "personality", label: "あなたはどのタイプ？" },
  { category: "knowledge", label: "どこまで知ってる？" },
  { category: "game", label: "毎日のパズル" },
];

/** テスト用のダミーセクション要素を document.body に追加する */
function addSectionElements() {
  const ids = ["fortune", "personality", "knowledge", "game"];
  ids.forEach((id) => {
    const section = document.createElement("section");
    section.id = id;
    document.body.appendChild(section);
  });
}

/** テスト用のダミーセクション要素を document.body から除去する */
function removeSectionElements() {
  const ids = ["fortune", "personality", "knowledge", "game"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) document.body.removeChild(el);
  });
}

/** IntersectionObserver エントリーのモックを作成する */
function makeEntry(
  id: string,
  isIntersecting: boolean,
): IntersectionObserverEntry {
  const target = document.getElementById(id) ?? document.createElement("div");
  return {
    target,
    isIntersecting,
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  } as unknown as IntersectionObserverEntry;
}

beforeEach(() => {
  // window.IntersectionObserver をモッククラスで置き換える
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
  addSectionElements();
});

afterEach(() => {
  removeSectionElements();
  observerCallback = null;
  observedElements.length = 0;
  vi.restoreAllMocks();
});

describe("CategoryNav", () => {
  // テスト1: 初期状態で4つのタブがレンダリングされ、アクティブタブがないこと
  it("初期状態で4つのタブがレンダリングされ、アクティブタブがないこと", () => {
    render(<CategoryNav categories={CATEGORIES} />);

    expect(
      screen.getByRole("link", { name: "今日の運勢" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "あなたはどのタイプ？" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "どこまで知ってる？" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "毎日のパズル" }),
    ).toBeInTheDocument();

    // アクティブタブが初期状態では存在しないこと
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link.className).not.toMatch(/categoryNavTabActive/);
      // aria-current も初期状態では設定されていないこと
      expect(link).not.toHaveAttribute("aria-current");
    });
  });

  // テスト2: 特定セクションがintersectした時に対応タブがアクティブクラスを持つこと
  it("fortuneセクションがintersectした時に今日の運勢タブがアクティブクラスを持つこと", () => {
    render(<CategoryNav categories={CATEGORIES} />);

    act(() => {
      observerCallback?.([makeEntry("fortune", true)]);
    });

    const fortuneLink = screen.getByRole("link", { name: "今日の運勢" });
    expect(fortuneLink.className).toMatch(/categoryNavTabActive/);

    // 他のタブはアクティブでないこと
    const personalityLink = screen.getByRole("link", {
      name: "あなたはどのタイプ？",
    });
    expect(personalityLink.className).not.toMatch(/categoryNavTabActive/);
  });

  // テスト3: セクションが離れた時にアクティブが切り替わること
  it("fortuneセクションが離れた時にアクティブが解除されること", () => {
    render(<CategoryNav categories={CATEGORIES} />);

    // まずfortune をアクティブにする
    act(() => {
      observerCallback?.([makeEntry("fortune", true)]);
    });

    const fortuneLink = screen.getByRole("link", { name: "今日の運勢" });
    expect(fortuneLink.className).toMatch(/categoryNavTabActive/);

    // fortune が離れる
    act(() => {
      observerCallback?.([makeEntry("fortune", false)]);
    });

    expect(fortuneLink.className).not.toMatch(/categoryNavTabActive/);
  });

  // テスト4: 複数セクションが同時にintersectしている場合、categories配列の順序で最初のものがアクティブになること
  it("複数セクションが同時にintersectしている場合、categories配列の順序で最初のものがアクティブになること", () => {
    render(<CategoryNav categories={CATEGORIES} />);

    // personality と knowledge が同時にintersect
    act(() => {
      observerCallback?.([
        makeEntry("personality", true),
        makeEntry("knowledge", true),
      ]);
    });

    // categories配列でpersonalityの方がknowledgeより前なのでpersonalityがアクティブ
    const personalityLink = screen.getByRole("link", {
      name: "あなたはどのタイプ？",
    });
    const knowledgeLink = screen.getByRole("link", {
      name: "どこまで知ってる？",
    });

    expect(personalityLink.className).toMatch(/categoryNavTabActive/);
    expect(knowledgeLink.className).not.toMatch(/categoryNavTabActive/);
  });

  // テスト5: 最後のセクション（game）だけがintersectしている場合にgameタブがアクティブになること
  it("最後のセクション（game）だけがintersectしている場合にgameタブがアクティブになること", () => {
    render(<CategoryNav categories={CATEGORIES} />);

    act(() => {
      observerCallback?.([makeEntry("game", true)]);
    });

    const gameLink = screen.getByRole("link", { name: "毎日のパズル" });
    expect(gameLink.className).toMatch(/categoryNavTabActive/);

    // 他はアクティブでないこと
    const fortuneLink = screen.getByRole("link", { name: "今日の運勢" });
    expect(fortuneLink.className).not.toMatch(/categoryNavTabActive/);
  });

  // テスト6: 各タブのリンクが正しいhrefを持つこと
  it("各タブのリンクが正しいhrefを持つこと", () => {
    render(<CategoryNav categories={CATEGORIES} />);

    expect(screen.getByRole("link", { name: "今日の運勢" })).toHaveAttribute(
      "href",
      "#fortune",
    );
    expect(
      screen.getByRole("link", { name: "あなたはどのタイプ？" }),
    ).toHaveAttribute("href", "#personality");
    expect(
      screen.getByRole("link", { name: "どこまで知ってる？" }),
    ).toHaveAttribute("href", "#knowledge");
    expect(screen.getByRole("link", { name: "毎日のパズル" })).toHaveAttribute(
      "href",
      "#game",
    );
  });

  // テスト7: アクティブタブに aria-current="true" が付与されること（アクセシビリティ）
  it("アクティブタブに aria-current='true' が付与されること", () => {
    render(<CategoryNav categories={CATEGORIES} />);

    act(() => {
      observerCallback?.([makeEntry("personality", true)]);
    });

    const personalityLink = screen.getByRole("link", {
      name: "あなたはどのタイプ？",
    });
    expect(personalityLink).toHaveAttribute("aria-current", "true");

    // 非アクティブタブには aria-current が付与されないこと
    const fortuneLink = screen.getByRole("link", { name: "今日の運勢" });
    expect(fortuneLink).not.toHaveAttribute("aria-current");
  });
});
