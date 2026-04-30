import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import AchievementProvider from "@/lib/achievements/AchievementProvider";
import StreakBadge from "@/lib/achievements/StreakBadge";
import { generateWebSiteJsonLd, safeJsonLdStringify } from "@/lib/seo";
import { sharedMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = sharedMetadata;

export default function NewRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = generateWebSiteJsonLd();
  return (
    // suppressHydrationWarning: next-themes がクライアント側で <html class="dark"> を付与するため、
    // サーバーとクライアントの class 不一致による hydration 警告を抑制する
    <html lang="ja" suppressHydrationWarning>
      <body
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(websiteJsonLd),
          }}
        />
        <ThemeProvider>
          <AchievementProvider>
            <GoogleAnalytics />
            <Header
              actions={
                <>
                  <StreakBadge />
                  <ThemeToggle />
                </>
              }
            />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </AchievementProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
