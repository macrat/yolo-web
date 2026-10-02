const { open, measure, BASE, DIR } = require("./lib.cjs");
(async () => {
  for (const [width, font] of (process.argv[2]==="q"?[[320,16],[1280,16]]:[[320, 16], [375, 32], [1280, 16]])) {
    const { ctx, page, close } = await open({ width, font, touch: width < 1000 });
    const log = [];
    await page.goto(BASE + "/play/irodori", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
    log.push("first CLS " + (await page.evaluate(() => window.__cls)).toFixed(5) + " shifts " + JSON.stringify(await page.evaluate(() => window.__shifts.map((s) => [+s.v.toFixed(5), Math.round(s.t), s.src]))));
    for (let r = 0; r < 5; r++) {
      const prog = await page.evaluate(() => document.body.innerText.match(/(\d) \/ 5/)?.[0]);
      const act = await page.evaluate(() => document.activeElement.tagName + ":" + (document.activeElement.labels?.[0]?.textContent || document.activeElement.textContent.slice(0, 10)));
      // play: tap + on hue twice, keyboard on lightness
      const inc = page.getByRole("button", { name: "色相を1増やす" });
      if (width < 1000) { await inc.tap(); await inc.tap(); } else { await inc.click(); await inc.click(); }
      await page.locator('input[type="range"]').nth(2).focus(); await page.keyboard.press("ArrowLeft");
      const vals = await page.evaluate(() => [...document.querySelectorAll('input[type="range"]')].map((i) => i.value).join(","));
      const decide = page.getByRole("button", { name: "決定" });
      const db = await decide.boundingBox();
      if (width < 1000) await decide.tap(); else await decide.click();
      await page.waitForTimeout(400);
      const txt = await page.evaluate(() => document.querySelector("main").innerText.replace(/\s+/g, " "));
      log.push(`round ${r + 1} prog=${prog} focusAtStart=${act} vals=${vals} decideBottom=${db && (db.y + db.height).toFixed(1)} scrollY=${await page.evaluate(() => scrollY)} after: ${txt.match(/(\d+) ?点/g)?.slice(0, 3)} focus=${await page.evaluate(() => document.activeElement.textContent.slice(0, 20))}`);
      if (r < 4) { const nx = page.getByRole("button", { name: "次の問題へ" }); if (width < 1000) await nx.tap(); else await nx.click(); await page.waitForTimeout(300); }
      if (r === 1) { // reopen mid-game
        await page.reload({ waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
        log.push("reopen mid CLS " + (await page.evaluate(() => window.__cls)).toFixed(5) + " prog " + (await page.evaluate(() => document.body.innerText.match(/(\d) \/ 5/)?.[0])) + " " + JSON.stringify(await page.evaluate(() => window.__shifts.map((s) => [+s.v.toFixed(5), s.src]))));
      }
    }
    await page.screenshot({ path: `${DIR}/shots/result-${width}-${font}.png`, fullPage: false });
    const fin = await page.evaluate(() => document.querySelector("main").innerText.replace(/\s+/g, " ").slice(0, 400));
    log.push("final: " + fin);
    await page.reload({ waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
    log.push("reopen done CLS " + (await page.evaluate(() => window.__cls)).toFixed(5) + " " + JSON.stringify(await page.evaluate(() => window.__shifts.map((s) => [+s.v.toFixed(5), s.src]))) + " sliders? " + (await page.locator('input[type="range"]').count()));
    console.log(`== ${width} ${font}\n` + log.join("\n"));
    await close();
  }
})();
