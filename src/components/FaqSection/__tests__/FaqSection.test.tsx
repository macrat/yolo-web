import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import FaqSection from "@/components/FaqSection";
import type { FaqEntry } from "@/lib/seo";

const sampleFaq: FaqEntry[] = [
  { question: "テスト質問1", answer: "テスト回答1" },
  { question: "テスト質問2", answer: "テスト回答2" },
];

describe("FaqSection", () => {
  // --- レンダリング ---

  test("faq が undefined のとき null を返す（何も描画しない）", () => {
    const { container } = render(<FaqSection faq={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  test("faq が空配列のとき null を返す（何も描画しない）", () => {
    const { container } = render(<FaqSection faq={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("faq がある場合に section が描画される", () => {
    render(<FaqSection faq={sampleFaq} />);
    expect(screen.getByRole("region", { name: "FAQ" })).toBeInTheDocument();
  });

  test("見出し「よくある質問」が表示される", () => {
    render(<FaqSection faq={sampleFaq} />);
    expect(
      screen.getByRole("heading", { name: "よくある質問" }),
    ).toBeInTheDocument();
  });

  test("各 FAQ エントリの質問テキストが描画される", () => {
    render(<FaqSection faq={sampleFaq} />);
    expect(screen.getByText("テスト質問1")).toBeInTheDocument();
    expect(screen.getByText("テスト質問2")).toBeInTheDocument();
  });

  test("各 FAQ エントリの回答テキストが描画される", () => {
    render(<FaqSection faq={sampleFaq} />);
    expect(screen.getByText("テスト回答1")).toBeInTheDocument();
    expect(screen.getByText("テスト回答2")).toBeInTheDocument();
  });

  test("FAQ エントリの数に応じた <details> 要素が生成される", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const details = container.querySelectorAll("details");
    expect(details).toHaveLength(2);
  });

  test("各 <details> に <summary> が存在する", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const summaries = container.querySelectorAll("summary");
    expect(summaries).toHaveLength(2);
  });

  // --- JSON-LD ---

  test("FAQPage JSON-LD script が出力される", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent ?? "");
    expect(parsed["@type"]).toBe("FAQPage");
  });

  test("JSON-LD の mainEntity に FAQ エントリが含まれる", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    const parsed = JSON.parse(script!.textContent ?? "");
    expect(parsed.mainEntity).toHaveLength(2);
    expect(parsed.mainEntity[0]["@type"]).toBe("Question");
    expect(parsed.mainEntity[0].name).toBe("テスト質問1");
    expect(parsed.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    expect(parsed.mainEntity[0].acceptedAnswer.text).toBe("テスト回答1");
  });

  test("JSON-LD に @context が含まれる", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    const parsed = JSON.parse(script!.textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
  });

  test("質問の行がアコーディオンの summary で、質問の文を持つ", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const summaries = container.querySelectorAll("summary");
    expect(summaries[0]).toHaveTextContent("テスト質問1");
    expect(summaries[1]).toHaveTextContent("テスト質問2");
  });
});
