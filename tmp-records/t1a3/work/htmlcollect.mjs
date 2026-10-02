// Chromium-free collection: roles decided from markup only (h1-h6 -> zen; strong/b/th -> biz700; else biz400).
// Visible and hidden text alike; script/style/code/pre/textarea/input/svg are skipped; RSC payload is ignored.
import fs from "node:fs";
import { Parser } from "/home/user/yolo-web/node_modules/htmlparser2/dist/esm/index.js";
const idx = fs.readFileSync("html/index.txt", "utf8").split("\n").filter(Boolean).map((l) => l.split(" "));
const out = {};
for (const [u, h] of idx) {
  const html = fs.readFileSync(`html/${h}.html`, "utf8");
  const stack = []; const res = { chrome: {}, page: {} };
  const SKIP = new Set(["script", "style", "code", "pre", "textarea", "svg", "noscript", "template", "title"]);
  const p = new Parser({
    onopentag(name, attrs) { stack.push({ name, attrs }); },
    onclosetag() { stack.pop(); },
    ontext(t) {
      if (stack.some((s) => SKIP.has(s.name))) return;
      if (!stack.some((s) => s.name === "body")) return;
      const inMain = stack.some((s) => s.name === "main");
      const inChrome = stack.some((s) => s.name === "header" || s.name === "footer") && !inMain;
      if (!inMain && !inChrome) return;
      const role = stack.some((s) => /^h[1-6]$/.test(s.name)) ? "zen" : stack.some((s) => ["strong", "b", "th"].includes(s.name)) ? "biz700" : "biz400";
      const g = res[inMain ? "page" : "chrome"];
      for (const c of t) if (c.codePointAt(0) >= 0x80 && !/\s/.test(c)) (g[role] = g[role] || new Set()).add(c);
    },
  }, { decodeEntities: true });
  p.write(html); p.end();
  for (const g of Object.values(res)) for (const k in g) g[k] = [...g[k]].sort().join("");
  out[u] = res;
}
fs.writeFileSync("chars-html.json", JSON.stringify(out));
const br = JSON.parse(fs.readFileSync("chars.json", "utf8"));
for (const u in out) {
  const row = [];
  for (const k of ["zen", "biz400", "biz700"]) {
    const a = new Set(br[u].page[k] || ""), b = new Set(out[u].page[k] || "");
    const miss = [...a].filter((c) => !b.has(c)), extra = [...b].filter((c) => !a.has(c));
    row.push(`${k}: browser ${a.size} html ${b.size} missing ${miss.length}${miss.length ? "(" + miss.join("").slice(0, 20) + ")" : ""} extra ${extra.length}`);
  }
  console.log(u, "|", row.join(" | "));
}
