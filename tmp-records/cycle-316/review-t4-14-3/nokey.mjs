import { open, close, cls, settle, URL, SEEDS } from "./lib.mjs";
for (const [w,h,font] of [[375,667,16],[1280,800,16]]) {
  const o = await open({ width: w, height: h, font, storage: SEEDS.done }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  const H = p.getByRole("heading", { name: "この結果を共有" });
  await H.evaluate((b) => window.scrollBy(0, b.getBoundingClientRect().top - 100)); await p.waitForTimeout(300);
  await p.evaluate(() => { const s=JSON.parse(localStorage.getItem("irodori-result-height")); s.viewportWidth=1; localStorage.setItem("irodori-result-height", JSON.stringify(s)); });
  // block resize observer re-save: reload immediately
  await p.reload({ waitUntil: "load" }); await settle(p, 1500);
  console.log(w, font, "no-matching-record reload cls", (await cls(p)).total, "top", await H.evaluate((b) => Math.round(b.getBoundingClientRect().top)));
  await close(o);
}
