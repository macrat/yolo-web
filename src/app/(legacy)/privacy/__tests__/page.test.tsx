import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "../page";

test("Privacy page renders heading", () => {
  render(<PrivacyPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /プライバシーポリシー/ }),
  ).toBeInTheDocument();
});

test("Privacy page renders main sections", () => {
  render(<PrivacyPage />);
  expect(
    screen.getByRole("heading", { level: 2, name: /収集する情報/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /Cookieについて/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /第三者サービスの利用/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /利用目的/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /情報の管理と安全管理措置/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: /個人情報の開示・訂正・削除/,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 2,
      name: /プライバシーポリシーの変更/,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: /お問い合わせ/ }),
  ).toBeInTheDocument();
});

test("Privacy page renders external links with correct attributes", () => {
  render(<PrivacyPage />);

  const githubLink = screen.getByRole("link", {
    name: /GitHubリポジトリのIssues/,
  });
  expect(githubLink).toHaveAttribute(
    "href",
    "https://github.com/macrat/yolo-web/issues",
  );
  expect(githubLink).toHaveAttribute("target", "_blank");
  expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

  const googleAdsLink = screen.getByRole("link", {
    name: /Googleの広告設定/,
  });
  expect(googleAdsLink).toHaveAttribute(
    "href",
    "https://www.google.com/settings/ads",
  );
  expect(googleAdsLink).toHaveAttribute("target", "_blank");

  const naiLink = screen.getByRole("link", { name: /aboutads\.info/ });
  expect(naiLink).toHaveAttribute("href", "https://www.aboutads.info");
  expect(naiLink).toHaveAttribute("target", "_blank");

  const googlePrivacyLink = screen.getByRole("link", {
    name: /Googleのプライバシーポリシー/,
  });
  expect(googlePrivacyLink).toHaveAttribute(
    "href",
    "https://policies.google.com/privacy",
  );
  expect(googlePrivacyLink).toHaveAttribute("target", "_blank");

  const optoutLink = screen.getByRole("link", {
    name: /Googleアナリティクスオプトアウトアドオン/,
  });
  expect(optoutLink).toHaveAttribute(
    "href",
    "https://tools.google.com/dlpage/gaoptout",
  );
  expect(optoutLink).toHaveAttribute("target", "_blank");
});

test("Privacy page renders TrustLevelBadge", () => {
  render(<PrivacyPage />);
  expect(screen.getByText(/AI生成テキスト/)).toBeInTheDocument();
});

test("Privacy page renders enactment date", () => {
  render(<PrivacyPage />);
  expect(screen.getByText(/制定日: 2026年3月7日/)).toBeInTheDocument();
});
