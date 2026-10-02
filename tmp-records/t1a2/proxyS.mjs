// C-static prototype proxy: serves the before build (localhost:3000) with fonts replaced by
// per-page static subsets chosen from a build-time manifest (no runtime subsetting, no char collection in the browser).
// usage: node proxyS.mjs <port> <display: optional|swap> [fontDelayMs]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const [, , portArg, display = "optional", delayArg = "0"] = process.argv;
const FONT_DELAY = parseInt(delayArg, 10);
const INLINE = process.env.INLINE === "1";
const dataUri = (f) => "data:font/woff2;base64," + fs.readFileSync(DIR + f).toString("base64");
const DIR = new URL("./varS/", import.meta.url).pathname;
const UP = "http://localhost:3000";
const FONT_CHUNK = "/_next/static/chunks/3oowozwf2g6q4.css";
const man = JSON.parse(fs.readFileSync(DIR + "manifest.json", "utf8"));
const DEVICE_GOTHIC = `"Hiragino Kaku Gothic ProN","Yu Gothic Medium","Noto Sans JP","IPAGothic",sans-serif`;
const DEVICE_MINCHO = `"Hiragino Mincho ProN","Yu Mincho",serif`;
// Global CSS (shared, part of the site stylesheet). Page layers are declared per page in <head>.
const GLOBAL_CSS = `
@font-face{font-family:"Yolos Sans";font-weight:400;font-display:${display};src:url(/__f/yolos-sans-400.woff2)format("woff2");unicode-range:U+0000-007F}
@font-face{font-family:"Yolos Sans";font-weight:700;font-display:${display};src:url(/__f/yolos-sans-700.woff2)format("woff2");unicode-range:U+0000-007F}
html{--font-mincho:"Yolos Sans","P Zen","Q Zen","R Zen",${DEVICE_MINCHO}!important;--font-gothic:"Yolos Sans","P BIZ","Q BIZ","R BIZ",${DEVICE_GOTHIC}!important;--font-number:"Yolos Sans","P BIZ","Q BIZ","R BIZ",${DEVICE_GOTHIC}!important}
button,select{font-family:inherit}
input,textarea{font-family:"Yolos Sans",${DEVICE_GOTHIC}}
html{font-synthesis-weight:none}
h1,h2,h3,h4,h5,h6{font-weight:400!important}
`;
const FAM = { zen: ["Zen", 400], biz400: ["BIZ", 400], biz700: ["BIZ", 700] };
const esc = (s) => [...s].map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase()).join(",");
function headFor(key) {
  const m = man[key];
  if (!m) return null;
  let links = `<link rel="preload" href="/__f/yolos-sans-400.woff2" as="font" type="font/woff2" crossorigin=""/>`;
  if (m.bold_ascii) links += `<link rel="preload" href="/__f/yolos-sans-700.woff2" as="font" type="font/woff2" crossorigin=""/>`;
  let css = "";
  const layer = (prefix, set, prio) => {
    for (const [k, v] of Object.entries(set || {})) {
      if (!v) continue;
      const [fam, w] = FAM[k];
      const inl = INLINE && prefix === "P";
      css += `@font-face{font-family:"${prefix} ${fam}";font-weight:${w};font-display:${display};src:url(${inl ? dataUri(v.file) : "/__f/" + v.file})format("woff2");unicode-range:${esc(v.chars)}}`;
      if (inl) continue;
      if (prio) links += `<link rel="preload" href="/__f/${v.file}" as="font" type="font/woff2" crossorigin=""${prio === "low" ? ' fetchpriority="low"' : ""}/>`;
    }
  };
  layer("P", m.page, "high");
  layer("Q", m.questions, "low");
  layer("R", m.results, null);
  let script = "";
  if (m.results) {
    // Fetched when the visitor starts the quiz; independent of the answers.
    const files = Object.values(m.results).filter(Boolean).map((v) => v.file);
    script = `<script>document.addEventListener("click",function h(e){var b=e.target.closest("button");if(!b||b.textContent.trim()!=="はじめる")return;document.removeEventListener("click",h,true);${JSON.stringify(files)}.forEach(function(f){var l=document.createElement("link");l.rel="preload";l.as="font";l.type="font/woff2";l.crossOrigin="";l.href="/__f/"+f;document.head.appendChild(l)});},true)</script>`;
  }
  return { head: links + `<style>${css}</style>`, script };
}

