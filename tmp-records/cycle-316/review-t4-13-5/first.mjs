import { open, close, settle, URL } from "./lib.mjs";
const fish = ["鯛","あさり","ズワイガニ","アンコウ","鮭","はまぐり","タラバガニ","リュウグウノツカイ","鰹","しじみ","伊勢えび","メンダコ","鰤","ほたて","車えび","ダイオウイカ"];
for (const [w, h] of [[320, 667], [375, 667], [1280, 800]]) {
  const o = await open({ width: w, height: h }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  const m = () => p.evaluate(() => { const g = document.querySelector("[aria-label='言葉の格子']").getBoundingClientRect(); const c = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "チェック").getBoundingClientRect(); const b0 = document.querySelector("[aria-label='言葉の格子'] button").getBoundingClientRect(); return `grid ${Math.round(g.top)}..${Math.round(g.bottom)} firstRowBottom ${Math.round(b0.bottom)} check ${Math.round(c.top)}..${Math.round(c.bottom)} left ${Math.round(g.left)} width ${Math.round(g.width)}`; });
  const a = await m();
  await p.evaluate((ws) => { [...document.querySelectorAll("[aria-label='言葉の格子'] button")].forEach((b, i) => { b.lastChild.textContent = ws[i]; }); }, fish);
  const b = await m();
  await p.addStyleTag({ content: "[aria-label=\x27言葉の格子\x27] div div div{grid-auto-rows:auto !important}" }); const c = await m(); console.log("  auto rows:", c);
  if (w !== 1280) await p.screenshot({ path: `shots/first-fish-${w}.png` });
  console.log(w, h, "today:", a, "| fish:", b);
  await close(o);
}
