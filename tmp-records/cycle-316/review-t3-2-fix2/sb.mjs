import { chromium } from "/home/user/yolo-web/tmp/wt-rv-t32fix2-a/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [w,s] of [[375,"light"],[1280,"dark"]]) {
const p = await (await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: s })).newPage();
await p.goto("http://localhost:3471/storybook", { waitUntil: "networkidle" });
const h = p.locator("#item-list-visitor-item");
await h.scrollIntoViewIfNeeded();
const box1 = await h.boundingBox(); const box2 = await p.locator("#item-list-types-current").boundingBox();
await p.screenshot({ path: `/home/user/yolo-web/tmp/cycle-316/review-t3-2-fix2/storybook-visitor-${w}-${s}.png`, fullPage: true, clip: { x: 0, y: box1.y + (await p.evaluate(()=>scrollY)), width: w, height: box2.y - box1.y + 420 } });
}
await b.close();
