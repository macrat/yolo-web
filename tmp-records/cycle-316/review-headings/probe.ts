import { splitIntoPhrases } from "./pb-copy";
const ts = ["「望みを渡して」", "「Base64エンコード・デコード」", "チューリング型思考者"];
for (const t of process.argv.slice(2).length ? process.argv.slice(2) : ts) {
  (globalThis as any).__noWide = false; const a = splitIntoPhrases(t);
  (globalThis as any).__noWide = true; const b = splitIntoPhrases(t);
  console.log(a.join("|"), " <= ", b.join("|"));
}
