import sharp from "sharp";
import fs from "node:fs";
const dir = new URL(".", import.meta.url).pathname;
for (const f of fs.readdirSync(dir + "shots-before").sort()) {
  const [a, b] = await Promise.all(["before", "after"].map((l) => sharp(`${dir}shots-${l}/${f}`).raw().toBuffer({ resolveWithObject: true })));
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) { console.log(f, "SIZE", a.info.width, a.info.height, b.info.width, b.info.height); continue; }
  const w = a.info.width, c = a.info.channels; let n = 0, minY = 1e9, maxY = -1;
  for (let i = 0; i < a.data.length; i += c) if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) { n++; const y = Math.floor(i / c / w); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  console.log(f, n ? `diff ${n}px rows ${minY}-${maxY}` : "same", `${w}x${a.info.height}`);
}
