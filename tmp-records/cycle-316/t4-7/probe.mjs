import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [vw, path] of [[375, "traditional-color/result/yamabuki"], [320, "science-thinking/result/einstein"], [375, "japanese-culture/result/sado"]]) {
  const p = await b.newPage({ viewport: { width: vw, height: 800 } });
  await p.goto(`http://localhost:3728/play/${path}`, { waitUntil: "load" });
  const r = await p.evaluate(async () => {
    const h = document.querySelector("main h1");
    await document.fonts.load(`400 ${getComputedStyle(h).fontSize} "Zen Antique"`, h.textContent);
    const span = document.createElement("span");
    span.style.whiteSpace = "nowrap";
    span.textContent = h.textContent;
    h.after(span);
    span.style.font = getComputedStyle(h).font;
    const w = span.getBoundingClientRect().width;
    span.remove();
    return { client: h.clientWidth, nowrap: w, fs: getComputedStyle(h).fontSize, ff: getComputedStyle(h).fontFamily.slice(0, 60) };
  });
  console.log(vw, path, JSON.stringify(r));
  await p.close();
}
await b.close();
