import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkipLink, { MAIN_CONTENT_ID } from "@/components/SkipLink";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { generateWebSiteJsonLd, safeJsonLdStringify } from "@/lib/seo";
import { sharedMetadata, sharedViewport } from "@/lib/site-metadata";
import { plexSans, zenAntique } from "@/lib/fonts";

export const metadata: Metadata = sharedMetadata;
export const viewport: Viewport = sharedViewport;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = generateWebSiteJsonLd();
  return (
    <html lang="ja" className={`${zenAntique.variable} ${plexSans.variable}`}>
      <body
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(websiteJsonLd),
          }}
        />
        {/* body 直下の最初の focusable 要素。上端の全リンクを Tab で
            通過せず本文へ跳べるようにする（WCAG 2.4.1・F1）。 */}
        <SkipLink />
        <GoogleAnalytics />
        <Header />
        {/* tabIndex={-1}: スキップリンクからプログラム的に focus を移せるようにする。 */}
        <main id={MAIN_CONTENT_ID} tabIndex={-1} style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
