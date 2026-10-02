import { sayingPhrases } from "@/play/games/nakamawake/_lib/engine";
for (const p of [["船頭多くして","船山に","上る"],["急がば","回れ"],["弘法にも","筆の誤り"],["聞くは","一時の恥"],["早起きは","三文の徳"],["千里の","道も","一歩から"],["猫に","小判"],["鬼に","金棒"],["井の中の","蛙"]]) console.log(p.join("|"), "=>", JSON.stringify(sayingPhrases(p)));
