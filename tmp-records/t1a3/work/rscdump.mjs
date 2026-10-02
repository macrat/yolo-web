import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, p, pat] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await b.newPage({ viewport: { width: 412, height: 823 } });
page.on("response", async (r) => {
  const u = r.url();
  if (!/_rsc=/.test(u) || !decodeURIComponent(u).includes(pat)) return;
  const h = r.request().headers();
  let t = ""; try { t = await r.text(); } catch {}
  console.log("RSC", decodeURIComponent(u).slice(0, 120), "prefetch:", h["next-router-prefetch"], "segprefetch:", h["next-router-segment-prefetch"], "len", t.length, "HL:", (t.match(/:HL\[[^\]]*\]/g) || []).join(" | ").slice(0, 400), "pf:", (t.match(/__pf\/[a-z0-9-]+\.woff2/g) || []).slice(0,6).join(","));
});
await page.goto(base + encodeURI(p));
await page.waitForTimeout(5000);
await b.close();
