// 今日の日付（日本時間）で、各運勢を出す localStorage の種を探す。
import { selectFortune } from "../../../src/play/fortune/logic";
import { DAILY_FORTUNES } from "../../../src/play/fortune/data/daily-fortunes";
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const seedById = new Map<string, number>();
for (let seed = 1; seedById.size < DAILY_FORTUNES.length && seed < 1e7; seed++) {
  const f = selectFortune(today, seed);
  if (!seedById.has(f.id)) seedById.set(f.id, seed);
}
const entries = DAILY_FORTUNES.map((f) => ({ id: f.id, title: f.title, rating: f.rating, seed: seedById.get(f.id) }));
console.log(JSON.stringify({ today, entries }, null, 1));
