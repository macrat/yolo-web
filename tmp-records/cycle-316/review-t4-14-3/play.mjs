import { open, close, settle, URL, DIR } from "./lib.mjs";
const [w, h, font] = [+process.argv[2], +process.argv[3], +process.argv[4]]; const dark = process.argv[5] === "dark";
const tag = `${w}-${font}${dark ? "-dark" : ""}`;
const o = await open({ width: w, height: h, font, dark }); const p = o.page;
await p.goto(URL, { waitUntil: "load" }); await settle(p, 800);
const dec = p.getByRole("button", { name: "決定" });
const bb = await dec.boundingBox();
console.log(tag, "decide button box", JSON.stringify(bb), "viewport h", h, "in first view:", bb.y + bb.height <= h);
await p.screenshot({ path: `${DIR}/shots/first-${tag}.png` });
if (process.argv[6] === "shotonly") { await close(o); process.exit(0); }
// a11y snapshot of slider group
const ax = await p.locator("main").ariaSnapshot();
console.log(ax.split("\n").filter((l) => /slider|減らす|増やす|色相|彩度|明度|status|決定|progress/.test(l)).slice(0, 20).join("\n"));
// − / ＋ on hue
const hue = p.getByRole("slider", { name: "色相" });
const v0 = +(await hue.inputValue());
await p.getByRole("button", { name: "色相を1増やす" }).click();
await p.getByRole("button", { name: "色相を1増やす" }).click();
await p.getByRole("button", { name: "色相を1減らす" }).click();
const v1 = +(await hue.inputValue());
const focus1 = await p.evaluate(() => document.activeElement?.tagName + ":" + (document.activeElement?.getAttribute("aria-label") || document.activeElement?.id));
const status1 = await p.evaluate(() => [...document.querySelectorAll('[role="status"]')].map((s) => s.textContent).join("|"));
// focus slider then press + : no notice
await hue.focus(); await p.getByRole("button", { name: "色相を1増やす" }).click();
const status2 = await p.evaluate(() => [...document.querySelectorAll('[role="status"]')].map((s) => s.textContent).join("|"));
const focus2 = await p.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.id);
await p.keyboard.press("ArrowRight");
const v2 = +(await hue.inputValue());
// edges
const sat = p.getByRole("slider", { name: "彩度" });
await sat.focus(); await p.keyboard.press("End");
const incS = p.getByRole("button", { name: "彩度を1増やす" });
const dis = await incS.getAttribute("aria-disabled");
await incS.click({ force: true }); const sv = await sat.inputValue();
await p.mouse.move(0, 0); await p.screenshot({ path: `${DIR}/shots/edge-${tag}.png` });
await incS.hover({ force: true }); await p.screenshot({ path: `${DIR}/shots/edge-hover-${tag}.png` });
console.log(tag, `hue ${v0}->${v1} (+2-1) focusAfterClick=${focus1} status="${status1}" | focused+: status="${status2}" focus=${focus2} arrow->${v2} | sat End=${sv} +disabled=${dis}`);
// play 5 rounds
for (let r = 0; r < 5; r++) {
  const s = p.getByRole("slider", { name: "明度" }); await s.focus(); await p.keyboard.press("PageUp");
  await p.getByRole("button", { name: "決定" }).click(); await p.waitForTimeout(300);
  if (r === 0) await p.screenshot({ path: `${DIR}/shots/judged-${tag}.png` });
  if (r < 4) {
    const txt = (await p.locator("main").innerText()).match(/(\d+)点/)?.[0];
    const f = await p.evaluate(() => document.activeElement?.textContent?.trim());
    console.log(" round", r + 1, "score", txt, "focus", f);
    await p.getByRole("button", { name: "次の問題へ" }).click(); await p.waitForTimeout(250);
  }
}
await p.waitForTimeout(800);
const f = await p.evaluate(() => ({ tag: document.activeElement?.tagName, top: Math.round(document.activeElement?.getBoundingClientRect().top) }));
const g = await p.evaluate(() => window.__gtag.filter((a) => a[0] === "event").map((a) => a[1] + ":" + JSON.stringify(a[2]).slice(0, 120)));
const hist = await p.evaluate(() => localStorage.getItem("irodori-history"));
const text = (await p.locator("main").innerText()).slice(0, 700);
console.log(tag, "result focus", JSON.stringify(f), "\n events", g.join(" | "), "\n history", hist, "\n", text.replace(/\n+/g, " / "));
await p.screenshot({ path: `${DIR}/shots/result-${tag}.png`, fullPage: true });
// reload -> event not resent
await p.reload({ waitUntil: "load" }); await settle(p, 1000);
const g2 = await p.evaluate(() => window.__gtag.filter((a) => a[0] === "event").map((a) => a[1]));
console.log(" after reload events", g2.join(","));
await close(o);
