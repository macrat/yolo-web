import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import WordJoinerCopyFilter, {
  removeWordJoinersFromCopy,
} from "@/components/WordJoinerCopyFilter";
import PhrasedText from "@/components/PhrasedText";
import { WORD_JOINER } from "@/lib/phrase-dashes";

const WJ = WORD_JOINER;
const NBSP = "\u00A0";

/** コピーの出来事。jsdom は ClipboardEvent を持たないので Event で代える。 */
function copyEvent(): Event {
  return new Event("copy", { bubbles: true, cancelable: true });
}

/** 要素の中身の全体を選ぶ。 */
function selectContents(node: Node): void {
  const range = document.createRange();
  range.selectNodeContents(node);
  const selection = document.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}

/** 選択の両端。 */
function selectionEnds(): [Node | null, number, Node | null, number] {
  const selection = document.getSelection()!;
  return [
    selection.anchorNode,
    selection.anchorOffset,
    selection.focusNode,
    selection.focusOffset,
  ];
}

/** 写さない字（`user-select: none` の要素の中と、描かれない要素の中）か。 */
function isUncopied(text: Text): boolean {
  if (text.parentElement?.closest("script, style, template, noscript")) {
    return true;
  }
  for (
    let element = text.parentElement;
    element;
    element = element.parentElement
  ) {
    if (element.style.getPropertyValue("user-select") === "none") return true;
  }
  return false;
}

/**
 * いまの選択からブラウザが写す字。jsdom はブラウザのコピーを持たないので、選んだ範囲の字の節の字を、ブラウザと
 * 同じく写さない字を除いてつなぐ。
 */
function copiedText(): string {
  const selection = document.getSelection()!;
  let copied = "";
  for (let index = 0; index < selection.rangeCount; index++) {
    const range = selection.getRangeAt(index);
    const root = range.commonAncestorContainer;
    const texts: Text[] = [];
    if (root instanceof Text) {
      texts.push(root);
    } else {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (range.intersectsNode(node)) texts.push(node as Text);
      }
    }
    for (const text of texts) {
      if (isUncopied(text)) continue;
      const start = text === range.startContainer ? range.startOffset : 0;
      const end = text === range.endContainer ? range.endOffset : text.length;
      copied += text.data.slice(start, end);
    }
  }
  return copied;
}

/**
 * コピーを起こし、ブラウザが写す時点（受け手のあと）の、写す字と文書の字を返す。受け手のあとに走る受け手で読む。
 */
function copyFrom(target: EventTarget): { copied: string; body: string } {
  const seen = { copied: "", body: "" };
  const readAtCopy = () => {
    seen.copied = copiedText();
    seen.body = document.body.textContent ?? "";
  };
  document.addEventListener("copy", readAtCopy);
  target.dispatchEvent(copyEvent());
  document.removeEventListener("copy", readAtCopy);
  return seen;
}

const ARTICLE_HEAD = [
  `<nav><a href="/">トップ</a><span style="user-select: none">/</span><a href="/blog">ブログ</a></nav>`,
  `<h1>Next.js<wbr>複数root layoutで<wbr> not-${WJ}found.tsx が<wbr>効かない${NBSP}-${WJ}- global-${WJ}not-${WJ}found.js での<wbr>解決</h1>`,
  `<script type="application/json">{"headline":"not-${WJ}found"}</script>`,
  `<h2 hidden>目次</h2>`,
  `<p>最初の段落は <a href="/blog/category/dev-notes">開発ノート</a> と <a href="#まとめ">まとめ</a> へ。</p>`,
].join("");

beforeEach(() => {
  vi.useFakeTimers();
  document.addEventListener("copy", removeWordJoinersFromCopy);
});

afterEach(() => {
  document.removeEventListener("copy", removeWordJoinersFromCopy);
  document.getSelection()?.removeAllRanges();
  vi.restoreAllMocks();
  vi.useRealTimers();
  cleanup();
  document.body.innerHTML = "";
});

