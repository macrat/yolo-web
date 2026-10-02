const a = require(process.argv[2]);
const bad = a.filter((r) => r.status !== 200); if (bad.length) console.log("non200", bad.map((r) => r.slug + "/" + r.id + " " + r.status));
for (const w of [375, 320]) {
  const rs = a.filter((r) => r.width === w);
  const crumbBad = rs.filter((r) => r.crumbBad.length);
  const bySlug = {};
  for (const r of rs) { const s = (bySlug[r.slug] ??= { navH: new Set(), cta: 0, crumbBad: new Set(), ctaLines: new Set(), ov: 0 }); s.navH.add(r.navH); s.cta = Math.max(s.cta, r.ctaBottom); r.crumbBad.forEach((b) => s.crumbBad.add(b)); s.ctaLines.add(r.ctaLines.length); s.ov = Math.max(s.ov, r.overflow); }
  console.log(`== ${w}: pages ${rs.length}, crumb-in-word pages ${crumbBad.length}, max ctaBottom ${Math.max(...rs.map((r) => r.ctaBottom))}, overflow>0 ${rs.filter((r) => r.overflow > 0).length}, navTop ${[...new Set(rs.map((r) => r.navTop))]}`);
  for (const [s, v] of Object.entries(bySlug)) console.log(`  ${s}: navH ${[...v.navH]} ctaMax ${v.cta} ctaLines ${[...v.ctaLines]} crumbBad ${[...v.crumbBad].join(" ; ")}`);
}
const cp = a.find((r) => r.width === 375 && r.slug === "character-personality");
const cps = a.filter((r) => r.width === 375 && r.slug === "character-personality").map((r) => r.shareTop - r.h1Bottom);
console.log("cp 375 h1->share", Math.min(...cps), Math.max(...cps), "first", cp.id, cp.shareTop - cp.h1Bottom);
