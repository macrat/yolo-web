import { open, close, settle, URL } from "./lib.mjs";
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new globalThis.URL("./phr-all.json", import.meta.url), "utf8"));
for (const pid of ["34", "20"]) for (const [w, f] of [[320, 16], [375, 16], [1280, 16], [320, 32], [375, 32], [1280, 32]]) for (const dark of [false, true]) {
  if (dark && pid === "20") continue;
  const o = await open({ width: w, height: 800, font: f, dark }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 600);
  await p.evaluate((words) => {
    const phrasedCls = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } }).flatMap((r) => r.cssRules ? [...r.cssRules] : [r]).map((r) => r.selectorText || "").find((s) => /phrased/.test(s))?.replace(/^\./, "");
    const btns = [...document.querySelectorAll("[aria-label='言葉の格子'] button")];
    btns.forEach((b, i) => { const ph = words[i]; const mark = b.querySelector("span"); b.replaceChildren(mark); ph.forEach((x, k) => { if (k) b.append(document.createElement("wbr")); b.append(document.createTextNode(x)); }); b.classList.toggle(phrasedCls, ph.length > 1); });
  }, J.out[pid]);
  const g = p.locator("[aria-label='言葉の格子']");
  await g.locator("button").nth(0).click();
  await g.locator("button").nth(2).focus(); await p.keyboard.press("Shift+Tab"); await p.keyboard.press("Tab");
  await g.locator("button").nth(5).hover();
  await g.screenshot({ path: `shots/grid-${pid}-${w}-${f}-${dark ? "dark" : "light"}.png` });
  await close(o);
}
