const { openContext, settle } = require("./lib.cjs");
(async () => {
  const { ctx, close } = await openContext({ width: 375, height: 667 });
  const page = await ctx.newPage();
  await page.goto(process.argv[2], { waitUntil: "load" });
  await settle(page);
  const o = await page.evaluate(() => {
    const main = document.querySelector("main");
    const walk = (el, d) => {
      if (d > 5) return [];
      const out = [];
      for (const c of el.children) {
        const r = c.getBoundingClientRect();
        const b = getComputedStyle(c, "::before");
        const h = c.matches("h1,h2,h3") ? " «" + c.textContent + "»" : "";
        out.push("  ".repeat(d) + c.tagName.toLowerCase() + "." + (c.className || "").toString().slice(0, 40) + ` y=${Math.round(r.top + scrollY)} h=${Math.round(r.height)}` + (b.borderTopWidth !== "0px" && b.content !== "none" ? " RULE" : "") + h);
        if (["SECTION", "DIV", "HEADER", "NAV"].includes(c.tagName) && !c.matches("ul,ol")) out.push(...walk(c, d + 1));
      }
      return out;
    };
    return [main.tagName + "." + main.className, ...walk(main, 1)].join("\n");
  });
  console.log(o);
  await close();
})();
