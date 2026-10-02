import { chromium } from "playwright";
const B = "http://localhost:3187";
const out = "/home/user/yolo-web/tmp/cycle-316/rv34";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [path, id, tag] of [["/dictionary/kanji/%E6%B0%B4", "same-radical-kanji", "kanji"], ["/dictionary/yoji/%E4%B8%80%E6%9C%9F%E4%B8%80%E4%BC%9A", "same-category-yoji", "yoji"]]) {
  for (const scheme of ["light", "dark"]) for (const w of [320, 1280]) {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: w, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(B + path, { waitUntil: "networkidle" });
    const sec = p.locator(`section[aria-labelledby="${id}"]`);
    await sec.screenshot({ path: `${out}/idx_${tag}_${w}_${scheme}.png` });
    if (scheme === "light" && w === 320) {
      console.log(tag, (await sec.ariaSnapshot()).split("\n").slice(0, 14).join("\n"));
      console.log(tag, "header aria", (await p.locator("main").ariaSnapshot()).split("\n").slice(0, 8).join("\n"));
      const m = await p.evaluate((id) => { const links=[...document.querySelectorAll(`section[aria-labelledby="${id}"] a`)]; const r=links.slice(0,3).map(a=>{const b=a.getBoundingClientRect();return [a.textContent, Math.round(b.left), Math.round(b.width), Math.round(b.height)]}); const hs=[...document.querySelectorAll(`section[aria-labelledby="${id}"] h3`)].slice(0,2).map(h=>[getComputedStyle(h).fontSize, Math.round(h.getBoundingClientRect().left)]); const h2=document.getElementById(id); return {r, hs, h2:[getComputedStyle(h2).fontSize, Math.round(h2.getBoundingClientRect().left)]}; }, id);
      console.log(JSON.stringify(m));
    }
    await ctx.close();
  }
}
await browser.close();
