// usage: node allsizes.mjs <shard> <nshards>  -> sizes-<shard>.jsonl
import fs from "node:fs";
import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const [shard, n] = process.argv.slice(2).map(Number);
const F = "/home/user/yolo-web/tmp/t1a/full/";
const faces = { zen: openFace(F + "ZenAntique-Regular.ttf"), biz400: openFace(F + "BIZUDPGothic-Regular.ttf"), biz700: openFace(F + "BIZUDPGothic-Bold.ttf") };
const roles = JSON.parse(fs.readFileSync("roles.json", "utf8"));
const urls = Object.keys(roles).filter((_, i) => i % n === shard);
const out = fs.createWriteStream(`sizes-${shard}.jsonl`);
const T0 = performance.now();
for (const u of urls) {
  const row = { url: u };
  for (const k of ["zen", "biz400", "biz700"]) {
    const t = roles[u][k];
    if (!t) { row[k] = 0; continue; }
    const w = await toWoff2(subsetTTF(faces[k], t));
    row[k] = w.length;
  }
  out.write(JSON.stringify(row) + "\n");
}
out.end();
console.error("shard", shard, "pages", urls.length, "sec", ((performance.now() - T0) / 1000).toFixed(1));
