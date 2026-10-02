import { colorDifference } from "../../../src/play/games/irodori/_lib/engine";
for (const d of [1, 2, 3]) {
  let max = 0, at = 0, sum = 0;
  for (let h = 0; h < 360; h++) { const e = colorDifference(h, 100, 50, (h + d) % 360, 100, 50); sum += e; if (e > max) { max = e; at = h; } }
  let max2 = 0; for (let h = 0; h < 360; h++) { const e = colorDifference(h, 60, 45, (h + d) % 360, 60, 45); if (e > max2) max2 = e; }
  console.log(`hue diff ${d}: S100L50 mean dE ${(sum/360).toFixed(2)} max ${max.toFixed(2)} at h=${at} (points lost up to ${(2*max).toFixed(1)}); S60L45 max ${max2.toFixed(2)}`);
}
for (const d of [1,2]) { let m=0; for (let l=5;l<95;l++){ const e=colorDifference(30,60,l,30,60,l+d); if(e>m)m=e;} console.log(`L diff ${d}: max dE ${m.toFixed(2)}`); }
