import { open, close, settle, URL, SEEDS } from "./lib.mjs";
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new globalThis.URL("./phr-all.json", import.meta.url), "utf8"));
const PID = process.argv[2];
for (const [w, h] of [[320, 568], [375, 667], [1280, 800]]) for (const f of [16, 32]) for (const dark of [false, true]) {
  const o = await open({ width: w, height: h, font: f, dark, storage: SEEDS.first }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 600);
  const tag = `${w}-${f}-${dark ? "d" : "l"}`;
  await p.screenshot({ path: `shots/first-${tag}.png` });
  await p.evaluate((words) => { const btns = [...document.querySelectorAll("[aria-label='言葉の格子'] button")]; btns.forEach((b, i) => { const m = b.querySelector("span"); b.replaceChildren(m); words[i].forEach((x, k) => { if (k) b.append(document.createElement("wbr")); b.append(document.createTextNode(x)); }); }); }, J.out[PID]);
  const g = p.getByRole("group", { name: "言葉の格子" });
  await g.scrollIntoViewIfNeeded();
  const btns = g.getByRole("button");
  await btns.nth(0).click(); await btns.nth(1).focus(); await p.keyboard.press("Shift+Tab"); await p.keyboard.press("Tab");
  await btns.nth(5).hover();
  await g.screenshot({ path: `shots/grid${PID}-${tag}.png` });
  await close(o);
}
