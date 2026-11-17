import Script from "next/script";

import {
  gaTrackingId,
  gtagInitScript,
  gtagLoaderSrc,
} from "@/lib/google-analytics";

export default function GoogleAnalytics() {
  const id = gaTrackingId();
  if (!id) return null;

  return (
    <>
      <Script src={gtagLoaderSrc(id)} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {gtagInitScript(id)}
      </Script>
    </>
  );
}
