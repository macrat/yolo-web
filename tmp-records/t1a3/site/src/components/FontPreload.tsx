// Prototype (cycle-316 T1a): font preloads written as raw HTML inside a hidden element. React does not
// look inside dangerouslySetInnerHTML, so no :HL hint is emitted into the RSC payload and a prefetched
// RSC starts no font request. On a document load the HTML preload scanner finds the links; on a
// client-side navigation the links are inserted with the page and start the requests then.
export default function FontPreload({ hrefs, low = [] }: { hrefs: string[]; low?: string[] }) {
  const html =
    hrefs.map((h) => `<link rel="preload" href="${h}" as="font" type="font/woff2" crossorigin>`).join("") +
    low.map((h) => `<link rel="preload" href="${h}" as="font" type="font/woff2" crossorigin fetchpriority="low">`).join("");
  return <div hidden dangerouslySetInnerHTML={{ __html: html }} />;
}
