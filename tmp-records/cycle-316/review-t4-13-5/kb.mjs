import { open, close, settle, URL, G, WRONG } from "./lib.mjs";
for (const [w, h, f] of [[320, 667, 16], [320, 667, 32], [1280, 800, 16]]) {
  const o = await open({ width: w, height: h, font: f }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  const log = [];
  const act = () => p.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return `${(a.getAttribute("aria-label") || a.textContent || a.tagName).trim().slice(0, 16)}@${Math.round(r.top)}-${Math.round(r.bottom)} fv=${a.matches(":focus-visible")}`; });
  // focus first grid button by tabbing from body
  await p.getByRole("group", { name: "言葉の格子" }).getByRole("button").first().focus();
  for (const seq of [G[1], ["留袖", "文庫", "紬", "振袖"], G[2], G[3], G[4]]) {
    
    // navigate with Tab to each word then Space
    for (const word of seq) {
      await p.getByRole("group", { name: "言葉の格子" }).getByRole("button", { name: word, exact: true }).focus();
      await p.keyboard.press("Space");
    }
    const vis = await p.evaluate(() => { const b = document.activeElement.getBoundingClientRect(); return Math.round(b.top) + "-" + Math.round(b.bottom); });
    const chk = await p.getByRole("button", { name: "チェック" }).evaluate((b) => { const r = b.getBoundingClientRect(); return `${Math.round(r.top)}-${Math.round(r.bottom)} vh=${innerHeight}`; });
    let t2 = 0;
    for (let i = 0; i < 40; i++) { const cur = await p.evaluate(() => document.activeElement.textContent.trim()); if (cur === "チェック") break; await p.keyboard.press("Tab"); t2++; }
    await p.keyboard.press("Enter"); await p.waitForTimeout(200);
    log.push(`last word ${vis} chk ${chk} tabsToCheck ${t2} -> focus ${await act()}`);
    if (!(await p.getByRole("group", { name: "言葉の格子" }).count())) break;
  }
  await p.screenshot({ path: `shots/kb-end-${w}-${f}.png` });
  console.log(w, f, "\n  " + log.join("\n  "));
  await close(o);
}
