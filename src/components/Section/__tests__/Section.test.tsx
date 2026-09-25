/**
 * Section のテスト。セクションの要素を描くことと、全幅の罫線の組み方（DESIGN.md §5）を見る。
 */
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import postcss from "postcss";
import Section from "..";

/** Section.module.css の中で、セレクタが一致するルールの宣言を集める。 */
function declarationsOf(selector: string): Map<string, string> {
  const css = readFileSync(
    resolve(__dirname, "../Section.module.css"),
    "utf-8",
  );
  const decls = new Map<string, string>();
  postcss.parse(css).walkRules((rule) => {
    if (rule.selector !== selector) return;
    rule.walkDecls((decl) => {
      decls.set(decl.prop, decl.value);
    });
  });
  return decls;
}

describe("Section", () => {
  test("見出しで名前の付いた section を描く", () => {
    render(
      <Section aria-labelledby="first">
        <h2 id="first">見出し</h2>
      </Section>,
    );
    expect(screen.getByRole("region", { name: "見出し" }).tagName).toBe(
      "SECTION",
    );
  });

  test("並んだセクションは兄弟になる", () => {
    const { container } = render(
      <>
        <Section>
          <p>1つ目</p>
        </Section>
        <Section>
          <p>2つ目</p>
        </Section>
      </>,
    );
    const sections = container.querySelectorAll("section");
    expect(sections).toHaveLength(2);
    expect(sections[0].nextElementSibling).toBe(sections[1]);
    expect(sections[0].className).toBe(sections[1].className);
  });

  test("2つ目からのセクションの上に、画面の端まで届く太い罫線を引く", () => {
    const decls = declarationsOf(".section + .section::before");
    expect(decls.get("margin-inline")).toBe("calc(50% - 50vw)");
    expect(decls.get("border-top")).toBe("var(--rule-w) solid var(--rule)");
  });
});
