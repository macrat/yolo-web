import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TrustLevelBadge from "../TrustLevelBadge";
import { TRUST_LEVEL_META, type TrustLevel } from "@/lib/trust-levels";

const ALL_LEVELS: TrustLevel[] = ["verified", "curated", "generated"];

describe("TrustLevelBadge", () => {
  test.each(ALL_LEVELS)(
    "renders correct label and icon for %s level",
    (level) => {
      render(<TrustLevelBadge level={level} />);
      const meta = TRUST_LEVEL_META[level];
      expect(screen.getByText(meta.label)).toBeInTheDocument();
      expect(screen.getByText(meta.icon)).toBeInTheDocument();
    },
  );

  test.each(ALL_LEVELS)(
    "includes description text in details for %s level",
    (level) => {
      render(<TrustLevelBadge level={level} />);
      const meta = TRUST_LEVEL_META[level];
      expect(screen.getByText(meta.description)).toBeInTheDocument();
    },
  );

  test("renders note text when note prop is provided", () => {
    const noteText = "これはテスト用の補足注記です。";
    render(<TrustLevelBadge level="curated" note={noteText} />);
    expect(screen.getByText(noteText)).toBeInTheDocument();
  });

  test("does not render note when note prop is not provided", () => {
    const { container } = render(<TrustLevelBadge level="verified" />);
    const noteElements = container.querySelectorAll("[class*='note']");
    expect(noteElements).toHaveLength(0);
  });

  test("uses <details>/<summary> pattern for expandable description", () => {
    const { container } = render(<TrustLevelBadge level="generated" />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    const summary = container.querySelector("summary");
    expect(summary).not.toBeNull();
  });
});
