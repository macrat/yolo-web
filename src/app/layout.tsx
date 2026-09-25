import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import SiteFrame from "@/components/SiteFrame";
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(websiteJsonLd),
          }}
        />
        <GoogleAnalytics />
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
