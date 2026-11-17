import { afterEach, describe, expect, test, vi } from "vitest";

// release はビルドごとに変わるので、決まった値にして文を完全一致で確かめる。
vi.mock("@/lib/generated/release-id", () => ({
  RELEASE_ID: "test-release-x",
}));

import {
  gaTrackingId,
  gtagInitScript,
  gtagLoaderSrc,
} from "@/lib/google-analytics";

describe("gaTrackingId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("NEXT_PUBLIC_GA_TRACKING_ID を返す", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_TRACKING_ID", "G-TESTID123");
    expect(gaTrackingId()).toBe("G-TESTID123");
  });

  test("空なら undefined を返す", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_TRACKING_ID", "");
    expect(gaTrackingId()).toBeUndefined();
  });
});

describe("gtagLoaderSrc", () => {
  test("gtag.js の URL に ID を URL の値として入れる", () => {
    expect(gtagLoaderSrc("G-TESTID123")).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-TESTID123",
    );
    expect(gtagLoaderSrc("G-A&B")).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-A%26B",
    );
  });
});

describe("gtagInitScript", () => {
  test("dataLayer を用意し、同意の既定を granted にして、ID と release で config する", () => {
    expect(gtagInitScript("G-TESTID123")).toBe(
      "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
        "gtag('js',new Date());" +
        "gtag('consent','default',{analytics_storage:'granted'});" +
        'gtag(\'config\',"G-TESTID123",{release:"test-release-x"});',
    );
  });

  test("ID は文字列の式として埋め込み、引用符で文が壊れない", () => {
    expect(gtagInitScript("G-'x\"")).toContain(
      `gtag('config',${JSON.stringify("G-'x\"")},`,
    );
  });
});
