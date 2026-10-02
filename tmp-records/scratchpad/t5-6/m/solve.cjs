const { openContext, settle } = require("./lib.cjs");
(async () => {
  const { ctx, close } = await openContext({ width: 375, height: 800 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3461/play/contrarian-fortune"); await settle(p);
  await p.getByRole("button", { name: "はじめる" }).click();
  for (let i = 0; i < 30; i++) {
    if (await p.locator("main table").count()) break;
    const box = p.locator("main [class*=QuestionCard] button, main [class*=QuestionCard] [role=radio]").first();
    if (!(await box.count())) { await p.waitForTimeout(300); continue; }
    await box.click(); await p.waitForTimeout(200);
    const next = p.getByRole("button", { name: /次へ|結果を見る/ });
    if (await next.count()) { await next.first().click().catch(() => {}); await p.waitForTimeout(200); }
  }
  await p.waitForTimeout(800);
  console.log(await p.evaluate(() => { const t = document.querySelector("main table"); if (!t) return "no table: " + document.querySelector("main h2,main h3")?.textContent; return [...t.querySelectorAll("th,td")].map((c) => c.innerHTML.replace(/<wbr>/g, "|")).join(" ; ") + " frame-laid:" + !!t.closest("[data-layout-key]"); }));
  await p.screenshot({ path: "m/solved-cf.png", fullPage: true });
  await close();
})().catch((e) => { console.error(e.message); process.exit(1); });
