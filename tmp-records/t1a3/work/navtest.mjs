// Client-side navigation test (B-1): open <from>, let fonts load, click the Next.js <Link> to <to>, then
// sample every element with direct text in <main>/<header>/<footer> via CSS.getPlatformFontsForNode.
// An element "mixes" when one element's text is drawn by a Japanese Web font and by a Japanese fallback.
// usage: node navtest.mjs <base> <net:none|slow4g|fast4g> <from> <to> [label]
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, net, from, to, label = ""] = process.argv;
const NETS = { none: null, slow4g: { latency: 562.5, down: (1474.56 * 1024) / 8, up: (675 * 1024) / 8, cpu: 4 }, fast4g: { latency: 170, down: (9000 * 1024) / 8, up: (1500 * 1024) / 8, cpu: 4 } };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
const reqs = [];
cdp.on("Network.requestWillBeSent", (e) => reqs.push({ id: e.requestId, url: e.request.url, t: Date.now() }));
const done = new Map();
cdp.on("Network.loadingFinished", (e) => done.set(e.requestId, e.encodedDataLength));
await page.goto(base + encodeURI(from), { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(3000);
const n = NETS[net];
if (n) { await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: n.latency, downloadThroughput: n.down, uploadThroughput: n.up }); await cdp.send("Emulation.setCPUThrottlingRate", { rate: n.cpu }); }
await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
const JP_WEB = /BIZ UD|Zen Antique|Noto Serif JP/;
const LATIN_ONLY = /^(Liberation|DejaVu|Arial|Helvetica|Roboto|Yolos Sans|IBM Plex)/;
const LATIN_FB = /^(Liberation Sans|Liberation Serif|DejaVu Sans$|DejaVu Serif|Arial|Helvetica|Roboto)/;
async function rects() { return page.evaluate(() => [...document.querySelectorAll("main h1,main h2,main h3,main p,main li,main dd,main td,main button,main a,footer")].map((e) => { const b = e.getBoundingClientRect(); return [Math.round(b.top + scrollY), Math.round(b.height)]; })); }
function rdiff(a, b) { let moved = 0, maxDy = 0; for (let i = 0; i < Math.min(a.length, b.length); i++) { const d = Math.max(Math.abs(a[i][0] - b[i][0]), Math.abs(a[i][1] - b[i][1])); if (d > 1) { moved++; maxDy = Math.max(maxDy, d); } } return { n: Math.min(a.length, b.length), moved, maxDy }; }
async function sample(tag) {
  const doc = await cdp.send("DOM.getDocument", { depth: -1, pierce: false });
  const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: doc.root.nodeId, selector: "main *, header *, footer *" });
  const out = { tag, t: Date.now() - t0, elems: 0, mixedJP: 0, mixedLatin: 0, webJP: 0, fallbackJP: 0, examples: [], families: {} };
  for (const id of nodeIds) {
    let fonts;
    try { ({ fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId: id })); } catch { continue; }
    if (!fonts || !fonts.length) continue;
    out.elems++;
    const jpWeb = fonts.filter((f) => JP_WEB.test(f.familyName));
    const jpFb = fonts.filter((f) => !JP_WEB.test(f.familyName) && !LATIN_ONLY.test(f.familyName));
    const lat = fonts.filter((f) => LATIN_ONLY.test(f.familyName));
    for (const f of fonts) out.families[f.familyName + (f.isCustomFont ? "*" : "")] = (out.families[f.familyName + (f.isCustomFont ? "*" : "")] || 0) + f.glyphCount;
    if (jpWeb.length) out.webJP++;
    if (jpFb.length) out.fallbackJP++;
    if (jpWeb.length && jpFb.length) { out.mixedJP++; if (out.examples.length < 4) { const { node } = await cdp.send("DOM.describeNode", { nodeId: id }); out.examples.push(node.localName + ":" + fonts.map((f) => f.familyName + ":" + f.glyphCount).join(",")); } }
    if (lat.some((f) => /Yolos Sans|IBM Plex/.test(f.familyName)) && fonts.some((f) => LATIN_FB.test(f.familyName))) out.mixedLatin++;
    if (fonts.some((f) => /Liberation Serif|DejaVu Serif/.test(f.familyName))) out.serifLatin = (out.serifLatin || 0) + 1;
  }
  return out;
}
const before = await page.evaluate(() => document.querySelector("h1")?.textContent);
const reqStart = reqs.length;
let t0 = Date.now();
await page.evaluate((to) => { const a = [...document.querySelectorAll("a")].find((a) => decodeURI(a.getAttribute("href") || "") === to); if (!a) throw new Error("no link " + to); a.scrollIntoView(); a.click(); }, to);
t0 = Date.now();
await page.waitForFunction((b) => document.querySelector("h1") && document.querySelector("h1").textContent !== b, before, { timeout: 30000, polling: 10 });
const commit = Date.now() - t0;
const r0 = await rects();
const vis0 = await page.evaluate(() => { const p = document.querySelector("main p"); return p ? getComputedStyle(p).visibility : null; });
const s0 = await sample("commit");
await page.waitForTimeout(n ? 6000 : 2500);
const s1 = await sample("settled");
const r1 = await rects();
const fontsDone = await page.evaluate(() => performance.getEntriesByType("resource").filter((e) => /woff2/.test(e.name)).map((e) => Math.round(e.responseEnd)));
const navDoc = await page.evaluate(() => performance.getEntriesByType("navigation").length);
const newReqs = reqs.slice(reqStart);
const fontReqs = newReqs.filter((r) => /woff2/.test(r.url));
const bytes = (a) => a.reduce((s, r) => s + (done.get(r.id) || 0), 0);
console.log(JSON.stringify({ label, base, net, from, to, url: decodeURI(new URL(page.url()).pathname), commitMs: commit, shift: rdiff(r0, r1), fontReqs: fontReqs.map((r) => r.url.split("/").pop() + ":" + (done.get(r.id) || 0)), fontBytes: bytes(fontReqs), allBytesAfterClick: bytes(newReqs), s0: { ...s0, families: undefined }, s1 }));
await b.close();
