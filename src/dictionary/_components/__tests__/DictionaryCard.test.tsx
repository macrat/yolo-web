import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import DictionaryCard from "../DictionaryCard";

test("renders kanji card with character and meanings", () => {
  render(
    <DictionaryCard
      type="kanji"
      character="山"
      readings={["サン", "やま"]}
      meanings={["mountain"]}
      category="自然"
    />,
  );
  expect(screen.getByText("山")).toBeInTheDocument();
  expect(screen.getByText("mountain")).toBeInTheDocument();
  expect(screen.getByText("サン・やま")).toBeInTheDocument();
  expect(screen.getByText("自然")).toBeInTheDocument();
});

test("renders yoji card with yoji and meaning", () => {
  render(
    <DictionaryCard
      type="yoji"
      yoji="一期一会"
      reading="いちごいちえ"
      meaning="一生に一度の出会いを大切にすること"
      category="人生"
      difficultyLabel="初級"
    />,
  );
  expect(screen.getByText("一期一会")).toBeInTheDocument();
  expect(screen.getByText("いちごいちえ")).toBeInTheDocument();
  expect(screen.getByText("人生")).toBeInTheDocument();
  expect(screen.getByText("初級")).toBeInTheDocument();
});

test("kanji card links to correct detail page", () => {
  render(
    <DictionaryCard
      type="kanji"
      character="山"
      readings={["サン"]}
      meanings={["mountain"]}
      category="自然"
    />,
  );
  const link = screen.getByTestId("dictionary-card");
  expect(link).toHaveAttribute("href", "/dictionary/kanji/%E5%B1%B1");
});

test("yoji card links to correct detail page", () => {
  render(
    <DictionaryCard
      type="yoji"
      yoji="一期一会"
      reading="いちごいちえ"
      meaning="一生に一度の出会いを大切にすること"
      category="人生"
    />,
  );
  const link = screen.getByTestId("dictionary-card");
  expect(link).toHaveAttribute(
    "href",
    "/dictionary/yoji/%E4%B8%80%E6%9C%9F%E4%B8%80%E4%BC%9A",
  );
});
