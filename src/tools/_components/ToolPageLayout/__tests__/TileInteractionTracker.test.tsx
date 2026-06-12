import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";

// analytics をモック（外部サービス統合はモックする・testing.md）
vi.mock("@/lib/analytics", () => ({
  trackTileFirstInteraction: vi.fn(),
}));

import { trackTileFirstInteraction } from "@/lib/analytics";
import TileInteractionTracker from "../TileInteractionTracker";

const mockTrack = vi.mocked(trackTileFirstInteraction);

function renderTracker() {
  return render(
    <TileInteractionTracker
      itemId="base64"
      className="content"
      ariaLabel="Base64エンコード・デコードツール"
    >
      <button type="button">変換する</button>
      <textarea aria-label="入力" />
    </TileInteractionTracker>,
  );
}

describe("TileInteractionTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("children を <section>（className / aria-label 付き）内に描画する", () => {
    renderTracker();
    const section = screen.getByRole("region", {
      name: "Base64エンコード・デコードツール",
    });
    expect(section).toHaveClass("content");
    expect(
      screen.getByRole("button", { name: "変換する" }),
    ).toBeInTheDocument();
  });

  it("描画しただけでは送信しない", () => {
    renderTracker();
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it("最初のポインタ操作で 1 回だけ送信する（item_id=slug, surface=detail, variant なし）", () => {
    renderTracker();
    fireEvent.pointerDown(screen.getByRole("button", { name: "変換する" }));

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith({
      item_id: "base64",
      surface: "detail",
    });
  });

  it("2 回目以降の操作では送信しない（ポインタ→ポインタ／キーボード混在も含む）", () => {
    renderTracker();
    const button = screen.getByRole("button", { name: "変換する" });
    fireEvent.pointerDown(button);
    fireEvent.pointerDown(button);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "入力" }), {
      key: "a",
    });

    expect(mockTrack).toHaveBeenCalledTimes(1);
  });

  it("キーボード操作が最初でも送信する", () => {
    renderTracker();
    fireEvent.keyDown(screen.getByRole("textbox", { name: "入力" }), {
      key: "a",
    });

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith({
      item_id: "base64",
      surface: "detail",
    });
  });

  it("再マウントするとフラグはリセットされ、再び 1 回送信できる（マウントごと 1 回）", () => {
    const { unmount } = renderTracker();
    fireEvent.pointerDown(screen.getByRole("button", { name: "変換する" }));
    unmount();

    renderTracker();
    fireEvent.pointerDown(screen.getByRole("button", { name: "変換する" }));

    expect(mockTrack).toHaveBeenCalledTimes(2);
  });

  it("SSR（renderToString）でエラーなく描画でき、送信もしない", () => {
    const html = renderToString(
      <TileInteractionTracker
        itemId="base64"
        className="content"
        ariaLabel="Base64エンコード・デコードツール"
      >
        <div>本体</div>
      </TileInteractionTracker>,
    );

    expect(html).toContain("本体");
    expect(html).toContain("aria-label");
    expect(mockTrack).not.toHaveBeenCalled();
  });
});
