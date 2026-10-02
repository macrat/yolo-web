import { open, close, cls, settle, BASE } from "./lib.mjs";
const today = "2026-09-28";
const row = (guess, r, s, g, dir, o, c, k) => ({ guess, radical: r, strokeCount: s, grade: g, gradeDirection: dir, onYomi: o, category: c, kunYomiCount: k });
const ROWS = [row("川","wrong","close","correct","equal","wrong","close","wrong"), row("林","correct","wrong","close","up","wrong","wrong","correct"), row("森","correct","close","correct","equal","correct","close","correct")];
const fb = (guess, c) => ({ guess, charFeedbacks: c });
const Y = [fb("一期一会", ["absent","present","absent","absent"]), fb("十人十色", ["absent","absent","correct","absent"]), fb("花鳥風月", ["present","absent","absent","absent"])];
const G = {
  "kanji-kanaru": { "kanji-kanaru-migrated-v2": "1", "kanji-kanaru-history-intermediate": JSON.stringify({ [today]: { guesses: ROWS.map(f=>f.guess), feedbacks: ROWS, status: "playing", guessCount: 3 } }) },
  "yoji-kimeru": { "yoji-kimeru-migrated-v2": "1", "yoji-kimeru-history-intermediate": JSON.stringify({ [today]: { guesses: Y.map(f=>f.guess), feedbacks: Y, status: "playing", guessCount: 3 } }) },
  "irodori": null,
};
const [w, h, f] = process.argv.slice(2).map(Number);
const target = () => document.querySelector("main header").nextElementSibling;
for (const [game, seed] of Object.entries(G)) for (const how of ["reload", "back"]) for (const pos of ["legend", "center"]) {
  const res = [];
  for (let i = 0; i < 3; i++) {
    const o = await open({ width: w, height: h, font: f, storage: seed }); const p = o.page;
    try {
      await p.goto(`${BASE}/play/${game}`, { waitUntil: "load" }); await settle(p, 1200);
      const q = () => p.evaluate(`(${target})().getBoundingClientRect().top|0`);
      const hasLg = await p.evaluate((pos) => { const lg = document.querySelector("main ul[class*=legend]"); if (pos === "legend" && lg) lg.scrollIntoView({ block: "start" }); else { const t = document.querySelector("main header").nextElementSibling; t.scrollIntoView({ block: "center" }); } return !!lg; }, pos);
      await p.waitForTimeout(300);
      const t0 = await q();
      if (how === "reload") await p.reload({ waitUntil: "load" });
      else { await p.goto(`${BASE}/play`, { waitUntil: "load" }); await p.waitForTimeout(500); await p.goBack({ waitUntil: "load" }); }
      await settle(p, 1500);
      const t1 = await q(); const c = await cls(p);
      res.push(`${t1 - t0}px/cls${c.total}${hasLg ? "" : "(no legend)"}`);
    } catch (e) { res.push("ERR " + String(e).slice(0, 80)); }
    await close(o);
  }
  console.log(`${game} ${w}x${h} ${f}px ${how} ${pos}: ${res.join(" ")}`);
}
