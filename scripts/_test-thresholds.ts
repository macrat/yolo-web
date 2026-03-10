import * as fs from "fs";

interface EmbeddingFile {
  meta: { model: string; dims: number; quantization: string };
  embeddings: Record<string, string>;
}

function decodeEmbedding(base64: string): Int8Array {
  const buffer = Buffer.from(base64, "base64");
  return new Int8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

function cosineSimilarity(a: Int8Array, b: Int8Array): number {
  let dotProduct = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const d = Math.sqrt(normA) * Math.sqrt(normB);
  return d === 0 ? 0 : dotProduct / d;
}

const data: EmbeddingFile = JSON.parse(
  fs.readFileSync("public/data/kanji-embeddings-384.json", "utf-8"),
);
const embeddings = new Map<string, Int8Array>();
for (const [char, b64] of Object.entries(data.embeddings)) {
  embeddings.set(char, decodeEmbedding(b64));
}

const CT = 0.5;
const CLT = 0.33;

const testPairs: [string, string][] = [
  ["海", "湖"],
  ["火", "炎"],
  ["山", "丘"],
  ["父", "母"],
  ["川", "河"],
  ["刀", "剣"],
  ["学", "習"],
  ["見", "視"],
  ["歩", "走"],
  ["朝", "夕"],
  ["火", "熱"],
  ["山", "谷"],
  ["木", "森"],
  ["雨", "雪"],
  ["手", "足"],
  ["日", "月"],
  ["読", "書"],
  ["犬", "猫"],
  ["男", "女"],
  ["海", "川"],
  ["上", "下"],
  ["左", "右"],
  ["東", "西"],
  ["春", "夏"],
  ["天", "地"],
  ["白", "黒"],
  ["生", "死"],
  ["入", "出"],
  ["始", "終"],
  ["大", "小"],
  ["海", "金"],
  ["火", "口"],
  ["心", "石"],
  ["花", "鉄"],
  ["風", "刀"],
];

console.log("correct >= " + CT + ", close >= " + CLT + "\n");
for (const [a, b] of testPairs) {
  const va = embeddings.get(a)!;
  const vb = embeddings.get(b)!;
  const sim = cosineSimilarity(va, vb);
  let cat = "wrong";
  if (sim >= CT) cat = "correct";
  else if (sim >= CLT) cat = "close";
  console.log("  " + a + "-" + b + ": " + sim.toFixed(4) + " -> " + cat);
}
