import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import KeigoReferenceTile from "../Tile";

// next/link をモック: テスト環境で実際のルーティングは不要
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("KeigoReferenceTile — 軽量版タイルの描画", () => {
  test("空状態でも描画される（input と 3 カテゴリチップが見える）", () => {
    render(<KeigoReferenceTile slug="keigo-reference" />);

    // 検索ボックスが存在する
    expect(screen.getByRole("searchbox")).toBeInTheDocument();

    // 主要カテゴリチップ 3 つが見える。
    // ラベルは logic.ts の getKeigoCategories() が返す name を SSoT とする。
    // 重要-2: TILE_CATEGORIES は getKeigoCategories() で取得するため、
    // ここのラベルも logic.ts の KEIGO_CATEGORIES.name と一致させる。
    // カテゴリチップは role="radio" なので getByRole("radio", ...) で取得する。
    expect(screen.getByRole("radio", { name: "基本動詞" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "ビジネス" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "接客・サービス" }),
    ).toBeInTheDocument();
  });

  test("検索ボックスに「言う」と入力すると候補に「言う」が現れる", () => {
    render(<KeigoReferenceTile slug="keigo-reference" />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "言う" } });

    // 「言う」が候補リストに表示される
    expect(screen.getByText("言う")).toBeInTheDocument();
  });

  test("「基本動詞」チップをクリックすると基本動詞カテゴリの候補が表示される", () => {
    render(<KeigoReferenceTile slug="keigo-reference" />);

    const basicButton = screen.getByRole("radio", { name: "基本動詞" });
    fireEvent.click(basicButton);

    // 基本動詞カテゴリの代表的な動詞が表示される
    expect(screen.getByText("行く")).toBeInTheDocument();
  });

  test("候補をクリックすると尊敬語/謙譲語/丁寧語が展開表示される", () => {
    render(<KeigoReferenceTile slug="keigo-reference" />);

    // 「基本動詞」カテゴリを選択して動詞候補を表示
    const basicButton = screen.getByRole("radio", { name: "基本動詞" });
    fireEvent.click(basicButton);

    // 「言う」をクリック
    const iuButton = screen.getByText("言う");
    fireEvent.click(iuButton);

    // 尊敬語・謙譲語・丁寧語のラベルが展開表示される
    expect(screen.getByText("尊敬語")).toBeInTheDocument();
    expect(screen.getByText("謙譲語")).toBeInTheDocument();
    expect(screen.getByText("丁寧語")).toBeInTheDocument();

    // 言うの尊敬語「おっしゃる」が表示される
    expect(screen.getByText(/おっしゃる/)).toBeInTheDocument();
  });

  test("「詳細を開く」リンクが /tools/keigo-reference を指す", () => {
    render(<KeigoReferenceTile slug="keigo-reference" />);

    const detailLink = screen.getByRole("link", { name: /詳細を開く/ });
    expect(detailLink).toHaveAttribute("href", "/tools/keigo-reference");
  });

  test("カテゴリ選択後に検索しても両方が AND 絞り込みとして機能する", () => {
    render(<KeigoReferenceTile slug="keigo-reference" />);

    // 「基本動詞」チップを選択
    const basicButton = screen.getByRole("radio", { name: "基本動詞" });
    fireEvent.click(basicButton);

    // 検索ボックスに「言う」を入力
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "言う" } });

    // 「言う」は基本動詞カテゴリに存在するため AND 絞り込みで表示される
    expect(screen.getByText("言う")).toBeInTheDocument();

    // 「ビジネス」カテゴリに切り替えると「言う」は基本動詞なので表示されなくなる
    const bizButton = screen.getByRole("radio", { name: "ビジネス" });
    fireEvent.click(bizButton);

    // 「言う」はビジネスカテゴリに存在しないため候補に表示されない
    expect(screen.queryByText("言う")).not.toBeInTheDocument();
    // 検索クエリがリセットされていないことを確認（input の値が維持される）
    expect(searchInput).toHaveValue("言う");
  });
});
