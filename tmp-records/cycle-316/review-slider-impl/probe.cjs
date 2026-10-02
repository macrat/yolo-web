const { open, BASE } = require("./lib.cjs");
(async () => {
  const { page, close } = await open({ width: 320 });
  await page.goto(BASE + "/play/irodori", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready);
  console.log(await page.evaluate(() => { const c = document.querySelector('[style*="--slider-fixed"]'); const lab = c.querySelector("label"); const cs = getComputedStyle(lab); const v = c.querySelector(':scope label ~ span[aria-hidden]'); return { style: c.getAttribute("style"), ls: cs.letterSpacing, ff: cs.fontFamily, fs: cs.fontSize, vff: getComputedStyle(v).fontFamily, vls: getComputedStyle(v).letterSpacing, valSpaceW: v.firstElementChild.getBoundingClientRect().width, vW: v.getBoundingClientRect().width, labelTextW: (()=>{const r=document.createRange(); r.selectNodeContents(lab); return r.getBoundingClientRect().width})() }; }));
  console.log(JSON.stringify(await page.evaluate(() => window.__shifts)));
  await close();
})();
