import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const offs = (s) => { const r = new Set(); let i = 0; for (const p of s.split("|").slice(0, -1)) { i += [...p].length; r.add(i); } return r; };
for (const x of d) {
  if (process.argv[3] && x.mode !== process.argv[3]) continue;
  const a = offs(x.old), b = offs(x.new), chars = [...x.old.replaceAll("|", "")];
  const ch = [];
  for (const i of b) if (!a.has(i)) ch.push("+" + chars.slice(Math.max(0, i - 8), i).join("") + "／" + chars.slice(i, i + 8).join(""));
  for (const i of a) if (!b.has(i)) ch.push("-" + chars.slice(Math.max(0, i - 8), i).join("") + "／" + chars.slice(i, i + 8).join(""));
  console.log(x.mode.padEnd(8), x.kinds.join(",").padEnd(14), ch.join("  "));
}
