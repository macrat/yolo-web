import { colorDifference, calculateRoundScore } from "../../../src/play/games/irodori/_lib/engine";
for (const [a, b, s, l] of [[0, 16, 100, 50], [60, 71, 100, 50], [60, 50, 100, 50], [300, 289, 100, 50], [120, 127, 100, 50], [30, 43, 100, 50], [0, 16, 60, 40], [200, 210, 60, 40]]) {
  const d = colorDifference(a, s, l, b, s, l);
  console.log(`hue ${a} vs ${b} (S${s} L${l}): dE=${d.toFixed(1)} score=${calculateRoundScore(d)}`);
}
