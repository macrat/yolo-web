import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const m = JSON.parse(fs.readFileSync("../site/fontbuild/manifest.json", "utf8")).ud["/play/character-personality"];
const R = new Set(m.r.biz400.chars);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await b.newPage();
for (const mode of ["landing", "nav"]) {
  if (mode === "landing") await page.goto("http://localhost:3318/play/character-personality");
  else { await page.goto("http://localhost:3318/play/character-personality/result/blazing-strategist"); await page.waitForTimeout(1500); await page.evaluate(() => [...document.querySelectorAll("a")].find((a) => a.getAttribute("href") === "/play/character-personality").click()); }
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => ({ url: location.pathname, text: document.body.innerText }));
  const hit = [...new Set(info.text)].filter((c) => R.has(c));
  const lines = info.text.split("\n").filter((l) => [...l].some((c) => hit.includes(c))).slice(0, 5);
  console.log(mode, info.url, hit.join(""), JSON.stringify(lines));
}
await b.close();
