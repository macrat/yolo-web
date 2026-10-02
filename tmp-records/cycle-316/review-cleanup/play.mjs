// node play.mjs <base> <game> <width> <run>  — キーボードで遊び、各操作の scrollBy と scrollY、console の誤りを記録する
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [BASE, GAME, W, RUN, MODE = "natural"] = process.argv.slice(2);
// MODE=top: 操作の前に、フォーカスを置いたまま画面を先頭へ戻し、次に使うコントロールを画面の外に出す
const H = +W < 700 ? 568 : 800;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = { mode: MODE, game: GAME, w: +W, run: +RUN, steps: [], errors: [], reopen: null, copy: null };
try {
  const ctx = await browser.newContext({ viewport: { width: +W, height: H } });
  await ctx.route(/google|doubleclick|adsbygoogle/, (r) => r.abort());
  await ctx.addInitScript(() => {
    window.__sb = [];
    const orig = window.scrollBy.bind(window);
    window.scrollBy = (...a) => { window.__sb.push(typeof a[0] === "object" ? +(+a[0].top).toFixed(2) : a); return orig(...a); };
    try { delete Navigator.prototype.share; } catch {}
    window.__copied = [];
    document.addEventListener("copy", () => {
      const a = document.activeElement;
      const t = a && "value" in a && a.selectionEnd > a.selectionStart ? a.value.slice(a.selectionStart, a.selectionEnd) : String(getSelection());
      window.__copied.push({ len: t.length, head: t.slice(0, 30), parent: a?.parentElement?.tagName });
    }, true);
  });
  const p = await ctx.newPage();
  p.setDefaultTimeout(10000);
  p.on("console", (m) => { if (m.type() === "error") out.errors.push(m.text().slice(0, 200)); });
  p.on("response", (r) => { if (r.status() >= 400) out.errors.push(r.status() + " " + r.url().replace(BASE, "")); });
  p.on("pageerror", (e) => out.errors.push("pageerror " + String(e).slice(0, 200)));
  await p.goto(`${BASE}/play/${GAME}`, { waitUntil: "load", timeout: 30000 });
  await p.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]));
  await sleep(1200);
  const rec = async (action) => {
    await sleep(700);
    const s = await p.evaluate(() => { const r = { sb: window.__sb.slice(), y: Math.round(scrollY * 10) / 10, focus: (document.activeElement?.textContent || document.activeElement?.tagName || "").trim().slice(0, 8) }; window.__sb.length = 0; return r; });
    out.steps.push({ action, ...s });
  };
  const put = async (loc) => { if (MODE === "top") { await loc.evaluate((el) => { el.focus({ preventScroll: true }); window.scrollTo(0, 0); }); await sleep(200); await p.evaluate(() => { window.__sb.length = 0; }); } else await loc.focus(); };
  await rec("load");
  if (GAME === "kanji-kanaru" || GAME === "yoji-kimeru") {
    const words = GAME === "kanji-kanaru" ? ["山", "川", "木", "火", "水", "金"] : ["一石二鳥", "勝手気儘", "百戦錬磨", "一期一会", "以心伝心", "花鳥風月"];
    for (const wd of words) {
      const inp = p.locator("main input").first();
      if (!(await inp.count()) || (await inp.isDisabled())) break;
      await inp.focus(); await p.keyboard.insertText(wd); await put(inp); await p.keyboard.press("Enter");
      await p.waitForFunction(() => { const b = [...document.querySelectorAll("button")].find((x) => /送信/.test(x.textContent)); return !b || !b.textContent.includes("送信中"); }, null, { timeout: 15000 }).catch(() => {});
      await sleep(800);
      await rec("guess " + wd);
    }
  } else if (GAME === "nakamawake") {
    const WRONG = [["袖", "振袖", "お太鼓", "絹"], ["襟", "留袖", "文庫", "紬"], ["帯", "訪問着", "角出し", "縮緬"], ["裾", "浴衣", "貝の口", "銘仙"]];
    const grid = p.getByRole("group", { name: "言葉の格子" });
    for (const seq of WRONG) {
      if (!(await grid.count())) break;
      for (const word of seq) { const b = grid.getByRole("button", { name: word, exact: true }); if (!(await b.count())) continue; await put(b); await p.keyboard.press("Space"); await rec("sel " + word); }
      const chk = p.getByRole("button", { name: "チェック" });
      if (await chk.isDisabled()) break;
      await put(chk); await p.keyboard.press("Enter"); await sleep(1500); await rec("check");
    }
  } else if (GAME === "irodori") {
    for (let r = 0; r < 5; r++) {
      const s = p.getByRole("slider", { name: "明度" }); await put(s); await p.keyboard.press("PageUp"); await rec("slider r" + r);
      await put(p.getByRole("button", { name: "決定" })); await p.keyboard.press("Enter"); await rec("decide r" + r);
      if (r < 4) { await put(p.getByRole("button", { name: "次の問題へ" })); await p.keyboard.press("Enter"); await rec("next r" + r); }
    }
  }
  // 結果の区画の中からコピー（クリップボードの API を拒ませる）
  await sleep(1000);
  await p.evaluate(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("denied")) } }); });
  const copyBtn = p.locator("main button", { hasText: /コピー/ }).first();
  if (await copyBtn.count()) {
    await copyBtn.scrollIntoViewIfNeeded(); await sleep(300);
    const y0 = await p.evaluate(() => scrollY);
    await copyBtn.focus(); await p.keyboard.press("Enter"); await sleep(600);
    const st = await p.evaluate(() => [...document.querySelectorAll("main [role=status]")].map((s) => s.textContent.trim()).filter(Boolean).join("|"));
    const r = await p.evaluate(() => ({ copied: window.__copied, y: scrollY, left: document.querySelectorAll("body > textarea").length, focus: document.activeElement?.textContent?.trim().slice(0, 10) }));
    out.copy = { label: (await copyBtn.textContent()).trim(), status: st, ...r, dy: r.y - y0 };
  }
  await p.reload({ waitUntil: "load" }); await sleep(2500);
  out.reopen = await p.evaluate(() => ({ y: scrollY, share: [...document.querySelectorAll("h2,h3")].some((h) => h.textContent.includes("共有")), text: document.querySelector("main")?.innerText.slice(0, 0) }));
  await ctx.close();
} catch (e) { out.fatal = String(e).slice(0, 300); }
finally { await browser.close(); }
console.log(JSON.stringify(out));
