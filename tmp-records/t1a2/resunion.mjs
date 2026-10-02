import fs from "node:fs";
import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const F = "/home/user/yolo-web/tmp/t1a/full/";
const faces = { zen: openFace(F + "ZenAntique-Regular.ttf"), biz400: openFace(F + "BIZUDPGothic-Regular.ttf"), biz700: openFace(F + "BIZUDPGothic-Bold.ttf") };
const roles = JSON.parse(fs.readFileSync("roles.json", "utf8"));
const fr = JSON.parse(fs.readFileSync("flowroles.json", "utf8"))["flow-first.json"]["intro+q"];
const U = { zen: new Set(), biz400: new Set(), biz700: new Set() };
let n = 0;
for (const [u, r] of Object.entries(roles)) if (/^\/play\/character-personality\/result\/[a-z-]+$/.test(u)) { n++; for (const k in U) for (const c of r[k]) U[k].add(c); }
let tot = 0; const d = {};
for (const k in U) { const s = [...U[k]].filter((c) => !fr[k].includes(c)).join(""); d[k] = [s.length]; if (s) { const b = (await toWoff2(subsetTTF(faces[k], s))).length; d[k].push(b); tot += b; } }
console.log("result pages", n, JSON.stringify(d), "total new bytes", tot);
