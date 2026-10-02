import fs from "node:fs";
import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const F = "/home/user/yolo-web/tmp/t1a/full/";
const faces = { zen: openFace(F + "ZenAntique-Regular.ttf"), biz400: openFace(F + "BIZUDPGothic-Regular.ttf") };
const r = JSON.parse(fs.readFileSync("roles.json", "utf8"))["/tools/email-validator"];
for (const k of ["zen","biz400"]) {
  const a = (await toWoff2(subsetTTF(faces[k], r[k]))).length;
  const b = (await toWoff2(subsetTTF(faces[k], r[k], { nameIds: [1,2] }))).length;
  const c = (await toWoff2(subsetTTF(faces[k], r[k], { features: ["ccmp","locl","kern","mark","mkmk","palt","halt","chws","vert","vrt2","vkna","hwid","fwid","aalt","jp78","jp83","jp90","nlck","trad","ruby","hojo","nalt","expt","liga","dlig","frac","numr","dnom","sups","zero","ordn"] }))).length;
  console.log(k, "keep0-6,13,14:", a, " keep1,2 only:", b, " diff:", a-b, " all-features:", c);
}
