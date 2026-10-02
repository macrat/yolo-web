import { open, close, cls, settle, URL, G, WRONG, guess, pick } from "./lib.mjs";
const flows = {
  win: [G[2], ["袖", "襟", "絹", "文庫"], G[1], G[4], G[3]],
  loss: [G[3], ["袖", "振袖", "絹", "留袖"], ["襟", "留袖", "紬", "訪問着"], ["袖", "襟", "帯", "振袖"], ["裾", "浴衣", "縮緬", "銘仙"]],
  loss0: [WRONG[0], WRONG[1], WRONG[2], WRONG[3]],
};
for (const [name, seq] of Object.entries(flows)) for (const [w, h, f] of [[375, 667, 16], [320, 667, 32]]) {
  const o = await open({ width: w, height: h, font: f }); const p = o.page;
  await p.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  const statuses = [];
  for (const g of seq) { await guess(p, g); statuses.push(await p.getByRole("status").first().innerText().catch(() => "(none)")); }
  await p.waitForTimeout(500);
  const focus = await p.evaluate(() => { const a = document.activeElement; return a.tagName + " " + (a.getAttribute("aria-label") || a.textContent).slice(0, 40) + " top=" + Math.round(a.getBoundingClientRect().top); });
  const ends = await p.evaluate(() => window.__gtag.filter((c) => c[1] === "level_end").map((c) => JSON.stringify(c[2])));
  await p.locator("[aria-labelledby=nakamawake-share]").getByRole("button", { name: /X でシェア/ }).click();
  await p.locator("[aria-labelledby=nakamawake-share]").getByRole("button", { name: /LINE/ }).click();
  const opened = await p.evaluate(() => window.__opened);
  const x = new globalThis.URL(opened[0]).searchParams.get("text");
  const resultText = (await p.locator("main section, main [tabindex='-1']").first().innerText()).slice(0, 200);
  await p.screenshot({ path: `shots/end-${name}-${w}-${f}.png`, fullPage: true });
  // reopen
  await p.reload({ waitUntil: "load" }); await settle(p);
  const ends2 = await p.evaluate(() => window.__gtag.filter((c) => c[1] === "level_end").length);
  console.log(`== ${name} ${w} ${f}px\n status: ${statuses.map((s) => s.replace(/\n/g, " / ")).join(" || ")}\n focus: ${focus}\n level_end: ${ends.length} ${ends.join(",")} reopen: ${ends2}\n X text: ${JSON.stringify(x)}\n LINE: ${opened[1]?.slice(0, 160)}`);
  await close(o);
}
