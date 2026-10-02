import fs from "node:fs"; import path from "node:path";
import { Parser } from "/home/user/yolo-web/node_modules/htmlparser2/dist/esm/index.js";
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith(".html")) files.push(p); } })(process.argv[2]);
const t0 = Date.now(); let chars = 0, bytes = 0;
for (const f of files) {
  const html = fs.readFileSync(f, "utf8"); bytes += html.length; const stack = []; const set = new Set();
  const p = new Parser({ onopentag(n) { stack.push(n); }, onclosetag() { stack.pop(); }, ontext(t) { if (stack.includes("script") || stack.includes("style")) return; for (const c of t) set.add(c); } }, { decodeEntities: true });
  p.write(html); p.end(); chars += set.size;
}
console.log(JSON.stringify({ files: files.length, MB: +(bytes / 1e6).toFixed(1), seconds: (Date.now() - t0) / 1000 }));
