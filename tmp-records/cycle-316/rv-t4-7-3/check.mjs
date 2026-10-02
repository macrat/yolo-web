import { chromium } from "playwright";
const port = 3840, dir = "tmp/cycle-316/rv-t4-7-3";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ids = ["reverseoptimist","overthinker","cosmicworrier","paradoxmaster","accidentalprophet","calmchaos","inversefortune","mundaneoracle"];
for (const vw of [375, 1280]) {
  const p = await b.newPage({ viewport: { width: vw, height: vw === 375 ? 667 : 800 } });
  for (const id of ids) {
    await p.goto(`http://localhost:${port}/play/contrarian-fortune/result/${id}`, { waitUntil: "load" });
    const r = await p.evaluate(() => {
      const main = document.querySelector("main");
      const t = main.innerText;
      const h2 = [...main.querySelectorAll("h2")].map(h => h.textContent);
      return { hits: (t.match(/(普通|一般的)な占いなら/g) || []).length, h2: h2.slice(0, 2), over: document.documentElement.scrollWidth > innerWidth };
    });
    console.log(vw, id, JSON.stringify(r));
    if (id === "accidentalprophet" || id === "cosmicworrier") await p.screenshot({ path: `${dir}/cf-${id}-${vw}.png`, fullPage: true });
  }
  // character-fortune headings and default headings
  const cfIds = ["blazing-warden"];
  for (const url of ["/play/character-fortune/result/commander", "/play/science-thinking/result/einstein", "/play/word-sense-personality/result/elegant-precise"]) {
    const res = await p.goto(`http://localhost:${port}${url}`, { waitUntil: "load" });
    if (res.status() !== 200) { console.log(url, res.status()); continue; }
    const hs = await p.evaluate(() => [...document.querySelectorAll("main h2")].map(h => {
      const rects = []; const rg = document.createRange(); let lines = new Map();
      const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let n; let s = "";
      while ((n = w.nextNode())) for (let i = 0; i < n.length; i++) { rg.setStart(n, i); rg.setEnd(n, i + 1); const r = rg.getClientRects()[0]; if (!r) continue; const k = Math.round(r.top); lines.set(k, (lines.get(k) || "") + n.data[i]); }
      return [...lines.values()].join("／") + (h.dataset.headingFont ? " [fb]" : "") + " wbr=" + h.querySelectorAll("wbr").length;
    }));
    console.log(vw, url, JSON.stringify(hs));
    await p.screenshot({ path: `${dir}/${url.split("/")[2]}-${vw}.png`, fullPage: true });
  }
  await p.close();
}
await b.close();
