import { open, close, settle, URL } from "./lib.mjs";
for (const block of [false, true]) {
  const o = await open({ width: 800, height: 600, font: 16, blockFonts: block }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
  const r = await p.evaluate(() => {
    const lab = document.querySelector('input[type="range"]').parentElement.querySelector("label");
    const s = document.createElement("span"); s.style.cssText = "position:absolute;white-space:pre;font:inherit"; lab.appendChild(s);
    const fs = parseFloat(getComputedStyle(lab).fontSize);
    const w = (t) => { s.textContent = t; return s.getBoundingClientRect().width / fs; };
    const ascii = []; for (let c = 0x21; c < 0x7f; c++) { const ch = String.fromCharCode(c); if (!/[0-9]/.test(ch)) ascii.push([ch, w(ch)]); }
    ascii.sort((a, b) => b[1] - a[1]);
    const lat = [..."×÷°±µÆŒæœÅéü§¶©®"].map((c) => [c, w(c)]).sort((a, b) => b[1] - a[1]);
    const kana = [..."あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンーッャュョ、。「」・…品質文字数長"].map((c) => [c, w(c)]).sort((a, b) => b[1] - a[1]);
    const digits = [..."0123456789"].map((c) => w(c));
    return { font: getComputedStyle(lab).fontFamily.slice(0, 80), asciiTop: ascii.slice(0, 5).map((x) => x[0] + x[1].toFixed(3)), latTop: lat.slice(0, 4).map((x) => x[0] + x[1].toFixed(3)), kanaTop: kana.slice(0, 5).map((x) => x[0] + x[1].toFixed(3)), digitMax: Math.max(...digits).toFixed(3), strs: ["100%", "1.5 MB", "パスワードの長さ", "品質"].map((t) => t + ":" + w(t).toFixed(3)) };
  });
  console.log(block ? "blocked" : "loaded", JSON.stringify(r)); await close(o);
}
