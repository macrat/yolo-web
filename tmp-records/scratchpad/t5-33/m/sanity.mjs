import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const emul of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 320, height: 900 } });
  const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  await ctx.addInitScript((t) => { localStorage.setItem("irodori-history", JSON.stringify({ [t]: { scores: [1,2,3,4,5], totalScore: 3, currentRound: 5, status: "completed" } })); window.__st = []; new MutationObserver(() => { const s = document.getElementById("irodori-saved-layout"); if (s && !window.__st.includes(s.textContent)) window.__st.push(s.textContent); }).observe(document, { childList: true, subtree: true }); }, TODAY);
  if (emul) await ctx.addInitScript(() => { new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.tagName === "STYLE" && /saved/.test(n.id)) n.textContent = n.textContent.replace(/;?--[\w-]+-result-height:100vh/, ""); }).observe(document, { childList: true, subtree: true }); });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3533/play/irodori", { waitUntil: "load" });
  console.log(emul, await p.evaluate(() => window.__st));
  await ctx.close();
}
await b.close();
