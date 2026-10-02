import fs from "fs";
import { splitIntoPhrases } from "./pb-copy";
const A = JSON.parse(fs.readFileSync("data-after-16.json", "utf8"));
const map: Record<string, string[]> = {};
for (const r of A) for (const h of r.headings) if (h.wbrAt.length || h.tag === "H1") {
  const t = h.text.trim(); (globalThis as any).__noWide = true; map[t] = splitIntoPhrases(t); (globalThis as any).__noWide = false;
}
fs.writeFileSync("base.json", JSON.stringify(map)); console.log(Object.keys(map).length);
