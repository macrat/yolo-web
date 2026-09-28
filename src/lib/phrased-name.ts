/**
 * コントロールの名前と、一覧の選択肢の名前。区切りの並びを渡すとそのあいだで文節で折り、文字列を渡すと区切りの
 * 無い1つの文節として組む（DESIGN.md §4）。2文節以上の名前は、書き手が文節で分けた並びで渡し、並びは
 * followsPhraseRules（@/lib/phrase-breaks）と同じ禁則を満たす。組むのは PhrasedText（@/components/PhrasedText）。
 */
export type PhrasedName = string | readonly string[];

/** 名前の字を1続きの文にしたもの。並びの鍵・読み上げの文・字の幅の見積もりに使う。 */
export function phrasedNameText(name: PhrasedName): string {
  return typeof name === "string" ? name : name.join("");
}
