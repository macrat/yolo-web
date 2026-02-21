import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import type { RangeTuple } from "fuse.js";
import { splitByIndices, HighlightedText } from "../highlightMatches";

describe("splitByIndices", () => {
  test("returns entire text as non-highlighted when indices are empty", () => {
    const result = splitByIndices("hello world", []);
    expect(result).toEqual([{ text: "hello world", highlighted: false }]);
  });

  test("highlights text at the beginning", () => {
    const indices: RangeTuple[] = [[0, 4]];
    const result = splitByIndices("hello world", indices);
    expect(result).toEqual([
      { text: "hello", highlighted: true },
      { text: " world", highlighted: false },
    ]);
  });

  test("highlights text at the end", () => {
    const indices: RangeTuple[] = [[6, 10]];
    const result = splitByIndices("hello world", indices);
    expect(result).toEqual([
      { text: "hello ", highlighted: false },
      { text: "world", highlighted: true },
    ]);
  });

  test("highlights text in the middle", () => {
    const indices: RangeTuple[] = [[2, 4]];
    const result = splitByIndices("hello world", indices);
    expect(result).toEqual([
      { text: "he", highlighted: false },
      { text: "llo", highlighted: true },
      { text: " world", highlighted: false },
    ]);
  });

  test("handles multiple match ranges", () => {
    const indices: RangeTuple[] = [
      [0, 1],
      [6, 10],
    ];
    const result = splitByIndices("hello world", indices);
    expect(result).toEqual([
      { text: "he", highlighted: true },
      { text: "llo ", highlighted: false },
      { text: "world", highlighted: true },
    ]);
  });

  test("handles entire text as a match", () => {
    const indices: RangeTuple[] = [[0, 4]];
    const result = splitByIndices("hello", indices);
    expect(result).toEqual([{ text: "hello", highlighted: true }]);
  });

  test("works with Japanese text", () => {
    const indices: RangeTuple[] = [[0, 1]];
    const result = splitByIndices("漢字カナール", indices);
    expect(result).toEqual([
      { text: "漢字", highlighted: true },
      { text: "カナール", highlighted: false },
    ]);
  });
});

describe("HighlightedText", () => {
  test("renders plain text when indices are empty", () => {
    const { container } = render(
      <HighlightedText text="hello world" indices={[]} />,
    );
    expect(container.textContent).toBe("hello world");
    expect(container.querySelectorAll("mark")).toHaveLength(0);
  });

  test("wraps matched text in <mark> elements", () => {
    const indices: RangeTuple[] = [[0, 4]];
    const { container } = render(
      <HighlightedText text="hello world" indices={indices} />,
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe("hello");
  });

  test("applies className to <mark> elements", () => {
    const indices: RangeTuple[] = [[0, 4]];
    const { container } = render(
      <HighlightedText
        text="hello world"
        indices={indices}
        className="test-highlight"
      />,
    );
    const mark = container.querySelector("mark");
    expect(mark).toHaveClass("test-highlight");
  });

  test("preserves non-matched text as text nodes", () => {
    const indices: RangeTuple[] = [[6, 10]];
    const { container } = render(
      <HighlightedText text="hello world" indices={indices} />,
    );
    // The full text should still be present
    expect(container.textContent).toBe("hello world");
    // Only "world" should be in a mark
    const mark = container.querySelector("mark");
    expect(mark?.textContent).toBe("world");
  });

  test("handles multiple highlights", () => {
    const indices: RangeTuple[] = [
      [0, 1],
      [6, 10],
    ];
    const { container } = render(
      <HighlightedText text="hello world" indices={indices} />,
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe("he");
    expect(marks[1].textContent).toBe("world");
  });
});
