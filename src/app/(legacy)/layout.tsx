import type { Metadata } from "next";
// old-globals.css は src/app/ 直下に残る（メタファイルのため移動対象外）
import "../old-globals.css";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ThemeProvider from "@/components/common/ThemeProvider";
import { generateWebSiteJsonLd, safeJsonLdStringify } from "@/lib/seo";
import AchievementProvider from "@/lib/achievements/AchievementProvider";
import { sharedMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = sharedMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = generateWebSiteJsonLd();
  return (
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
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </AchievementProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