describe("removeWordJoinersFromCopy", () => {
  test("見出しだけを選ぶと、写す字に語結合子が無く、文書の字は変わらず、写したあとに元の節と選択に戻る", () => {
    document.body.innerHTML = ARTICLE_HEAD;
    const heading = document.querySelector("h1")!;
    const original = heading.innerHTML;
    const originalBody = document.body.textContent;
    selectContents(heading);
    const ends = selectionEnds();

    const seen = copyFrom(heading);
    expect(seen.copied).toBe(
      `Next.js複数root layoutで not-found.tsx が効かない${NBSP}-- global-not-found.js での解決`,
    );
    // 語結合子は文書に残るので、行の組みは変わらない
    expect(seen.body).toBe(originalBody);

    vi.runAllTimers();
    expect(heading.innerHTML).toBe(original);
    expect(selectionEnds()).toEqual(ends);
  });

  test("見出しから段落のリンクまでを選んでも、要素と属性はそのままで、語結合子だけを写さない", () => {
    document.body.innerHTML = ARTICLE_HEAD;
    const heading = document.querySelector("h1")!;
    const paragraph = document.querySelector("p")!;
    const original = document.body.innerHTML;
    const range = document.createRange();
    range.setStartBefore(heading.firstChild!);
    range.setEnd(paragraph, paragraph.childNodes.length);
    document.getSelection()!.addRange(range);
    const ends = selectionEnds();

    const seen = copyFrom(heading);
    expect(seen.copied).not.toContain(WJ);
    expect(seen.copied).toContain("最初の段落は 開発ノート と まとめ へ。");
    // ブラウザが写すのは文書そのものなので、リンクの href・script・隠れた要素・写さない区切りは文書のまま残る
    expect(document.querySelectorAll("a[href]")).toHaveLength(4);
    expect(document.querySelector("script")).not.toBeNull();
    expect(document.querySelector("h2")!.hidden).toBe(true);

    vi.runAllTimers();
    expect(document.body.innerHTML).toBe(original);
    expect(selectionEnds()).toEqual(ends);
  });

  test("ページの全体（Ctrl+A）を選んでも、写す字に語結合子が無く、描かれない要素の字には触れず、写したあとに元に戻る", () => {
    document.body.innerHTML = ARTICLE_HEAD;
    const original = document.body.innerHTML;
    const script = document.querySelector("script")!;
    const scriptText = script.innerHTML;
    selectContents(document.body);
    const ends = selectionEnds();

    let scriptAtCopy = "";
    const readScript = () => {
      scriptAtCopy = script.innerHTML;
    };
    document.addEventListener("copy", readScript);
    const seen = copyFrom(document.body);
    document.removeEventListener("copy", readScript);
    expect(seen.copied).not.toContain(WJ);
    expect(scriptAtCopy).toBe(scriptText);

    vi.runAllTimers();
    expect(document.body.innerHTML).toBe(original);
    expect(selectionEnds()).toEqual(ends);
  });

  test("戻す前に次のコピーが来ても、どちらも語結合子の無い字を写し、写したあとに元の節と選択に戻る", () => {
    document.body.innerHTML = ARTICLE_HEAD;
    const heading = document.querySelector("h1")!;
    const original = heading.innerHTML;
    selectContents(heading);
    const ends = selectionEnds();

    const first = copyFrom(heading);
    const second = copyFrom(heading);
    expect(first.copied).not.toContain(WJ);
    expect(second.copied).toBe(first.copied);

    vi.runAllTimers();
    expect(heading.innerHTML).toBe(original);
    expect(selectionEnds()).toEqual(ends);
  });

  test("選択の端が語結合子の後ろにあっても、写したあとに同じ位置に戻る", () => {
    document.body.innerHTML = `<h1>JSON-${WJ}LD と not-${WJ}found</h1>`;
    const text = document.querySelector("h1")!.firstChild!;
    const range = document.createRange();
    range.setStart(text, "JSON-".length + 1);
    range.setEnd(text, `JSON-${WJ}LD と not-${WJ}`.length);
    document.getSelection()!.addRange(range);

    const setBaseAndExtent = vi.spyOn(
      document.getSelection()!,
      "setBaseAndExtent",
    );

    const seen = copyFrom(text);
    expect(seen.copied).toBe("LD と not-");

    vi.runAllTimers();
    expect(setBaseAndExtent).toHaveBeenCalledTimes(2);
    expect(selectionEnds()).toEqual([
      text,
      "JSON-".length + 1,
      text,
      `JSON-${WJ}LD と not-${WJ}`.length,
    ]);
  });

  test("選択の端が子の並びの途中にあっても、分けたあとの同じ位置まで写し、写したあとに元の端に戻る", () => {
    document.body.innerHTML = `<h1>a-${WJ}b<wbr>c-${WJ}d<wbr>e-${WJ}f</h1>`;
    const heading = document.querySelector("h1")!;
    const original = heading.innerHTML;
    const range = document.createRange();
    range.setStart(heading, 0);
    range.setEnd(heading, 3);
    document.getSelection()!.addRange(range);

    expect(copyFrom(heading).copied).toBe("a-bc-d");

    vi.runAllTimers();
    expect(heading.innerHTML).toBe(original);
    expect(selectionEnds()).toEqual([heading, 0, heading, 3]);
  });

  test("分けた節に端の無い選択（Ctrl+A など）は、置き直さない", () => {
    document.body.innerHTML = ARTICLE_HEAD;
    selectContents(document.body);
    const ends = selectionEnds();
    const setBaseAndExtent = vi.spyOn(
      document.getSelection()!,
      "setBaseAndExtent",
    );

    copyFrom(document.body);
    vi.runAllTimers();

    expect(setBaseAndExtent).not.toHaveBeenCalled();
    expect(selectionEnds()).toEqual(ends);
  });

  test("選んだ範囲にかからない字の語結合子には触れない", () => {
    document.body.innerHTML = `<h1>a-${WJ}b</h1><p>c-${WJ}d</p>`;
    selectContents(document.querySelector("p")!);
    const heading = document.querySelector("h1")!;

    let headingAtCopy = "";
    const readAtCopy = () => {
      headingAtCopy = heading.innerHTML;
    };
    document.addEventListener("copy", readAtCopy);
    document.querySelector("p")!.dispatchEvent(copyEvent());
    document.removeEventListener("copy", readAtCopy);

    expect(headingAtCopy).toBe(`a-${WJ}b`);
  });

  test("語結合子の無い選択では、文書にも選択にも触れない", () => {
    document.body.innerHTML = "<p>not-found.tsx</p>";
    const paragraph = document.querySelector("p")!;
    selectContents(paragraph);
    const text = paragraph.firstChild!;
    const splitText = vi.spyOn(text as Text, "splitText");

    copyFrom(paragraph);
    expect(splitText).not.toHaveBeenCalled();
  });

  test.each([
    ["textarea", "<textarea></textarea>"],
    ["input", "<input>"],
    ["contenteditable", `<div contenteditable="true">e-${WJ}f</div>`],
  ])(
    "%s の中のコピーは、語結合子があってもブラウザのコピーのままにする",
    (_, field) => {
      document.body.innerHTML = `<p>a-${WJ}b</p>${field}`;
      selectContents(document.querySelector("p")!);
      const target = document.body.lastElementChild as HTMLElement;
      // jsdom は contenteditable を解さないので、ブラウザと同じく書ける要素として扱わせる
      Object.defineProperty(target, "isContentEditable", {
        value: target.hasAttribute("contenteditable"),
      });

      const seen = copyFrom(target);
      expect(seen.copied).toBe(`a-${WJ}b`);
    },
  );

  test("戻す前に React が字を描き替えた節は、描き替えた字のままにする", () => {
    const { container, rerender } = render(
      <PhrasedText as="h1" phrases={["JSON-LD の", "組み方"]} />,
    );
    const heading = container.querySelector("h1")!;
    selectContents(heading);

    act(() => {
      heading.dispatchEvent(copyEvent());
      rerender(<PhrasedText as="h1" phrases={["not-found の", "組み方"]} />);
    });
    vi.runAllTimers();

    expect(heading.innerHTML).toBe(`not-${WJ}found の<wbr>組み方`);
  });

  test("写したあとに React が描き替えても、描き替えた字になる", () => {
    const { container, rerender } = render(
      <PhrasedText as="h1" phrases={["JSON-LD の", "組み方"]} />,
    );
    const heading = container.querySelector("h1")!;
    selectContents(heading);
    act(() => {
      heading.dispatchEvent(copyEvent());
    });
    vi.runAllTimers();
    expect(heading.innerHTML).toBe(`JSON-${WJ}LD の<wbr>組み方`);

    rerender(<PhrasedText as="h1" phrases={["not-found の", "組み方"]} />);
    expect(heading.innerHTML).toBe(`not-${WJ}found の<wbr>組み方`);
  });
});

describe("WordJoinerCopyFilter", () => {
  beforeEach(() => {
    document.removeEventListener("copy", removeWordJoinersFromCopy);
  });

  test("置いているあいだだけ、ページのコピーに語結合子を入れない", () => {
    const { unmount } = render(<WordJoinerCopyFilter />);
    const heading = document.createElement("h1");
    heading.textContent = `JSON-${WJ}LD`;
    document.body.append(heading);
    selectContents(heading);

    expect(copyFrom(heading).copied).toBe("JSON-LD");
    vi.runAllTimers();

    unmount();
    expect(copyFrom(heading).copied).toBe(`JSON-${WJ}LD`);
  });

  test("何も描かない", () => {
    const { container } = render(<WordJoinerCopyFilter />);
    expect(container.innerHTML).toBe("");
  });
});
