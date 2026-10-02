import { open, close, settle, URL, SEEDS } from "./lib.mjs";
for (const [w, h, f, dark, seed] of [[320, 568, 16, false, "first"], [375, 667, 32, true, "mid"], [1280, 800, 16, false, "first"], [1280, 800, 16, true, "won"]]) {
  const o = await open({ width: w, height: h, font: f, dark, storage: SEEDS[seed] }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  await p.screenshot({ path: `shots/v-${w}-${f}-${dark ? "d" : "l"}-${seed}.png` });
  await close(o);
}
