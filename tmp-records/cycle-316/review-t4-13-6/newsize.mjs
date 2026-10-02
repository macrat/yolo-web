import { open, close, settle, URL, BASE, SEEDS } from "./lib.mjs";
const out = [];
for (const [a, b] of [[[375, 667], [320, 568]], [[320, 568], [375, 667]], [[375, 667], [1280, 800]], [[1280, 800], [375, 667]], [[1280, 800], [1440, 900]], [[375,667],[414,896]]]) for (const f of [16, 32]) {
  const rs = [];
  for (let i = 0; i < 8; i++) {
  const o = await open({ width: a[0], height: a[1], font: f, storage: SEEDS.won }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
  await p.goto(BASE + "/play/kanji-kanaru", { waitUntil: "load" });
  await p.setViewportSize({ width: b[0], height: b[1] });
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 1500);
  const r = await p.evaluate(() => { const pos = window.__pos; const f1 = pos.find((x) => x[1][2] !== null)?.[1][2]; const s1 = pos.find((x) => x[1][1] !== null)?.[1][1]; const L = pos[pos.length - 1][1]; return { how: L[2] - f1, share: L[1] - s1, cls: +window.__cls.filter((e) => !e.input).reduce((s, e) => s + e.v, 0).toFixed(4) }; });
  rs.push(`${r.how}/${r.share}/${r.cls}`);
  await close(o);
  }
  out.push(`${a}->${b} ${f}px (howOff/shareOff/cls): ${rs.join(" ")}`); console.log(out.at(-1));
}
