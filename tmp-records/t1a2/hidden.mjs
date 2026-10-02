import fs from "node:fs"; import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const F = "/home/user/yolo-web/tmp/t1a/full/";
const face = openFace(F + "BIZUDPGothic-Regular.ttf");
const roles = JSON.parse(fs.readFileSync("roles.json", "utf8")); const hr = JSON.parse(fs.readFileSync("htmlroles.json", "utf8"));
for (const u of Object.keys(hr).slice(0, 7)) {
  const rend = new Set([...roles[u].biz400]); const extra = [...new Set([...hr[u].biz400, ...hr[u].zen])].filter((c) => !rend.has(c) && !roles[u].zen.includes(c) && !roles[u].biz700.includes(c));
  const a = (await toWoff2(subsetTTF(face, [...rend].join("")))).length; const b = (await toWoff2(subsetTTF(face, [...rend].join("") + extra.join("")))).length;
  console.log(u, "hidden-in-HTML chars", extra.length, extra.join("").slice(0, 30), "+bytes", b - a);
}
