import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FaqSection from "../FaqSection";

describe("FaqSection", () => {
  const sampleFaq = [
    {
      question: "ひらがな1文字は何バイト？",
      answer: "UTF-8では3バイトです。ASCII文字は1バイト、絵文字は4バイトです。",
    },
    {
      question: "改行コードは文字数に含まれる？",
      answer:
        "はい。改行コードも1文字としてカウントされます。行数は改行の数に基づいて計算しています。",
    },
  ];

  test("renders nothing when faq is undefined", () => {
    const { container } = render(<FaqSection faq={undefined} />);
    expect(container.innerHTML).toBe("");
  });

  test("renders nothing when faq is an empty array", () => {
    const { container } = render(<FaqSection faq={[]} />);
    expect(container.innerHTML).toBe("");
  });

  test("renders questions and answers when faq has data", () => {
    render(<FaqSection faq={sampleFaq} />);
    expect(screen.getByText("ひらがな1文字は何バイト？")).toBeInTheDocument();
    expect(
      screen.getByText(
        "UTF-8では3バイトです。ASCII文字は1バイト、絵文字は4バイトです。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("改行コードは文字数に含まれる？"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "はい。改行コードも1文字としてカウントされます。行数は改行の数に基づいて計算しています。",
      ),
    ).toBeInTheDocument();
  });

  test("section has aria-label='FAQ'", () => {
    render(<FaqSection faq={sampleFaq} />);
    expect(screen.getByRole("region", { name: "FAQ" })).toBeInTheDocument();
  });

  test("uses details/summary tags for each FAQ entry", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const detailsElements = container.querySelectorAll("details");
    expect(detailsElements).toHaveLength(2);
    const summaryElements = container.querySelectorAll("summary");
    expect(summaryElements).toHaveLength(2);
  });
});

describe("FaqSection JSON-LD", () => {
  const sampleFaq = [
    {
      question: "ひらがな1文字は何バイト？",
      answer: "UTF-8では3バイトです。ASCII文字は1バイト、絵文字は4バイトです。",
    },
    {
      question: "改行コードは文字数に含まれる？",
      answer:
        "はい。改行コードも1文字としてカウントされます。行数は改行の数に基づいて計算しています。",
    },
  ];

  test("FAQデータがある場合にJSON-LDのscriptタグが出力される", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const scriptTag = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(scriptTag).not.toBeNull();
  });

  test("JSON-LDにFAQPage typeが含まれる", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const scriptTag = container.querySelector(
      'script[type="application/ld+json"]',
    );
    const jsonLd = JSON.parse(scriptTag?.textContent ?? "{}");
    expect(jsonLd["@type"]).toBe("FAQPage");
  });

  test("JSON-LDのmainEntityにQ&Aデータが含まれる", () => {
    const { container } = render(<FaqSection faq={sampleFaq} />);
    const scriptTag = container.querySelector(
      'script[type="application/ld+json"]',
    );
    const jsonLd = JSON.parse(scriptTag?.textContent ?? "{}");
    expect(jsonLd.mainEntity).toHaveLength(2);
    expect(jsonLd.mainEntity[0].name).toBe("ひらがな1文字は何バイト？");
    expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe(
      "UTF-8では3バイトです。ASCII文字は1バイト、絵文字は4バイトです。",
    );
  });

  test("FAQデータがundefinedの場合はJSON-LDのscriptタグが出力されない", () => {
    const { container } = render(<FaqSection faq={undefined} />);
    const scriptTag = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(scriptTag).toBeNull();
  });

  test("FAQデータが空配列の場合はJSON-LDのscriptタグが出力されない", () => {
    const { container } = render(<FaqSection faq={[]} />);
    const scriptTag = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(scriptTag).toBeNull();
  });
});
