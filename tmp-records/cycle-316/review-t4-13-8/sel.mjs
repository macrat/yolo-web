import { open, close, settle, URL, G } from "./lib.mjs";
for (const w of [320, 375]) for (const f of [16, 24, 32]) {
  const o = await open({ width: w, height: w === 320 ? 568 : 667, font: f }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 800);
  const res = [];
  for (const words of [G[1], [G[2][0], G[3][0], G[4][0], G[2][1]]]) {
    for (const x of words) await p.locator(`[aria-label="言葉の格子"] button[aria-label="${x}"]`).click();
    res.push(await p.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent === "チェック").getBoundingClientRect(); return `${Math.round(b.top)}-${Math.round(b.bottom)}/${innerHeight}${b.bottom <= innerHeight && b.top >= 0 ? "" : " OUT"}`; }));
    await p.getByRole("button", { name: "チェック" }).click(); await p.waitForTimeout(200);
  }
  console.log(w, f, res.join(" | ")); await close(o);
}
