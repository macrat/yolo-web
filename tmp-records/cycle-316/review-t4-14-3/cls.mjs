import { open, close, cls, settle, rootPx, URL, BASE, SEEDS } from "./lib.mjs";
const [w, hh, font, scen, runs] = [+process.argv[2], +process.argv[3], +process.argv[4], process.argv[5], +(process.argv[6] || 8)];
// scen: first | reopen-mid | reopen-done | reload-mid | reload-done | back-mid | back-done | link-mid | link-done
const [act, kind = "first"] = scen.split("-");
const seed = SEEDS[kind];
const out = [];
for (let i = 0; i < runs; i++) {
  const o = await open({ width: w, height: hh, font, storage: seed });
  const p = o.page;
  try {
    // prime: the player saw today's page at this size before (records result height)
    if (kind !== "first") { await p.goto(URL, { waitUntil: "load", timeout: 30000 }); await settle(p); await p.goto(BASE + "/play/kanji-kanaru", { waitUntil: "load" }); }
    await p.goto(URL, { waitUntil: "load", timeout: 30000 }); await settle(p);
    const rp = await rootPx(p);
    let r = { rp };
    const idx = kind === "done" ? 1 : 0;
    if (act === "first" || act === "reopen") {
      const c = await cls(p);
      const pos = await p.evaluate(() => window.__pos);
      const firstVal = pos.find((x) => x[1][idx] !== null)?.[1][idx];
      const last = pos[pos.length - 1][1];
      const howFirst = pos.find((x) => x[1][2] !== null)?.[1][2];
      r = { ...r, cls: c.total, off: last[idx] - firstVal, howOff: last[2] - howFirst, src: c.src, dec: last[0] };
    } else {
      const loc = kind === "done" ? p.getByRole("heading", { name: "この結果を共有" }) : p.getByRole("button", { name: "決定" });
      await loc.evaluate((b) => { window.scrollTo(0, 0); window.scrollBy(0, b.getBoundingClientRect().top - 100); });
      await p.waitForTimeout(300);
      const t0 = await loc.evaluate((b) => Math.round(b.getBoundingClientRect().top));
      if (act === "reload") {
        await p.reload({ waitUntil: "load", timeout: 30000 });
      } else {
        if (act === "link") await p.evaluate(() => document.querySelector('main a[href="/play/kanji-kanaru"]').click());
        else await p.evaluate(() => { location.href = "/play/kanji-kanaru"; });
        await p.waitForURL("**/play/kanji-kanaru", { timeout: 15000 }); await p.waitForTimeout(1000);
        await p.evaluate(() => { window.__cls = []; });
        await p.goBack({ timeout: 15000 });
        await p.waitForURL("**/play/irodori", { timeout: 15000 });
        await p.evaluate(() => { if (!window.__cls) window.__cls = []; });
      }
      await settle(p, 2000);
      const c = await cls(p);
      const t1 = await loc.evaluate((b) => Math.round(b.getBoundingClientRect().top)).catch(() => null);
      const nav = await p.evaluate(() => performance.getEntriesByType("navigation")[0]?.type);
      r = { ...r, cls: c.total, off: t1 === null ? "gone" : t1 - t0, t0, nav, src: c.src };
    }
    out.push(r);
  } catch (e) { out.push({ err: String(e).slice(0, 150) }); }
  await close(o);
}
const f = (k) => out.map((r) => r[k]).join(" / ");
console.log(`${w}x${hh} ${font}px ${scen}: root ${[...new Set(out.map((r) => r.rp))]} | cls ${f("cls")} | off ${f("off")}${out[0].howOff !== undefined ? " | howOff " + f("howOff") + " | dec " + f("dec") : " | t0 " + f("t0")}${out[0].nav ? " | nav " + [...new Set(out.map((r) => r.nav))] : ""}`);
const srcs = [...new Set(out.map((r) => r.src).filter(Boolean))]; if (srcs.length) console.log("   src:", srcs.join(" || "));
const errs = out.filter((r) => r.err); if (errs.length) console.log("   ERR:", errs.map((e) => e.err).join(" || "));
