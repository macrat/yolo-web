import { open, close, settle, URL, G, WRONG } from "./lib.mjs";
// after every keyboard check, is the focused element fully in the viewport?
const seqs = { win: [G[1], ["留袖", "文庫", "紬", "振袖"], ["振袖","留袖","訪問着","紬"], G[2], G[3], G[4]], lose: WRONG };
const res = [];
for (const [w, h] of [[320, 568], [375, 667], [1280, 800]]) for (const f of [16, 32]) for (const mode of ["win", "lose"]) for (const pos of ["center", "top", "bottom"]) {
  const o = await open({ width: w, height: h, font: f }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 600);
  const grid = p.getByRole("group", { name: "言葉の格子" });
  const log = [];
  for (const seq of seqs[mode]) {
    if (!(await grid.count())) break;
    for (const word of seq) { const b = grid.getByRole("button", { name: word, exact: true }); if (!(await b.count())) continue; await b.focus(); await p.keyboard.press("Space"); }
    const chk = p.getByRole("button", { name: "チェック" });
    if (await chk.isDisabled()) { await p.keyboard.press("Escape"); continue; }
    await chk.focus();
    await chk.evaluate((b, pos) => b.scrollIntoView({ block: pos === "top" ? "start" : pos === "bottom" ? "end" : "center" }), pos);
    await p.keyboard.press("Enter"); await p.waitForTimeout(250);
    const r = await p.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const vv = visualViewport; const inView = r.top >= 0 && r.bottom <= vv.height; const st = document.querySelector("[role=status]"); const s = st?.getBoundingClientRect(); return { el: (a.textContent || a.tagName).trim().slice(0, 10), top: Math.round(r.top), bottom: Math.round(r.bottom), vh: Math.round(vv.height), inView, fv: a.matches(":focus-visible"), status: s ? `${Math.round(s.top)}..${Math.round(s.bottom)}` : "-" }; });
    log.push(r);
  }
  const bad = log.filter((x) => !x.inView);
  res.push(`${w}x${h} ${f}px ${mode} ${pos}: checks ${log.length} notInView ${bad.length} ${bad.map((b) => JSON.stringify(b)).join(" ")} | ${log.map((x) => `${x.el}@${x.top}-${x.bottom}(st ${x.status})`).join(", ")}`);
  if (bad.length) await p.screenshot({ path: `shots/kb-bad-${w}-${h}-${f}-${mode}-${pos}.png` });
  await close(o);
}
console.log(res.join("\n"));
