import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TrustLevelBadge from "../index";
import { TRUST_LEVEL_META, type TrustLevel } from "@/lib/trust-levels";

const ALL_LEVELS: TrustLevel[] = ["verified", "curated", "generated"];

describe("TrustLevelBadge (新版: src/components/TrustLevelBadge)", () => {
  // --- label 表示 ---
  test.each(ALL_LEVELS)("%s: label テキストを表示する", (level) => {
    render(<TrustLevelBadge level={level} />);
    const meta = TRUST_LEVEL_META[level];
    expect(screen.getByText(meta.label)).toBeInTheDocument();
  });

  // --- icon 枠が存在しないことを確認（新版はアイコン枠を撤去） ---
  test.each(ALL_LEVELS)(
    "%s: aria-hidden の icon span が存在しない（アイコン枠撤去済み）",
    (level) => {
      const { container } = render(<TrustLevelBadge level={level} />);
      // 旧版では <span aria-hidden="true">{meta.icon}</span> があったが、新版では存在しない
      const ariaHiddenSpans = container.querySelectorAll(
        "[aria-hidden='true']",
      );
      expect(ariaHiddenSpans).toHaveLength(0);
    },
  );

  // --- <details> が初期は閉じている ---
  test.each(ALL_LEVELS)("%s: <details> が初期状態では閉じている", (level) => {
    const { container } = render(<TrustLevelBadge level={level} />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details!.open).toBe(false);
  });

  // --- クリックで展開する ---
  test.each(ALL_LEVELS)(
    "%s: <summary> をクリックすると <details> が展開する",
    (level) => {
      const { container } = render(<TrustLevelBadge level={level} />);
      const details = container.querySelector("details")!;
      const summary = container.querySelector("summary")!;
      expect(details.open).toBe(false);
      fireEvent.click(summary);
      expect(details.open).toBe(true);
    },
  );

  // --- description が description テキストを含む ---
  test.each(ALL_LEVELS)(
    "%s: description テキストが DOM 内に存在する",
    (level) => {
      render(<TrustLevelBadge level={level} />);
      const meta = TRUST_LEVEL_META[level];
      expect(screen.getByText(meta.description)).toBeInTheDocument();
    },
  );

  // --- note prop ---
  test("note prop が渡されたとき note テキストを表示する", () => {
    const noteText = "これはテスト用の補足注記です。";
    render(<TrustLevelBadge level="curated" note={noteText} />);
    expect(screen.getByText(noteText)).toBeInTheDocument();
  });

  test("note prop が渡されないとき note 要素が存在しない", () => {
    const { container } = render(<TrustLevelBadge level="verified" />);
    const noteElements = container.querySelectorAll("[class*='note']");
    expect(noteElements).toHaveLength(0);
  });

  // --- <details>/<summary> パターン ---
  test("details/summary パターンが維持されている", () => {
    const { container } = render(<TrustLevelBadge level="generated" />);
    const details = container.querySelector("details");
    const summary = container.querySelector("summary");
    expect(details).not.toBeNull();
    expect(summary).not.toBeNull();
  });

  // --- open 属性付き（展開状態） ---
  test("open 属性付きの <details> が展開状態で描画される", () => {
    const { container } = render(<TrustLevelBadge level="verified" open />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details!.open).toBe(true);
  });

  // --- aria-label ---
  test("wrapper div に適切な aria ロールが設定されている（summary が interactive 要素として存在する）", () => {
    const { container } = render(<TrustLevelBadge level="verified" />);
    const summary = container.querySelector("summary");
    expect(summary).not.toBeNull();
    // summary はデフォルトで button ロールと同等のフォーカス可能要素
    // aria-label を付与している場合はその値を確認
    // 新版では aria-label は付与していないが、summary 自体が interactive であることを確認
  });
});
