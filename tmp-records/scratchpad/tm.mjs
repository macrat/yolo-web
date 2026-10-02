import fs from "node:fs";
import { openFace, subsetTTF, toWoff2 } from "/home/user/yolo-web/tmp/t1a2/hbsub.mjs";
const faces = { zen: openFace("../t1a/full/ZenAntique-Regular.ttf"), biz400: openFace("full/BIZUDGothicY-Regular.ttf"), biz700: openFace("full/BIZUDGothicY-Bold.ttf") };
const all = {}; for (const l of fs.readFileSync("../t1a/all.jsonl", "utf8").split("\n").filter(Boolean)) { const o = JSON.parse(l); all[o.url] = o.chars; }
const ap = JSON.parse(fs.readFileSync("../t1a2/allpages.json", "utf8"));
const js = JSON.parse(fs.readFileSync("jschars-tools.json", "utf8")); const jr = JSON.parse(fs.readFileSync("jsxroles-tools.json", "utf8"));
const jp = (s) => [...new Set(s)].filter((c) => c.codePointAt(0) > 0x7e && !/\s/.test(c));
const size = async (k, cs) => cs.length ? (await toWoff2(subsetTTF(faces[k], cs.join("")))).length : 0;
const CONST = 2.8 * 1024 + 4.5 * 1024; // chrome subset grows by the root-chunk strings; fallback @font-face in the global CSS
const rows = [];
for (const slug of fs.readFileSync("tools.txt", "utf8").split("\n").filter((s) => s && s !== "generated")) {
  const u = "/tools/" + slug, c = all[u]; if (!c || !ap[u]) continue;
  const r = jr[u] || { zen: "", biz400: "", biz700: "" };
  const base = { zen: jp((c["H:400"] || "") + (c["H:700"] || "")), biz400: jp(c["B:400"] || ""), biz700: jp(c["B:700"] || "") };
  const inMarkup = new Set(Object.values(c).join("")); const unk = [...r.biz400].filter((ch) => !inMarkup.has(ch)).join("");
  const want = { zen: jp(base.zen.join("") + r.zen + (process.env.ALLROLES ? r.biz400 : process.env.UNK ? unk : "")), biz400: jp(base.biz400.join("") + r.biz400 + "年月日時分秒曜" + (u === "/tools/yoji-search" && process.env.EXCL ? [...js[u].chars].filter((ch) => new Set(Object.values(c).join("") + Object.values(r).join("")).has(ch)).join("") : js[u].chars)), biz700: base.biz700.length || r.biz700 ? jp(base.biz700.join("") + r.biz700 + (process.env.ALLROLES ? r.biz400 : process.env.UNK ? unk : "")) : [] };
  let add = 0; for (const k of ["zen", "biz400", "biz700"]) add += (await size(k, want[k])) - (await size(k, base[k]));
  const oldDiff = ap[u].after - ap[u].before; // negative = fewer bytes than before (web fonts only, previous full-page calculation)
  rows.push([u, (oldDiff / 1024).toFixed(1), (add / 1024).toFixed(1), ((oldDiff + add + CONST) / 1024).toFixed(1)]);
}
rows.sort((a, b) => b[3] - a[3]);
for (const r of rows.slice(0,6)) console.log(r.join("\t"));
fs.writeFileSync("/tmp/claude-0/-home-user-yolo-web/7ec6fd95-5319-581a-b78e-9e5ca394946c/scratchpad/tm.json", JSON.stringify(rows));
