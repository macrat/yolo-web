import { computeCrossCategoryItems } from "@/play/games/shared/_lib/crossCategoryItems";
import { getRecommendedContents } from "@/play/recommendation";
import { toPlayListItems } from "@/play/listItems";
import { ALL_GAMES } from "@/play/games/shared/_lib/crossGameProgress";
import { allGameMetas } from "@/play/games/registry";
import { getPlayContentsByCategory } from "@/play/registry";
for (const m of allGameMetas) {
  const next = ALL_GAMES.filter(g=>g.slug!==m.slug).map(g=>g.path);
  const rel = getPlayContentsByCategory("game").filter(c=>c.slug!==m.slug && (m.relatedGameSlugs??[]).includes(c.slug)).map(c=>toPlayListItems([c])[0].href);
  const cross = computeCrossCategoryItems(m.slug).map(i=>i.href);
  const rec = toPlayListItems(getRecommendedContents(m.slug)).map(i=>i.href);
  console.log(m.slug, JSON.stringify({next, rel, relSubset: rel.every(h=>next.includes(h)), cross, rec, crossSubset: cross.every(h=>rec.includes(h)), recGames: rec.filter(h=>next.includes(h))}));
}
