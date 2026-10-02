import { open, close, settle, BASE, DIR } from "./lib.mjs";
for (const [w, h, font] of [[320, 667, 16], [1280, 800, 16], [375, 667, 32]]) {
  const o = await open({ width: w, height: h, font }); const p = o.page;
  await p.goto(BASE + "/tools/password-generator", { waitUntil: "load" }); await settle(p, 500);
  const s = p.locator('input[type="range"]');
  await s.scrollIntoViewIfNeeded();
  const r = await s.evaluate((i) => { const b = i.getBoundingClientRect(); const c = getComputedStyle(i); return { x: b.x, w: b.width, h: b.height, ml: c.marginLeft, pad: c.paddingLeft, parentX: i.parentElement.getBoundingClientRect().x }; });
  await s.focus(); await p.keyboard.press("ArrowRight");
  console.log("pw", w, font, JSON.stringify(r), "val", await s.inputValue());
  await p.screenshot({ path: `${DIR}/shots/pw-${w}-${font}.png` });
  await p.goto(BASE + "/tools/image-resizer", { waitUntil: "load" }); await settle(p, 500);
  await p.locator('input[type="file"]').setInputFiles({ name: "a.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") });
  await p.waitForTimeout(800);
  await p.locator("select").filter({ has: p.locator("option[value=\"image/jpeg\"]") }).selectOption("image/jpeg");
  const cb = p.getByLabel(/JPEG/); 
  await p.waitForTimeout(400);
  const q = p.locator('input[type="range"]');
  if (await q.count()) { await q.scrollIntoViewIfNeeded(); const rr = await q.evaluate((i) => { const b = i.getBoundingClientRect(); return { x: b.x, w: b.width, h: b.height }; }); console.log("ir", w, font, JSON.stringify(rr)); }
  else console.log("ir", w, font, "no range", (await p.locator("main").innerText()).slice(0, 300).replace(/\n/g, " / "));
  await p.screenshot({ path: `${DIR}/shots/ir-${w}-${font}.png` });
  await close(o);
}
