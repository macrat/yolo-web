import fs from "node:fs";
import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const F = "/home/user/yolo-web/tmp/t1a/full/";
const faces = { zen: openFace(F + "ZenAntique-Regular.ttf"), biz400: openFace(F + "BIZUDPGothic-Regular.ttf"), biz700: openFace(F + "BIZUDPGothic-Bold.ttf") };
const fr = JSON.parse(fs.readFileSync("flowroles.json", "utf8"));
for (const [fn, sets] of Object.entries(fr)) {
  const row = { fn };
  for (const [part, r] of Object.entries(sets)) {
    let tot = 0, files = 0; const d = {};
    for (const k of ["zen", "biz400", "biz700"]) { if (!r[k]) continue; const n = (await toWoff2(subsetTTF(faces[k], r[k]))).length; d[k] = n; tot += n; files++; }
    row[part] = { tot, files, ...d };
  }
  console.log(JSON.stringify(row));
}
