import Script from "next/script";

import { RELEASE_ID } from "@/lib/generated/release-id";

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export default function GoogleAnalytics() {
  if (!GA_TRACKING_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: 'granted'
          });
          gtag('config', ${JSON.stringify(GA_TRACKING_ID)}, { release: ${JSON.stringify(RELEASE_ID)} });
        `}
      </Script>
    </>
  );
}
