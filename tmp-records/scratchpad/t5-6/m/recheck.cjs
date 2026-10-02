const a = require(process.argv[2]); const phr = require("./phr.json");
const bad = new Map();
for (const r of a) for (const c of r.crumbs) {
  const clean = (t) => t.replace(/⁠/g, "").replace(/ /g, " ");
  const text = clean(c.text), lines = c.lines.map(clean);
  if (lines.length < 2) continue;
  const p = phr[text]; const bounds = new Set(); let acc = 0;
  if (p) for (const ph of p.phrases) { acc += [...ph].length; bounds.add(acc); }
  [...text].forEach((ch, i) => { if (ch === " ") { bounds.add(i + 1); bounds.add(i); } });
  let pos = 0;
  for (const l of lines.slice(0, -1)) { pos += [...l].length; if (!bounds.has(pos)) { const k = `${r.width} ${lines.join("／")}`; bad.set(k, (bad.get(k) ?? 0) + 1); } }
}
console.log(bad.size ? [...bad].map(([k, v]) => `${k} (${v} pages)`).join("\n") : "no in-word breaks");
const lines = new Map();
for (const r of a) for (const c of r.crumbs) if (c.lines.length > 1) lines.set(`${r.width} ${c.lines.join("／")}`, 1);
console.log([...lines.keys()].join("\n"));
