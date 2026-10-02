import { splitIntoPhrases } from "./pb";
import { loadDefaultJapaneseParser } from "budoux";
const p = loadDefaultJapaneseParser();
for (const t of process.argv.slice(2)) console.log(splitIntoPhrases(t).join("|"), "   budoux:", p.parse(t).join("|"));
