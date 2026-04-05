import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import GameContainer from "../GameContainer";

// next/link をモック
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

/** テスト用のAPIレスポンスモック */
const mockQuestionResponse = {
  meaning: "一生に一度の出会いを大切にすること",
  choices: ["一期一会", "一日一善", "花鳥風月", "以心伝心"],
  correctAnswer: "一期一会",
  detail: {
    yoji: "一期一会",
    reading: "いちごいちえ",
    meaning: "一生に一度の出会いを大切にすること",
    origin: "日本",
    example: "例文",
  },
};

describe("GameContainer", () => {
  beforeEach(() => {
    // fetch をモックしてAPIレスポンスを返す
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuestionResponse),
      }),
    );
  });

  test("マウント後にAPIを呼び出して問題が表示されること", async () => {
    await act(async () => {
      render(<GameContainer />);
    });

    // 問題の説明文が表示されていること
    expect(screen.getByText("この意味の四字熟語はどれ？")).toBeInTheDocument();
  });

  test("マウント後に4つの選択肢が表示されること", async () => {
    await act(async () => {
      render(<GameContainer />);
    });

    // 選択肢グループが存在すること
    const choicesGroup = screen.getByRole("group", { name: "選択肢" });
    expect(choicesGroup).toBeInTheDocument();

    // 4つのボタンがあること
    const buttons = choicesGroup.querySelectorAll("button");
    expect(buttons).toHaveLength(4);
  });

  test("問題カードが表示されること", async () => {
    await act(async () => {
      render(<GameContainer />);
    });

    // 問題エリアが表示されていること
    const questionRegion = screen.getByRole("region", { name: "問題" });
    expect(questionRegion).toBeInTheDocument();
  });

  test("APIからのデータでuseEffectがquestionを初期化すること", async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<GameContainer />);
      container = result.container;
    });

    // useEffect実行後に選択肢ボタンが4つ表示される
    const buttons = container!.querySelectorAll("button[type='button']");
    // 「もう1問」ボタンは回答前は表示されないので、選択肢4つのみ
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  test("選択肢をクリックすると回答フィードバックが表示されること", async () => {
    await act(async () => {
      render(<GameContainer />);
    });

    // 最初の選択肢ボタンをクリック
    const choicesGroup = screen.getByRole("group", { name: "選択肢" });
    const buttons = choicesGroup.querySelectorAll("button");

    await act(async () => {
      fireEvent.click(buttons[0]!);
    });

    // 正解または不正解のフィードバックが表示される
    const feedback = screen.getByRole("status");
    expect(feedback).toBeInTheDocument();
  });

  test("propsなしでレンダリングできること（data propsを受け取らない）", async () => {
    // propsなしでも問題なくレンダリングできること
    await act(async () => {
      render(<GameContainer />);
    });

    expect(screen.getByText("この意味の四字熟語はどれ？")).toBeInTheDocument();
  });
});
