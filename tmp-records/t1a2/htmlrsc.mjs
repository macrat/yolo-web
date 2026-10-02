// Fallback detector (no browser): all non-ASCII chars in HTML text + RSC flight scripts, headings from h1-h6 only.
import fs from "node:fs";
import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const F = "/home/user/yolo-web/tmp/t1a/full/";
const faces = { zen: openFace(F + "ZenAntique-Regular.ttf"), biz400: openFace(F + "BIZUDPGothic-Regular.ttf") };
const roles = JSON.parse(fs.readFileSync("roles.json", "utf8"));
const hr = JSON.parse(fs.readFileSync("htmlroles.json", "utf8"));
for (const u of Object.keys(hr).slice(0, 7).concat(["/blog/tag/漢字", "/blog/tag/Web開発/page/3"])) {
  const h = await (await fetch("http://localhost:3000" + encodeURI(u))).text();
  const scripts = [...h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("");
  let rsc = ""; try { rsc = scripts.replace(/\\u([0-9a-f]{4})/gi, (_, x) => String.fromCharCode(parseInt(x, 16))); } catch {}
  const all = new Set([...(hr[u].biz400 + hr[u].zen), ...rsc].filter((c) => c.codePointAt(0) >= 0x80 && !/\s/.test(c)));
  const zenS = hr[u].zen; const bodyS = [...all].join("");
  const ex = (roles[u].biz400 ? (await toWoff2(subsetTTF(faces.biz400, roles[u].biz400))).length : 0);
  const fb = (await toWoff2(subsetTTF(faces.biz400, bodyS))).length;
  console.log(u, "rendered biz400 chars", [...roles[u].biz400].length, ex, "| html+rsc body chars", all.size, fb, "extra bytes", fb - ex);
}
