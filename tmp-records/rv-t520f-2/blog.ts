import { getBlogPostsReferencing } from "@/lib/cross-links";
for (const s of ["kanji-kanaru","yoji-kimeru","nakamawake","irodori"]) console.log(s, getBlogPostsReferencing(s).length);
