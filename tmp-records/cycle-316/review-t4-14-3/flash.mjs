import { open, close, settle, URL, SEEDS } from "./lib.mjs";
for (const [w, h, cpu] of [[375, 667, 1], [375, 667, 4]]) {
  const o = await open({ width: w, height: h, storage: SEEDS.mid }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
  const cdp = await o.context.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu }); if (cpu > 1) { await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true }); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); }
  await p.addInitScript(() => {
    window.__sw = []; const t0 = performance.now();
    const tick = () => { const pb = document.querySelector('[role="progressbar"]'); const sw = document.querySelector('main [style*="background"]');
      const cur = (pb?.getAttribute("aria-valuenow") ?? "-") + " " + (pb ? getComputedStyle(pb.parentElement).visibility : "") ;
      const last = window.__sw[window.__sw.length - 1]; if (!last || last[1] !== cur) window.__sw.push([Math.round(performance.now() - t0), cur]);
      if (performance.now() - t0 < 15000) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await p.reload({ waitUntil: "load" }); await settle(p, 6000);
  console.log("cpu x" + cpu, JSON.stringify(await p.evaluate(() => window.__sw)));
  await close(o);
}
