import fs from "node:fs"; import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const f = openFace("/home/user/yolo-web/tmp/t1a/full/BIZUDPGothic-Regular.ttf");
const jis = fs.readFileSync("jis1.txt", "utf8");
console.log("JIS X 0208 non-kanji+level1 chars", [...jis].length, "woff2", (await toWoff2(subsetTTF(f, jis))).length);
