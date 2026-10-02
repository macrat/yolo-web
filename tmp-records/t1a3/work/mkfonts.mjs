// Build step (prototype): per-page and chrome subsets -> content-hashed static files + manifest.
// Families: chrome (header/footer; same file on every page) and one family per page (unique name).
import fs from "node:fs"; import crypto from "node:crypto";
import { openFace, subsetTTF, toWoff2 } from "../../t1a2/hbsub.mjs";
const F = "/home/user/yolo-web/tmp/t1a/full/";
const OUT = "/home/user/yolo-web/tmp/t1a3/site/public/__pf/";
fs.mkdirSync(OUT, { recursive: true });
const src = {
  p: { zen: F + "ZenAntique-Regular.ttf", biz400: F + "BIZUDPGothic-Regular.ttf", biz700: F + "BIZUDPGothic-Bold.ttf" },
  ud: { zen: F + "ZenAntique-Regular.ttf", biz400: F + "BIZUDGothic-Regular.ttf", biz700: F + "BIZUDGothic-Bold.ttf" },
};
const faces = {}; for (const v in src) { faces[v] = {}; for (const k in src[v]) faces[v][k] = openFace(src[v][k]); }
const chars = JSON.parse(fs.readFileSync("chars.json", "utf8"));
const flow = JSON.parse(fs.readFileSync("../../t1a2/flowroles.json", "utf8"))["flow-first.json"];
const h = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
async function file(v, k, text) {
  if (!text) return null;
  const b = await toWoff2(subsetTTF(faces[v][k], text));
  const name = `${v === "ud" && k !== "zen" ? "ud" : ""}${k}-${h(b)}.woff2`;
  fs.writeFileSync(OUT + name, b);
  return { file: name, chars: text, bytes: b.length };
}
const man = { p: {}, ud: {} };
for (const v of ["p", "ud"]) {
  const ch = chars["/tools/char-count"].chrome;
  man[v].__chrome = { zen: await file(v, "zen", ch.zen), biz400: await file(v, "biz400", ch.biz400) };
  for (const [u, o] of Object.entries(chars)) {
    const e = { fam: "pf" + h(u), page: {} };
    for (const k of ["zen", "biz400", "biz700"]) e.page[k] = await file(v, k, o.page[k]);
    man[v][u] = e;
  }
  // play page: question layer and result layer (same family, unicode-range layers)
  const pp = man[v]["/play/character-personality"];
  const has = (k, c) => (chars["/play/character-personality"].page[k] || "").includes(c);
  const minus = (k, s) => [...(s || "")].filter((c) => c.codePointAt(0) >= 0x80 && !has(k, c)).join("");
  pp.q = { zen: await file(v, "zen", minus("zen", flow.qnew.zen)), biz400: await file(v, "biz400", minus("biz400", flow.qnew.biz400)) };
  const qset = (k) => new Set([...(chars["/play/character-personality"].page[k] || ""), ...(flow.qnew[k] || "")]);
  const R = { zen: new Set(), biz400: new Set(), biz700: new Set() };
  for (const [u, o] of Object.entries(JSON.parse(fs.readFileSync("../../t1a2/roles.json", "utf8"))))
    if (/^\/play\/character-personality\/result\/[a-z-]+$/.test(u)) for (const k in R) for (const c of o[k] || "") if (c.codePointAt(0) >= 0x80 && !qset(k).has(c)) R[k].add(c);
  pp.r = {}; for (const k in R) pp.r[k] = await file(v, k, [...R[k]].sort().join(""));
}
fs.mkdirSync("/home/user/yolo-web/tmp/t1a3/site/fontbuild", { recursive: true });
fs.writeFileSync("/home/user/yolo-web/tmp/t1a3/site/fontbuild/manifest.json", JSON.stringify(man));
for (const v in man) for (const [u, m] of Object.entries(man[v])) console.log(v, u, JSON.stringify(Object.fromEntries(Object.entries(m).filter(([l]) => l !== "fam").map(([l, o]) => [l, Object.fromEntries(Object.entries(o).map(([k, x]) => [k, x && x.bytes]))]))));
