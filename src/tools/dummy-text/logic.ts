export type TextLanguage = "lorem" | "japanese";

export interface GenerateOptions {
  language: TextLanguage;
  paragraphs: number; // 1-20
  sentencesPerParagraph: number; // 1-20
}

// --- Lorem Ipsum data ---
const LOREM_SENTENCES: string[] = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus sed porttitor.",
  "Nulla facilisi etiam dignissim diam quis enim lobortis scelerisque.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
  "Praesent commodo cursus magna vel scelerisque nisl consectetur et.",
  "Donec sed odio dui nulla vitae elit libero a pharetra augue.",
  "Maecenas sed diam eget risus varius blandit sit amet non magna.",
  "Fusce dapibus tellus ac cursus commodo tortor mauris condimentum nibh.",
  "Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
  "Nullam quis risus eget urna mollis ornare vel eu leo.",
  "Aenean lacinia bibendum nulla sed consectetur praesent commodo cursus magna.",
  "Cras mattis consectetur purus sit amet fermentum donec ullamcorper nulla.",
  "Etiam porta sem malesuada magna mollis euismod vivamus sagittis.",
  "Morbi leo risus porta ac consectetur ac vestibulum at eros.",
];

// --- Japanese dummy text data ---
const JAPANESE_SENTENCES: string[] = [
  "吾輩は猫である。名前はまだない。",
  "どこで生れたかとんと見当がつかぬ。",
  "何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。",
  "吾輩はここで始めて人間というものを見た。",
  "しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。",
  "この書生というのは時々我々を捕えて煮て食うという話である。",
  "しかしその当時は何という考もなかったから別段恐しいとも思わなかった。",
  "ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。",
  "掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。",
  "この時妙なものだと思った感じが今でも残っている。",
  "朝は毎日のように雨が降り、午後になると日差しが戻ってくるという天気が続いていた。",
  "山の向こうに広がる町並みは、遠くから見るとまるで絵画のように美しかった。",
  "新しい技術の登場により、私たちの生活は日々便利になっている。",
  "四季折々の風景が楽しめるこの地域は、多くの観光客を惹きつけている。",
  "読書は心を豊かにし、新しい世界への扉を開いてくれる素晴らしい習慣である。",
  "地元の商店街では、昔ながらの伝統を守りながら新しい取り組みも行われている。",
  "科学技術の発展は目覚ましく、かつて不可能とされたことが次々と実現されている。",
  "自然の中で過ごす時間は、忙しい日常から離れてリフレッシュするのに最適である。",
  "音楽は言葉の壁を越えて、人々の心に直接語りかける力を持っている。",
  "健康的な食生活を心がけることは、長く充実した人生を送るための基本である。",
];

export function generateText(options: GenerateOptions): string {
  const paragraphs = Math.max(1, Math.min(20, options.paragraphs));
  const sentences = Math.max(1, Math.min(20, options.sentencesPerParagraph));
  const pool =
    options.language === "lorem" ? LOREM_SENTENCES : JAPANESE_SENTENCES;

  const result: string[] = [];
  let sentenceIndex = 0;

  for (let p = 0; p < paragraphs; p++) {
    const paragraphSentences: string[] = [];
    for (let s = 0; s < sentences; s++) {
      paragraphSentences.push(pool[sentenceIndex % pool.length]);
      sentenceIndex++;
    }
    // Join with space for Lorem, no space for Japanese
    const joiner = options.language === "lorem" ? " " : "";
    result.push(paragraphSentences.join(joiner));
  }

  return result.join("\n\n");
}

// Count words in generated text
export function countGeneratedWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

// Count characters
export function countGeneratedChars(text: string): number {
  return text.length;
}
