import { chromium } from "playwright";
const B = "http://localhost:3196";
const out = "/home/user/yolo-web/tmp/cycle-316/rv36/";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
async function mk(w, h, scheme = "light", zoom = false) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  const page = await ctx.newPage();
  if (zoom) { const cdp = await ctx.newCDPSession(page); await cdp.send("Page.enable"); await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } }); }
  return { ctx, page };
}
const LISTS = { "/tools": "ツールの一覧", "/play": "遊びの一覧" };
const mode = process.argv[2] || "all";
if (mode === "all" || mode === "shots") {
  for (const p of Object.keys(LISTS)) for (const [w, h] of [[320, 667], [375, 667], [1280, 800]]) for (const s of ["light", "dark"]) {
    const { ctx, page } = await mk(w, h, s);
    await page.goto(B + p, { waitUntil: "networkidle" });
    const n = p.slice(1);
    await page.screenshot({ path: `${out}${n}_${w}_${s}_fv.png` });
    if (w !== 320 || s === "light") await page.screenshot({ path: `${out}${n}_${w}_${s}_full.png`, fullPage: true });
    await ctx.close();
  }
}
if (mode === "all" || mode === "layout") {
  for (const p of Object.keys(LISTS)) for (const [w, h, zoom] of [[320, 667, false], [375, 667, false], [1280, 800, false], [320, 667, true], [375, 667, true], [1280, 800, true]]) for (const s of ["light"]) {
    const { ctx, page } = await mk(w, h, s, zoom);
    await page.goto(B + p, { waitUntil: "networkidle" });
    const r = await page.evaluate((label) => {
      const txtLeft = (el) => { if (!el) return null; const rg = document.createRange(); rg.selectNodeContents(el); const rs = rg.getClientRects(); return rs.length ? Math.round(rs[0].left) : null; };
      const q = (s) => document.querySelector(s);
      const ul = q(`ul[aria-label="${label}"]`);
      const lis = [...ul.children];
      const first = lis[0].getBoundingClientRect();
      const crumb = q('nav[aria-label="パンくずリスト"] a');
      const h1 = q("main h1");
      const intro = h1.nextElementSibling;
      const status = q('p[tabindex="-1"]');
      const input = q('input[type="search"]');
      const toggle = q('button[aria-expanded]');
      const toggleVisible = toggle && toggle.getBoundingClientRect().width > 0 && getComputedStyle(toggle).display !== "none";
      // container: find element with left border 3px
      const cont = [...document.querySelectorAll("body *")].find((el) => { const cs = getComputedStyle(el); return cs.borderLeftWidth === "3px" && cs.borderRightWidth === "3px" && el.getBoundingClientRect().height > 500; });
      const cr = cont ? cont.getBoundingClientRect() : null;
      const inner = cr ? { l: cr.left + 3, r: cr.right - 3 } : null;
      // overflow check: elements and text ranges within container inner
      const bad = [];
      for (const el of document.querySelectorAll("main *")) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.position === "absolute" && (cs.clip !== "auto" || b.width <= 1)) continue;
        if (inner && (b.left < inner.l - 0.5 || b.right > inner.r + 0.5)) bad.push("EL " + el.tagName + "." + (el.className?.baseVal ?? el.className) + " " + Math.round(b.left) + "-" + Math.round(b.right));
        for (const node of el.childNodes) if (node.nodeType === 3 && node.textContent.trim()) {
          const rg = document.createRange(); rg.selectNodeContents(node);
          for (const rb of rg.getClientRects()) if (inner && (rb.left < inner.l - 0.5 || rb.right > inner.r + 0.5)) bad.push("TX " + node.textContent.trim().slice(0, 12) + " " + Math.round(rb.left) + "-" + Math.round(rb.right));
        }
        if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && !["auto", "scroll", "hidden", "clip"].includes(cs.overflowX)) bad.push("SW " + el.tagName + "." + el.className + " " + el.scrollWidth + ">" + el.clientWidth);
      }
      const inter = [...document.querySelectorAll("main a, main button, main input, main label")].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && getComputedStyle(el).display !== "none"; });
      const small = inter.filter((el) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el, "::after"); return (b.height < 44 || b.width < 44) && !(el.dataset.hitArea === "after"); }).map((el) => el.tagName + ":" + (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 10) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height));
      const row = lis[0];
      const rowLink = row.querySelector("a");
      const after = getComputedStyle(rowLink, "::after");
      return {
        root: getComputedStyle(document.documentElement).fontSize,
        sw: document.documentElement.scrollWidth, iw: innerWidth,
        rows: lis.length, firstRow: { top: Math.round(first.top), bottom: Math.round(first.bottom), vh: innerHeight },
        cont: cr ? [Math.round(cr.left), Math.round(cr.right)] : null,
        lefts: { crumbText: txtLeft(crumb), crumbBox: crumb && Math.round(crumb.getBoundingClientRect().left), h1Text: txtLeft(h1), intro: txtLeft(intro), status: txtLeft(status), statusBox: Math.round(status.getBoundingClientRect().left), inputBorder: Math.round(input.getBoundingClientRect().left), toggleBox: toggle && Math.round(toggle.getBoundingClientRect().left), toggleText: toggle && txtLeft(toggle), ulBorder: Math.round(ul.getBoundingClientRect().left), rowText: txtLeft(rowLink) },
        h1: getComputedStyle(h1).fontSize, introText: intro.textContent, introLines: Math.round(intro.getBoundingClientRect().height / parseFloat(getComputedStyle(intro).lineHeight)),
        toggleVisible, toggleText: toggle && toggle.textContent, toggleH: toggle && Math.round(toggle.getBoundingClientRect().height),
        statusText: status.textContent,
        rowLinkAfter: after.content + " " + after.position,
        firstRowText: row.innerText.replace(/\n/g, " / "),
        bad: bad.slice(0, 12), badCount: bad.length, small: small.slice(0, 12),
      };
    }, LISTS[p]);
    console.log("LAYOUT", p, w, zoom ? "200%" : "100%", JSON.stringify(r));
    if (zoom) await page.screenshot({ path: `${out}${p.slice(1)}_${w}_200_full.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
