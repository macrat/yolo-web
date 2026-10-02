import fs from "node:fs";
import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const F = "/home/user/yolo-web/tmp/t1a/full/";
const faces = { zen: openFace(F + "ZenAntique-Regular.ttf"), biz400: openFace(F + "BIZUDPGothic-Regular.ttf"), biz700: openFace(F + "BIZUDPGothic-Bold.ttf") };
const roles = JSON.parse(fs.readFileSync("roles.json", "utf8"));
const pages = process.argv.slice(2);
for (const u of pages) {
  const r = roles[u]; const row = { url: u };
  for (const k of ["zen", "biz400", "biz700"]) {
    if (!r[k]) { row[k] = 0; continue; }
    const t0 = performance.now(); const ttf = subsetTTF(faces[k], r[k]); const t1 = performance.now(); const w = await toWoff2(ttf); const t2 = performance.now();
    row[k] = w.length; row[k + "_n"] = [...r[k]].length; row[k + "_ms"] = [Math.round(t1 - t0), Math.round(t2 - t1)];
  }
  console.log(JSON.stringify(row));
}
