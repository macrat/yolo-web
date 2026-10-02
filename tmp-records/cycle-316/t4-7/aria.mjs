import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const routes = JSON.parse(readFileSync("tmp/cycle-316/t4-7/routes.json", "utf8"));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 375, height: 667 } });
let ok = 0; const bad = [];
for (const r of routes) {
  await p.goto(`http://localhost:3728/play/${r.slug}/result/${r.id}`, { waitUntil: "domcontentloaded" });
  const snap = await p.locator("main h1").ariaSnapshot();
  if (snap === `- heading "${r.title}" [level=1]`) ok++; else bad.push([r.id, snap]);
}
console.log(`h1 の読み上げの名前がデータのタイトルと一字も違わない: ${ok}/${routes.length}`, bad);
await b.close();
