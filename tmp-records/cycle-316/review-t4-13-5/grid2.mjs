import { open, close, settle, URL } from "./lib.mjs";
const words = ["サラリーマン","ガソリンスタンド","シャープペンシル","コンペイトウ","風が吹けば桶屋が儲かる","目は口ほどに物を言う","猿も木から落ちる","リュウグウノツカイ","ダイオウイカ","はまぐり","アンコウ","犬も歩けば棒に当たる","ウインドウ","ランドセル","テーブル","ズワイガニ"];
for (const f of [16, 20, 32]) {
  const o = await open({ width: 320, height: 667, font: f }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p);
  for (const css of ["", "line-break: strict", "line-break: strict; word-break: auto-phrase"]) {
    for (const w of [320, 375, 1280]) {
      await p.setViewportSize({ width: w, height: 800 });
      const r = await p.evaluate(([words, css]) => {
        document.getElementById("__t")?.remove(); const st = document.createElement("style"); st.id = "__t"; st.textContent = css ? `[aria-label='言葉の格子'] button{${css}}` : ""; document.head.append(st);
        const btns = [...document.querySelectorAll("[aria-label='言葉の格子'] button")];
        btns.forEach((b, i) => { b.lastChild.textContent = words[i]; });
        return btns.map((b) => { const t = b.lastChild, s = t.textContent, r = document.createRange(); const L = []; let lt = null; for (let i = 0; i < s.length; i++) { r.setStart(t, i); r.setEnd(t, i + 1); const tp = Math.round(r.getBoundingClientRect().top); if (lt === null || Math.abs(tp - lt) > 3) { L.push(""); lt = tp; } L[L.length - 1] += s[i]; } return L.join("/"); }).filter((x) => x.includes("/")).join(" ");
      }, [words, css]);
      console.log(`${f}px ${w} [${css || "as built"}]: ${r}`);
    }
  }
  await close(o);
}