function send(req, res, status, headers, body) {
  const ae = req.headers["accept-encoding"] || "";
  const h = { ...headers };
  delete h["content-length"]; delete h["content-encoding"]; delete h["transfer-encoding"];
  if (h["link"]) { h["link"] = h["link"].split(/,\s*(?=<)/).filter((x) => !/\/_next\/static\/media\/.*woff2/.test(x)).join(", "); if (!h["link"]) delete h["link"]; }
  if (/gzip/.test(ae)) { body = zlib.gzipSync(body); h["content-encoding"] = "gzip"; h["vary"] = "Accept-Encoding"; }
  h["content-length"] = body.length;
  res.writeHead(status, h); res.end(body);
}
async function fetchUp(req) {
  const headers = { ...req.headers, "accept-encoding": "identity", host: "localhost:3000" };
  const r = await fetch(UP + req.url, { method: req.method, headers, redirect: "manual" });
  const buf = Buffer.from(await r.arrayBuffer());
  const h = {}; r.headers.forEach((v, k) => (h[k] = v));
  return { status: r.status, headers: h, body: buf };
}
http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://x");
    if (u.pathname.startsWith("/__f/")) {
      const f = path.join(DIR, path.basename(u.pathname));
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      const b = fs.readFileSync(f);
      const go = () => { res.writeHead(200, { "content-type": "font/woff2", "cache-control": "public, max-age=31536000, immutable", "accept-ranges": "bytes", etag: '"' + b.length.toString(16) + '"', "content-length": b.length }); res.end(b); };
      return FONT_DELAY ? setTimeout(go, FONT_DELAY) : go();
    }
    const isCss = u.pathname === FONT_CHUNK;
    const maybeHtml = !u.pathname.startsWith("/_next/") && !/\.[a-z0-9]+$/i.test(u.pathname);
    if (isCss || maybeHtml) {
      const up = await fetchUp(req);
      const ct = up.headers["content-type"] || "";
      if (isCss) return send(req, res, up.status, up.headers, Buffer.from(up.body.toString("utf8").replace(/@font-face\{[^}]*\}/g, "") + GLOBAL_CSS));
      if (/text\/html/.test(ct)) {
        let html = up.body.toString("utf8")
          .replace(/<link rel="preload" href="\/_next\/static\/media\/[^"]+" as="font"[^>]*>/g, "")
          .replace(/:HL\[\\"\/_next\/static\/media\/[^\]]*?\.woff2\\",\\"font\\",\{[^}]*\}\]\\n/g, "");
        const hf = headFor(decodeURIComponent(u.pathname));
        if (hf) {
          html = html.replace('<meta charSet="utf-8"/>', '<meta charSet="utf-8"/>' + hf.head);
          if (hf.script) html = html.replace("</body>", hf.script + "</body>");
        }
        return send(req, res, up.status, up.headers, Buffer.from(html));
      }
      if (/text\/x-component/.test(ct)) {
        const rsc = up.body.toString("utf8").replace(/:HL\["\/_next\/static\/media\/[^\]]*?\.woff2","font",\{[^}]*\}\]\n/g, "");
        return send(req, res, up.status, up.headers, Buffer.from(rsc));
      }
      return send(req, res, up.status, up.headers, up.body);
    }
    const headers = { ...req.headers, host: "localhost:3000" };
    const pr = http.request(UP + req.url, { method: req.method, headers }, (ur) => { res.writeHead(ur.statusCode, ur.headers); ur.pipe(res); });
    pr.on("error", () => { res.writeHead(502); res.end(); });
    req.pipe(pr);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}).listen(parseInt(portArg, 10));
