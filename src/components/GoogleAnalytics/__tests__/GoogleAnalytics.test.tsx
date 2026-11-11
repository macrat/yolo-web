import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

// next/script renders a <script> in test/jsdom, so we mock it
// to render a visible element we can query.
vi.mock("next/script", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <script data-testid="next-script" {...props} />;
  },
}));

import { gtagInitScript, gtagLoaderSrc } from "@/lib/google-analytics";

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("renders nothing when NEXT_PUBLIC_GA_TRACKING_ID is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_TRACKING_ID", "");

    const { default: GoogleAnalytics } =
      await import("@/components/GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe("");
  });

  // 文そのものは @/lib/google-analytics の試験が確かめる。ここではその出力がそのまま入ることを見る。
  test("loads gtag.js and runs the shared init script when NEXT_PUBLIC_GA_TRACKING_ID is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_TRACKING_ID", "G-TESTID123");

    const { default: GoogleAnalytics } =
      await import("@/components/GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);

    const scripts = container.querySelectorAll("script");
    expect(scripts.length).toBe(2);
    expect(scripts[0].getAttribute("src")).toBe(gtagLoaderSrc("G-TESTID123"));
    expect(scripts[1].innerHTML).toBe(gtagInitScript("G-TESTID123"));
  });
});
