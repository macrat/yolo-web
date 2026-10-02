import { getPlayRecommendationsForDictionary } from "@/play/recommendation";
for (const d of ["kanji","yoji","colors"]) console.log(d, getPlayRecommendationsForDictionary(d).map(c=>c.slug));
