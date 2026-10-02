import { open, close, settle, BASE } from "./lib.mjs";
const today = "2026-09-28";
const row = (guess, r, s, g, dir, o, c, k) => ({ guess, radical: r, strokeCount: s, grade: g, gradeDirection: dir, onYomi: o, category: c, kunYomiCount: k });
const ROWS = [row("川","wrong","close","correct","equal","wrong","close","wrong"), row("林","correct","wrong","close","up","wrong","wrong","correct"), row("森","correct","close","correct","equal","correct","close","correct")];
const seed = { "kanji-kanaru-migrated-v2": "1", "kanji-kanaru-history-intermediate": JSON.stringify({ [today]: { guesses: ROWS.map(f=>f.guess), feedbacks: ROWS, status: "playing", guessCount: 3 } }) };
for (const s of [seed, null]) {
const o = await open({ width: 375, height: 667, storage: s }); const p = o.page;
await p.goto(`${BASE}/play/kanji-kanaru`, { waitUntil: "load" }); await settle(p, 1200);
console.log("rows shown", await p.evaluate(() => document.querySelectorAll('[role="row"]').length), await p.evaluate(() => JSON.stringify(window.__cls)));
await p.evaluate(() => document.querySelector("main ul[class*=legend]").scrollIntoView({ block: "start" })); await p.waitForTimeout(300);
const y0 = await p.evaluate(() => scrollY);
await p.reload({ waitUntil: "load" }); await settle(p, 1500);
console.log("seed", !!s, "y0", y0, "y1", await p.evaluate(() => scrollY), JSON.stringify(await p.evaluate(() => window.__cls)).slice(0, 600));
await close(o);
}
