// Build-time step of C-static (prototype): per-page subsets -> content-hashed static files + manifest.
import fs from "node:fs"; import crypto from "node:crypto";
import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const F = "/home/user/yolo-web/tmp/t1a/full/";
const faces = { zen: openFace(F + "ZenAntique-Regular.ttf"), biz400: openFace(F + "BIZUDPGothic-Regular.ttf"), biz700: openFace(F + "BIZUDPGothic-Bold.ttf") };
const roles = JSON.parse(fs.readFileSync("roles.json", "utf8"));
const flow = JSON.parse(fs.readFileSync("flowroles.json", "utf8"))["flow-first.json"];
const pages = JSON.parse(fs.readFileSync("../t1a/five.jsonl", "utf8").split("\n")[0] ? "[]" : "[]");
const urls = ["/play/character-personality", "/play/character-personality/result/blazing-strategist", "/tools/char-count", "/dictionary/kanji/哀", "/blog/sql-cheatsheet", "/tools/email-validator", "/tools/traditional-color-palette"];
async function file(k, text) {
  if (!text) return null;
  const b = await toWoff2(subsetTTF(faces[k], text));
  const name = `${k}-${crypto.createHash("sha1").update(b).digest("hex").slice(0, 12)}.woff2`;
  fs.writeFileSync("varS/" + name, b);
  return { file: name, chars: text, bytes: b.length };
}
const man = {};
for (const u of urls) {
  const r = roles[u]; man[u] = { page: {} };
  for (const k of ["zen", "biz400", "biz700"]) man[u].page[k] = await file(k, r[k]);
}
// play page: questions layer (data-determined, independent of answers) and results layer (all 24 types; fetched on start)
const q = flow.qnew;
man["/play/character-personality"].questions = { zen: await file("zen", q.zen), biz400: await file("biz400", q.biz400) };
const U = { zen: new Set(), biz400: new Set(), biz700: new Set() };
const base = flow["intro+q"];
for (const [u, r] of Object.entries(roles)) if (/^\/play\/character-personality\/result\/[a-z-]+$/.test(u)) for (const k in U) for (const c of r[k]) if (!base[k].includes(c)) U[k].add(c);
man["/play/character-personality"].results = {};
for (const k in U) man["/play/character-personality"].results[k] = await file(k, [...U[k]].sort().join(""));
fs.writeFileSync("varS/manifest.json", JSON.stringify(man));
for (const [u, m] of Object.entries(man)) console.log(u, JSON.stringify(Object.fromEntries(Object.entries(m).map(([l, o]) => [l, Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v && v.bytes]))]))));
