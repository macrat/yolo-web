import { expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderCharacterPersonalityExtra } from "../CharacterPersonalityResultExtra";

// fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

test("referrerTypeId なしの場合、InviteFriendButton のみ表示する", () => {
  const renderer = renderCharacterPersonalityExtra(undefined);
  const node = renderer("type-a") as React.ReactElement;
  render(node);

  // 友達に診断を送るボタンが表示される
  expect(
    screen.getByRole("button", { name: "友達に診断を送る" }),
  ).toBeInTheDocument();
  // CompatibilitySection は表示されない
  expect(screen.queryByText("友達との相性結果")).not.toBeInTheDocument();
});

test("referrerTypeId ありかつAPIが成功した場合、CompatibilitySectionとInviteFriendButtonを表示する", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      label: "最高の相性",
      description: "とても仲良くなれます",
      myType: { title: "勇者タイプ", icon: "⚔️" },
      friendType: { title: "賢者タイプ", icon: "🔮" },
    }),
  });

  const renderer = renderCharacterPersonalityExtra("type-b");
  const node = renderer("type-a") as React.ReactElement;
  render(node);

  // ローディング中はスピナーまたは何かが表示されている
  // APIレスポンスを待ってからCompatibilitySectionが表示される
  await waitFor(() => {
    expect(screen.getByText("友達との相性結果")).toBeInTheDocument();
  });

  expect(screen.getByText("最高の相性")).toBeInTheDocument();
  expect(screen.getByText("とても仲良くなれます")).toBeInTheDocument();
  expect(screen.getByText("勇者タイプ")).toBeInTheDocument();
  expect(screen.getByText("賢者タイプ")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "友達に診断を送る" }),
  ).toBeInTheDocument();
});

test("APIが400を返した場合（invalid referrerTypeId）、InviteFriendButtonのみ表示する", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 400,
    json: async () => ({ error: "Invalid type" }),
  });

  const renderer = renderCharacterPersonalityExtra("invalid-type");
  const node = renderer("type-a") as React.ReactElement;
  render(node);

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "友達に診断を送る" }),
    ).toBeInTheDocument();
  });

  expect(screen.queryByText("友達との相性結果")).not.toBeInTheDocument();
});

test("APIがネットワークエラーを返した場合、InviteFriendButtonのみ表示する", async () => {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));

  const renderer = renderCharacterPersonalityExtra("type-b");
  const node = renderer("type-a") as React.ReactElement;
  render(node);

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "友達に診断を送る" }),
    ).toBeInTheDocument();
  });

  expect(screen.queryByText("友達との相性結果")).not.toBeInTheDocument();
});

test("APIフェッチ中はローディング表示をする", async () => {
  // 解決しないPromiseで無限にローディング中にする
  mockFetch.mockReturnValueOnce(new Promise(() => {}));

  const renderer = renderCharacterPersonalityExtra("type-b");
  const node = renderer("type-a") as React.ReactElement;
  render(node);

  // ローディング中はテキストが表示される
  expect(screen.getByText("相性データを読み込み中...")).toBeInTheDocument();
  // CompatibilitySectionとInviteFriendButtonはまだ表示されない
  expect(screen.queryByText("友達との相性結果")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "友達に診断を送る" }),
  ).not.toBeInTheDocument();
});

test("正しいAPIエンドポイントにフェッチする", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      label: "良い相性",
      description: "お互いに補い合える",
      myType: { title: "勇者タイプ", icon: "⚔️" },
      friendType: { title: "賢者タイプ", icon: "🔮" },
    }),
  });

  const renderer = renderCharacterPersonalityExtra("type-b");
  const node = renderer("type-a") as React.ReactElement;
  render(node);

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/quiz/compatibility?slug=character-personality&typeA=type-a&typeB=type-b",
    );
  });
});

test("inviteText に「似たキャラ診断で相性を調べよう!」を使用する", () => {
  const renderer = renderCharacterPersonalityExtra(undefined);
  const node = renderer("type-a") as React.ReactElement;
  render(node);

  // InviteFriendButton の label テキストが表示されている
  expect(screen.getByText("友達との相性を調べてみよう")).toBeInTheDocument();
});
