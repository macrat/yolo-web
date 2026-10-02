const { openContext, settle } = require("./lib.cjs");
(async () => {
  const [url, w] = process.argv.slice(2);
  const { ctx, close } = await openContext({ width: +w, height: 667 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  await settle(page);
  console.log(await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const els = { header: q("body > header, header"), nav: q('nav[aria-label="パンくずリスト"]'), quizName: q("main header p"), h1: q("main h1"), lead: q("main [class*=lead]"), cta: q("main a[data-inverted]"), cost: q("main [class*=tryCost]") };
    return Object.entries(els).map(([k, e]) => e ? `${k}: ${Math.round(e.getBoundingClientRect().top + scrollY)}-${Math.round(e.getBoundingClientRect().bottom + scrollY)} ${e.textContent.slice(0, 40)}` : k + ": none").join("\n");
  }));
  await close();
})();
