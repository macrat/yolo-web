import fs from "node:fs";
import { openFace, subsetTTF, toWoff2 } from "./hbsub.mjs";
const face = openFace("/home/user/yolo-web/tmp/t1a/full/IBMPlexSans%5Bwdth,wght%5D.ttf");
let ascii = ""; for (let c = 0x20; c < 0x7f; c++) ascii += String.fromCharCode(c);
const mode = process.argv[2];
if (mode === "ttf") for (const w of [400, 700]) fs.writeFileSync(`plex${w}.ttf`, subsetTTF(face, ascii, { pin: { wght: w, wdth: 100 } }));
else for (const f of process.argv.slice(3)) { const b = await toWoff2(fs.readFileSync(f)); fs.writeFileSync(f.replace(/\.ttf$/, ".woff2"), b); console.log(f, b.length); }
