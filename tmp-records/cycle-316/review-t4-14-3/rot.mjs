import { open, close, cls, settle, URL, BASE, SEEDS } from "./lib.mjs";
const font = +process.argv[2]; const runs = +(process.argv[3] || 8);
const res = [];
for (let i = 0; i < runs; i++) {
  const o = await open({ width: 375, height: 667, font, storage: SEEDS.done, touch: true });
  const p = o.page; const r = {};
  try {
    await p.goto(URL, { waitUntil: "load" }); await settle(p);
    const H = p.getByRole("heading", { name: "この結果を共有" });
    const top = () => H.evaluate((b) => Math.round(b.getBoundingClientRect().top));
    await H.evaluate((b) => window.scrollBy(0, b.getBoundingClientRect().top - 100)); await p.waitForTimeout(300);
    await p.evaluate(() => { window.__cls = []; });
    await p.setViewportSize({ width: 667, height: 375 }); await p.waitForTimeout(800);
    r.rotCls = (await cls(p)).total; r.rotTop = await top();
    // reload in landscape
    await H.evaluate((b) => window.scrollBy(0, b.getBoundingClientRect().top - 100)); await p.waitForTimeout(300);
    await p.reload({ waitUntil: "load" }); await settle(p, 1500);
    r.landCls = (await cls(p)).total; r.landTop = await top();
    // rotate back, reload in portrait
    await p.setViewportSize({ width: 375, height: 667 }); await p.waitForTimeout(800);
    await H.evaluate((b) => window.scrollBy(0, b.getBoundingClientRect().top - 100)); await p.waitForTimeout(300);
    await p.reload({ waitUntil: "load" }); await settle(p, 1500);
    r.portCls = (await cls(p)).total; r.portTop = await top();
    r.lsKey = await p.evaluate(() => localStorage.getItem("irodori-result-height"));
  } catch (e) { r.err = String(e).slice(0, 150); }
  res.push(r); await close(o);
}
const f = (k) => res.map((r) => r[k]).join(" / ");
console.log(`font ${font}: rotate cls ${f("rotCls")} top ${f("rotTop")}\n  reload-landscape cls ${f("landCls")} top ${f("landTop")}\n  back-to-portrait reload cls ${f("portCls")} top ${f("portTop")}`);
console.log("  key", res[0].lsKey, res.filter(r=>r.err).map(r=>r.err).join("|"));
