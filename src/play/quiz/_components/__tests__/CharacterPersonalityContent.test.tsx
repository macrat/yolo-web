/**
 * CharacterPersonalityContent コンポーネントのテスト。
 *
 * テスト対象:
 * - archetypeBreakdown / behaviors / characterMessage の3セクション表示
 * - 相性機能エリア（referrerTypeId あり/なし、API成功/失敗）
 * - 小見出しの段（h3）と、すべてのタイプを持たないこと
 * - afterCharacterMessage スロット
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CharacterPersonalityContent from "../CharacterPersonalityContent";
import type { CharacterPersonalityDetailedContent } from "../../types";

// fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

// CompatibilitySection をモック
vi.mock("@/play/quiz/_components/CompatibilitySection", () => ({
  default: ({
    myType,
    friendType,
    compatibility,
  }: {
    myType: { title: string };
    friendType: { title: string };
    compatibility: { label: string; description: string };
  }) => (
    <div data-testid="compatibility-section">
      <span>友達との相性結果</span>
      <span>{myType.title}</span>
      <span>{friendType.title}</span>
      <span>{compatibility.label}</span>
      <span>{compatibility.description}</span>
    </div>
  ),
}));

// InviteFriendButton をモック
vi.mock("@/play/quiz/_components/InviteFriendButton", () => ({
  default: ({ inviteText }: { inviteText: string }) => (
    <button type="button">
      友達に診断を送る
      <span>{inviteText}</span>
    </button>
  ),
}));

const sampleContent: CharacterPersonalityDetailedContent = {
  variant: "character-personality",
  catchphrase: "追い込まれてから本当の俺が動き出すぜ",
  archetypeBreakdown:
    "commanderとdreamerの融合型。瞬発的なリーダーシップと直感的なビジョンを組み合わせ、土壇場で真価を発揮するタイプです。",
  behaviors: [
    "期限ギリギリになって突然スイッチが入る",
    "「なんとかなる」が口癖",
    "プレッシャー下で最高のパフォーマンスを出す",
    "計画より即興が得意",
  ],
  characterMessage:
    "ギリギリが好きなんじゃない。ギリギリにならないと本気になれないだけだ。でも、それでいい。",
};

const sampleResultId = "blazing-strategist";
describe("CharacterPersonalityContent - 基本レンダリング", () => {
  it("archetypeBreakdownセクションが表示されること", () => {
    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
      />,
    );
    expect(screen.getByText("このキャラの成り立ち")).toBeInTheDocument();
    expect(
      screen.getByText(
        "commanderとdreamerの融合型。瞬発的なリーダーシップと直感的なビジョンを組み合わせ、土壇場で真価を発揮するタイプです。",
      ),
    ).toBeInTheDocument();
  });

  it("behaviorsセクションが表示されること（4項目）", () => {
    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
      />,
    );
    expect(screen.getByText("このキャラの日常")).toBeInTheDocument();
    expect(
      screen.getByText("期限ギリギリになって突然スイッチが入る"),
    ).toBeInTheDocument();
    expect(screen.getByText("「なんとかなる」が口癖")).toBeInTheDocument();
    expect(
      screen.getByText("プレッシャー下で最高のパフォーマンスを出す"),
    ).toBeInTheDocument();
    expect(screen.getByText("計画より即興が得意")).toBeInTheDocument();
  });

  it("characterMessageセクションが表示されること", () => {
    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
      />,
    );
    expect(screen.getByText("キャラからのメッセージ")).toBeInTheDocument();
    expect(
      screen.getByText(
        "ギリギリが好きなんじゃない。ギリギリにならないと本気になれないだけだ。でも、それでいい。",
      ),
    ).toBeInTheDocument();
  });
});

describe("CharacterPersonalityContent - 見出しの段", () => {
  it("小見出しはどれもセクションの中の小見出しの段（h3）で組み、すべてのタイプを持たない", () => {
    const { container } = render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
      />,
    );
    expect(container.querySelectorAll("h3").length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    expect(
      screen.queryByRole("heading", { name: /^すべてのタイプ/ }),
    ).not.toBeInTheDocument();
  });
});

describe("CharacterPersonalityContent - 読みものの組み方", () => {
  it("文は段落、あるあるは箇条書きで組み、カードの区画を持たない", () => {
    const { container } = render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
        afterCharacterMessage={null}
      />,
    );
    for (const text of [
      sampleContent.archetypeBreakdown,
      sampleContent.characterMessage,
    ]) {
      expect(screen.getByText(text).tagName).toBe("P");
    }
    for (const item of [...sampleContent.behaviors]) {
      expect(screen.getByText(item).tagName).toBe("LI");
    }
    expect(container.querySelector("[class*='Card']")).toBeNull();
  });
});

describe("CharacterPersonalityContent - afterCharacterMessage スロット", () => {
  it("afterCharacterMessage が提供された場合、characterMessageの後に表示されること", () => {
    const afterContent = (
      <div data-testid="after-character-message-slot">カスタムCTA</div>
    );
    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
        afterCharacterMessage={afterContent}
      />,
    );
    expect(
      screen.getByTestId("after-character-message-slot"),
    ).toBeInTheDocument();
    expect(screen.getByText("カスタムCTA")).toBeInTheDocument();
  });

  it("afterCharacterMessage が渡された場合、fetch は呼ばれないこと", () => {
    const afterContent = <div>カスタムCTA</div>;
    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
        referrerTypeId="blazing-poet"
        afterCharacterMessage={afterContent}
      />,
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("CharacterPersonalityContent - 相性機能（referrerTypeId なし）", () => {
  it("referrerTypeId がない場合、InviteFriendButton のみ表示されること", () => {
    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
      />,
    );
    expect(
      screen.getByRole("button", { name: /友達に診断を送る/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("compatibility-section"),
    ).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("CharacterPersonalityContent - 相性機能（referrerTypeId あり・API成功）", () => {
  it("APIが成功した場合、CompatibilitySectionとInviteFriendButtonが表示されること", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        label: "最強コンビ",
        description: "火花散る刺激的な関係",
        myType: { title: "炎の戦略家" },
        friendType: { title: "炎の詩人" },
      }),
    });

    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
        referrerTypeId="blazing-poet"
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("compatibility-section")).toBeInTheDocument();
    });

    expect(screen.getByText("最強コンビ")).toBeInTheDocument();
    expect(screen.getByText("火花散る刺激的な関係")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /友達に診断を送る/ }),
    ).toBeInTheDocument();
  });

  it("正しいAPIエンドポイントにフェッチすること", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        label: "最強コンビ",
        description: "説明",
        myType: { title: "炎の戦略家" },
        friendType: { title: "炎の詩人" },
      }),
    });

    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId="blazing-strategist"
        referrerTypeId="blazing-poet"
      />,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/quiz/compatibility?slug=character-personality&typeA=blazing-strategist&typeB=blazing-poet",
      );
    });
  });
});

describe("CharacterPersonalityContent - 相性機能（referrerTypeId あり・API失敗）", () => {
  it("APIが400を返した場合、InviteFriendButton のみ表示されること", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
        referrerTypeId="blazing-poet"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /友達に診断を送る/ }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId("compatibility-section"),
    ).not.toBeInTheDocument();
  });

  it("ネットワークエラーの場合、InviteFriendButton のみ表示されること", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
        referrerTypeId="blazing-poet"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /友達に診断を送る/ }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId("compatibility-section"),
    ).not.toBeInTheDocument();
  });
});

describe("CharacterPersonalityContent - 相性機能（ローディング中）", () => {
  it("フェッチ中はローディングテキストが表示されること", () => {
    // 解決しないPromiseで無限ローディング状態に
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(
      <CharacterPersonalityContent
        content={sampleContent}
        resultId={sampleResultId}
        referrerTypeId="blazing-poet"
      />,
    );

    expect(
      screen.getByText("友達との相性を読み込んでいます"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("compatibility-section"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /友達に診断を送る/ }),
    ).not.toBeInTheDocument();
  });
});
