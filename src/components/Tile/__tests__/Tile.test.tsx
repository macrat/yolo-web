import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Tile from "../index";

describe("Tile", () => {
  describe("mode='page'（デフォルト）", () => {
    it("Panel クラス（Panel-module含む）が描画される", () => {
      render(<Tile>content</Tile>);
      const el = screen.getByText("content").closest("[class]");
      // CSS Modules で生成されたパネルクラスが存在する
      // Panel の className には "panel" を含むクラス名が付く
      expect(el?.className).toMatch(/panel/i);
    });

    it("children が描画される", () => {
      render(<Tile>hello tile</Tile>);
      expect(screen.getByText("hello tile")).toBeInTheDocument();
    });

    it("section タグ（Panel デフォルト）でレンダリングされる", () => {
      render(<Tile>content</Tile>);
      const el = screen.getByText("content").closest("section");
      expect(el).toBeInTheDocument();
    });
  });

  describe("className の透過", () => {
    it("className が Panel に透過される", () => {
      render(<Tile className="my-class">content</Tile>);
      const el = screen.getByText("content").closest("section");
      expect(el?.className).toContain("my-class");
    });
  });

  describe("as prop の透過", () => {
    it("as='article' で article タグになる", () => {
      render(<Tile as="article">content</Tile>);
      const el = screen.getByText("content").closest("article");
      expect(el).toBeInTheDocument();
    });

    it("as='div' で div タグになる", () => {
      render(<Tile as="div">content</Tile>);
      const el = screen.getByText("content").closest("div");
      // panel クラスが付いている div を特定する
      expect(el?.className).toMatch(/panel/i);
    });
  });

  describe("aria 属性の透過", () => {
    it("aria-label が Panel に透過される", () => {
      render(<Tile aria-label="test region">content</Tile>);
      const el = screen.getByRole("region", { name: "test region" });
      expect(el).toBeInTheDocument();
    });
  });

  describe("padding prop の透過", () => {
    it("padding='comfortable' が Panel に透過される", () => {
      render(<Tile padding="comfortable">content</Tile>);
      const el = screen.getByText("content").closest("section");
      expect(el?.className).toMatch(/comfortable/i);
    });

    it("padding 未指定のとき paddingComfortable クラスが付かない", () => {
      render(<Tile>content</Tile>);
      const el = screen.getByText("content").closest("section");
      expect(el?.className).not.toMatch(/comfortable/i);
    });
  });

  describe("mode='toolbox-view'（stub）", () => {
    it("Panel ラップが壊れない（children が描画される）", () => {
      render(<Tile mode="toolbox-view">toolbox view</Tile>);
      expect(screen.getByText("toolbox view")).toBeInTheDocument();
    });

    it("Panel クラスが付与される", () => {
      render(<Tile mode="toolbox-view">content</Tile>);
      const el = screen.getByText("content").closest("[class]");
      expect(el?.className).toMatch(/panel/i);
    });
  });

  describe("mode='toolbox-edit'（stub）", () => {
    it("Panel ラップが壊れない（children が描画される）", () => {
      render(<Tile mode="toolbox-edit">toolbox edit</Tile>);
      expect(screen.getByText("toolbox edit")).toBeInTheDocument();
    });

    it("Panel クラスが付与される", () => {
      render(<Tile mode="toolbox-edit">content</Tile>);
      const el = screen.getByText("content").closest("[class]");
      expect(el?.className).toMatch(/panel/i);
    });
  });
});
