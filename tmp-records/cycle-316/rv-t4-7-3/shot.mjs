import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 375, height: 667 } });
await p.goto("http://localhost:3840/play/contrarian-fortune/result/accidentalprophet", { waitUntil: "load" });
await p.screenshot({ path: "tmp/cycle-316/rv-t4-7-3/cf-top-375.png", clip: { x: 0, y: 0, width: 375, height: 1500 }, fullPage: true });
await p.emulateMedia({ colorScheme: "dark" });
await p.screenshot({ path: "tmp/cycle-316/rv-t4-7-3/cf-top-375-dark.png", clip: { x: 0, y: 500, width: 375, height: 1000 }, fullPage: true });
await b.close();
