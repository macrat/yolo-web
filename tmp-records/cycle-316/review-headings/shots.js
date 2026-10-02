const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage();
  const jobs = [[1280,"/blog/json-formatter-guide"],[1280,"/blog/tools-expansion-10-to-30"],[1280,"/blog/game-dictionary-layout-unification"],[1280,"/blog/stop-piling-rules-give-ai-its-wish"],[320,"/blog/cron-cheatsheet"],[375,"/blog/ai-agent-verification-step-skip"]];
  for (const [w,u] of jobs) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto("http://localhost:3918"+u, { waitUntil: "load", timeout: 30000 });
    await Promise.race([p.evaluate(() => document.fonts.ready.then(()=>1)), new Promise(r=>setTimeout(r,8000))]);
    await p.locator("h1").first().screenshot({ path: `shot-${w}-${u.split("/").pop()}.png`, timeout: 10000 });
  }
  await b.close();
})();
