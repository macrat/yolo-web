import { describe, test, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// next/script renders a <script> in test/jsdom, so we mock it
// to render a visible element we can query.
vi.mock("next/script", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <script data-testid="next-script" {...props} />;
  },
}));

// Pin RELEASE_ID so the test asserts on a fixed string and is independent of
// codegen output (which varies per commit / per build host).
vi.mock("@/lib/generated/release-id", () => ({
  RELEASE_ID: "test-release-x",
}));

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("renders nothing when NEXT_PUBLIC_GA_TRACKING_ID is not set", async () => {
    delete process.env.NEXT_PUBLIC_GA_TRACKING_ID;

    const { default: GoogleAnalytics } =
      await import("@/components/GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe("");
  });

  test("renders script tags when NEXT_PUBLIC_GA_TRACKING_ID is set", async () => {
    process.env.NEXT_PUBLIC_GA_TRACKING_ID = "G-TESTID123";

    const { default: GoogleAnalytics } =
      await import("@/components/GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);

    const scripts = container.querySelectorAll("script");
    expect(scripts.length).toBe(2);

    // First script: gtag.js loader
    expect(scripts[0].getAttribute("src")).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-TESTID123",
    );

    // Second script: inline configuration. GA_ID と RELEASE_ID は JSON.stringify
    // で安全にエスケープしてから埋め込むため、出力は二重引用符 + 完全一致になる
    // （シングルクォート素埋め込みだと将来 resolver 値域が広がった瞬間に script
    // 構文が壊れる潜在事故になる）。release は全イベントに自動で乗る。
    expect(scripts[1].innerHTML).toContain(
      'gtag(\'config\', "G-TESTID123", { release: "test-release-x" });',
    );

    delete process.env.NEXT_PUBLIC_GA_TRACKING_ID;
  });
});
