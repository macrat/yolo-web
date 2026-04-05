import { describe, test, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import GameContainer from "../GameContainer";
import type { YojiQuizEntry } from "@/play/games/yoji-doru/_lib/quiz";

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

// テスト用の最小データ（不要フィールドなし）
const testData: YojiQuizEntry[] = [
  {
    yoji: "一期一会",
    reading: "いちごいちえ",
    meaning: "一生に一度の出会いを大切にすること",
    category: "life",
    origin: "日本",
    example: "例文",
  },
  {
    yoji: "一日一善",
    reading: "いちにちいちぜん",
    meaning: "毎日一つの善行をすること",
    category: "life",
    origin: "日本",
    example: "例文",
  },
  {
    yoji: "花鳥風月",
    reading: "かちょうふうげつ",
    meaning: "自然の美しい景色や風物のこと",
    category: "nature",
    origin: "中国",
    example: "例文",
  },
  {
    yoji: "以心伝心",
    reading: "いしんでんしん",
    meaning: "言葉を使わずに心が通じ合うこと",
    category: "life",
    origin: "仏教",
    example: "例文",
  },
];

describe("GameContainer", () => {
  test("マウント後に問題が表示されること", async () => {
    await act(async () => {
      render(<GameContainer data={testData} />);
    });

    // 問題の説明文が表示されていること
    expect(screen.getByText("この意味の四字熟語はどれ？")).toBeInTheDocument();
  });

  test("マウント後に4つの選択肢が表示されること", async () => {
    await act(async () => {
      render(<GameContainer data={testData} />);
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
      render(<GameContainer data={testData} />);
    });

    // 問題エリアが表示されていること
    const questionRegion = screen.getByRole("region", { name: "問題" });
    expect(questionRegion).toBeInTheDocument();
  });

  test("コンポーネントがuseEffectでquestionを初期化すること（ハイドレーション安全）", async () => {
    // useEffectが実行されてからquestionが設定されるため、
    // マウント後に問題が表示されることが保証される
    let container: HTMLElement;
    await act(async () => {
      const result = render(<GameContainer data={testData} />);
      container = result.container;
    });

    // useEffect実行後に選択肢ボタンが4つ表示される
    const buttons = container!.querySelectorAll("button[type='button']");
    // 「もう1問」ボタンは回答前は表示されないので、選択肢4つのみ
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  test("選択肢をクリックすると回答フィードバックが表示されること", async () => {
    await act(async () => {
      render(<GameContainer data={testData} />);
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
});
