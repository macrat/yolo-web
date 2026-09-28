import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import PhrasedText, {
  phrasedNameText,
  renderPhrasedName,
} from "@/components/PhrasedText";
import styles from "@/components/PhrasedText/PhrasedText.module.css";
import { joinDashes } from "@/lib/phrase-dashes";

const phrases = ["「よし行くぞ！」と", "叫んで", "3秒後に", "空を"];
const text = phrases.join("");

describe("PhrasedText", () => {
  test("見出しの中の要素は文節のあいだの <wbr> だけで、字を分ける要素を持たない", () => {
    render(<PhrasedText as="h2" phrases={phrases} />);
    const heading = screen.getByRole("heading", { level: 2 });
    const elements = [...heading.children];
    expect(elements.map((element) => element.tagName)).toEqual([
      "WBR",
      "WBR",
      "WBR",
    ]);
    expect(heading.querySelectorAll("span")).toHaveLength(0);
  });

  test("見出しの文と読み上げの名前は元の文と一字も違わない", () => {
    render(<PhrasedText as="h1" phrases={phrases} />);
    const heading = screen.getByRole("heading", { level: 1, name: text });
    expect(heading.textContent).toBe(text);
  });

  test("<wbr> は文節のあいだにだけ置き、文の頭と終わりに置かない", () => {
    render(<PhrasedText as="h2" phrases={phrases} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.firstChild?.nodeName).toBe("#text");
    expect(heading.lastChild?.nodeName).toBe("#text");
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  });

  test("文節が1つなら <wbr> を持たない", () => {
    render(<PhrasedText as="h3" phrases={["博士"]} />);
    expect(screen.getByRole("heading", { level: 3 }).innerHTML).toBe("博士");
  });

  test("渡したクラスと属性を要素に付け、文節で折るクラスも保つ", () => {
    render(
      <PhrasedText
        as="h2"
        phrases={phrases}
        className="title"
        id="result-title"
        data-heading-font="fallback"
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("title");
    expect(heading.classList).toHaveLength(2);
    expect(heading).toHaveAttribute("id", "result-title");
    expect(heading).toHaveAttribute("data-heading-font", "fallback");
  });

  test("見出しの外の要素も、文節のあいだの <wbr> と文節で折るクラスで組む", () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <PhrasedText as="td" phrases={["生年月日を", "入れる"]} />
          </tr>
        </tbody>
      </table>,
    );
    const cell = container.querySelector("td")!;
    expect(cell.innerHTML).toBe("生年月日を<wbr>入れる");
    expect(cell).toHaveClass(styles.phrased);
    render(<PhrasedText as="span" phrases={phrases} data-testid="name" />);
    const span = screen.getByTestId("name");
    expect(span.innerHTML).toBe(phrases.join("<wbr>"));
    expect(span).toHaveClass(styles.phrased);
  });

  test("文節で折るクラスは語の中で折らず、はみ出すときだけ折り、行頭の禁則を厳しい側で組む", () => {
    const css = readFileSync(
      resolve(__dirname, "../PhrasedText.module.css"),
      "utf-8",
    );
    const rule = css.match(/\.phrased\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/word-break\s*:\s*keep-all/);
    expect(rule).toMatch(/overflow-wrap\s*:\s*anywhere/);
    expect(rule).toMatch(/line-break\s*:\s*strict/);
    expect(rule).not.toMatch(/auto-phrase/);
  });

  test("見出しの外の要素でも、ダッシュを見出しと同じ joinDashes で組む", () => {
    const dashed = ["効かない --", "CSS ── 前", "後"];
    const { container } = render(
      <>
        <PhrasedText as="h2" phrases={dashed} />
        <PhrasedText as="span" phrases={dashed} />
      </>,
    );
    const expected = dashed.map(joinDashes).join("");
    expect(container.querySelector("h2")!.textContent).toBe(expected);
    expect(container.querySelector("span")!.textContent).toBe(expected);
  });

  test("ダッシュの前の空白を折れない空白にし、ダッシュだけの行を作らない", () => {
    render(
      <PhrasedText
        as="h2"
        phrases={["Cron式 早見表 — フィールド・", "一覧"]}
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.innerHTML).toBe(
      "Cron式 早見表\u00A0— フィールド・<wbr>一覧".replace("\u00A0", "&nbsp;"),
    );
  });

  test("空白の無いダッシュと「--」を前の字に付け、ダッシュの中で折らない", () => {
    render(
      <PhrasedText
        as="h2"
        phrases={["ガイド──シェア", "効かない --", "CSS"]}
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe(
      "ガイド\u2060─\u2060─シェア効かない\u00A0-\u2060-CSS",
    );
  });
});

describe("renderPhrasedName", () => {
  test("区切りの並びは PhrasedText の span で文節で折って組む", () => {
    const { container } = render(
      <label>{renderPhrasedName(["生年月日", "（必須）"])}</label>,
    );
    const span = container.querySelector("label > span")!;
    expect(span).toHaveClass(styles.phrased);
    expect(span.innerHTML).toBe("生年月日<wbr>（必須）");
  });

  test("文字列と要素は区切らずにそのまま組む", () => {
    const { container } = render(
      <>
        <label>{renderPhrasedName("名前")}</label>
        <label>{renderPhrasedName(<b>太字</b>)}</label>
      </>,
    );
    const [plain, element] = container.querySelectorAll("label");
    expect(plain.innerHTML).toBe("名前");
    expect(element.innerHTML).toBe("<b>太字</b>");
  });

  test("クラスを渡すと、区切りの並びは PhrasedText に、ほかは包む span に付ける", () => {
    const { container } = render(
      <>
        <p>{renderPhrasedName(["カテゴリから", "探す"], "label")}</p>
        <p>{renderPhrasedName("目次", "label")}</p>
      </>,
    );
    const [phrased, plain] = container.querySelectorAll("p");
    expect(phrased.innerHTML).toBe(
      `<span class="${styles.phrased} label">カテゴリから<wbr>探す</span>`,
    );
    expect(plain.innerHTML).toBe('<span class="label">目次</span>');
  });
});

describe("phrasedNameText", () => {
  test("区切りの並びは1続きの文にし、文字列はそのまま返す", () => {
    expect(phrasedNameText(["品質の", "目安"])).toBe("品質の目安");
    expect(phrasedNameText("品質")).toBe("品質");
  });
});
