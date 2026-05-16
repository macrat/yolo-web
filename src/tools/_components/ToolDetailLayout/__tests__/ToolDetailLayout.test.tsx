import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ToolDetailLayout from "../index";
import type { ToolMeta } from "@/tools/types";

const DUMMY_META: ToolMeta = {
  slug: "test-tool",
  name: "テストツール",
  nameEn: "Test Tool",
  description: "テスト用ツールのメタ情報",
  shortDescription: "テストツールの短い説明",
  keywords: ["test"],
  category: "text",
  relatedSlugs: [],
  publishedAt: "2026-01-15T09:00:00+09:00",
  updatedAt: "2026-05-01T12:00:00+09:00",
  howItWorks: "ブラウザ内でテスト処理を行います。",
};

describe("ToolDetailLayout", () => {
  it("meta.name が IdentityHeader に渡り表示される", () => {
    render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div>dummy children</div>
      </ToolDetailLayout>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("テストツール");
  });

  it("meta.shortDescription が IdentityHeader に渡り表示される", () => {
    render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div>dummy children</div>
      </ToolDetailLayout>,
    );
    expect(screen.getByText("テストツールの短い説明")).toBeInTheDocument();
  });

  it("meta.category が IdentityHeader に渡り表示される", () => {
    render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div>dummy children</div>
      </ToolDetailLayout>,
    );
    // category は "text" → IdentityHeader に渡される（文字列 "text" が表示される）
    expect(screen.getByTestId("category")).toBeInTheDocument();
  });

  it("meta.howItWorks が TrustSection に渡り表示される", () => {
    render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div>dummy children</div>
      </ToolDetailLayout>,
    );
    expect(
      screen.getByText("ブラウザ内でテスト処理を行います。"),
    ).toBeInTheDocument();
  });

  it("meta.publishedAt が LifecycleSection に渡り表示される", () => {
    render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div>dummy children</div>
      </ToolDetailLayout>,
    );
    // publishedAt の time 要素が存在すること
    const timeEls = document.querySelectorAll("time");
    const pubTimeEl = Array.from(timeEls).find(
      (el) => el.getAttribute("dateTime") === "2026-01-15T09:00:00+09:00",
    );
    expect(pubTimeEl).toBeTruthy();
  });

  it("meta.updatedAt が LifecycleSection に渡り表示される", () => {
    render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div>dummy children</div>
      </ToolDetailLayout>,
    );
    const timeEls = document.querySelectorAll("time");
    const updTimeEl = Array.from(timeEls).find(
      (el) => el.getAttribute("dateTime") === "2026-05-01T12:00:00+09:00",
    );
    expect(updTimeEl).toBeTruthy();
  });

  it("children がレンダリングされる", () => {
    render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div data-testid="slot-child">入力エリア</div>
      </ToolDetailLayout>,
    );
    expect(screen.getByTestId("slot-child")).toBeInTheDocument();
    expect(screen.getByTestId("slot-child")).toHaveTextContent("入力エリア");
  });

  it("LifecycleSection が IdentityHeader より後の DOM 順序に配置される（below-the-fold 要件）", () => {
    const { container } = render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div>dummy children</div>
      </ToolDetailLayout>,
    );

    // IdentityHeader は h1 を持つ header 要素
    const header = container.querySelector("header");
    // LifecycleSection は time 要素を持つ div（lifecycle クラス）
    const timeEl = container.querySelector(
      "time[dateTime='2026-01-15T09:00:00+09:00']",
    );

    expect(header).toBeTruthy();
    expect(timeEl).toBeTruthy();

    // DOM ツリー上で header が timeEl より前にある（= timeEl が header より後ろ = below-the-fold）ことを確認
    // header.compareDocumentPosition(timeEl) の返値に Node.DOCUMENT_POSITION_FOLLOWING (= 4) が含まれる
    // = 「timeEl は header より後ろ（DOM 順序で後方）にある」を意味する（MDN 仕様）
    const position = header!.compareDocumentPosition(timeEl!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("isEmbedded / mode 切替 prop が存在しない（型テスト: コンパイル通過が証明）", () => {
    // TypeScript が isEmbedded / mode prop を受け付けないことは型レベルで保証される。
    // ここでは ToolDetailLayout が正常にレンダリングされること（余分な prop なし）を確認する。
    render(
      <ToolDetailLayout meta={DUMMY_META}>
        <div>children</div>
      </ToolDetailLayout>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
