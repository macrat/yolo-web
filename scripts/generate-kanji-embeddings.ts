/**
 * Kanji Embedding Vector Generator
 *
 * Generates embedding vectors for all 2,136 joyo kanji using
 * Xenova/paraphrase-multilingual-MiniLM-L12-v2 via @huggingface/transformers.
 *
 * Outputs two files:
 * - public/data/kanji-embeddings-128.json (128-dim, int8, base64)
 * - public/data/kanji-embeddings-384.json (384-dim, int8, base64)
 *
 * Usage: npx tsx scripts/generate-kanji-embeddings.ts
 */

import * as fs from "fs";
import * as path from "path";
import { pipeline } from "@huggingface/transformers";

// ── Constants ──────────────────────────────────────────────────────

const MODEL_NAME = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const FULL_DIMS = 384;
const REDUCED_DIMS = 128;
const BATCH_SIZE = 64;

const KANJI_DATA_PATH = path.resolve(__dirname, "../src/data/kanji-data.json");
const OUTPUT_DIR = path.resolve(__dirname, "../public/data");

// ── Types ──────────────────────────────────────────────────────────

interface KanjiEntry {
  character: string;
  meanings: string[];
}

interface EmbeddingOutput {
  meta: {
    model: string;
    dims: number;
    quantization: string;
  };
  embeddings: Record<string, string>;
}

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Quantize a float32 vector to int8 and encode as base64.
 *
 * Steps:
 * 1. Find the maximum absolute value across all dimensions
 * 2. Normalize each dimension to [-1, 1] by dividing by max absolute value
 * 3. Multiply by 127 and round to get int8 values
 * 4. Clamp to [-127, 127] for safety
 * 5. Encode the resulting Int8Array as base64
 */
function quantizeAndEncode(vector: number[]): string {
  const maxAbs = vector.reduce((max, val) => Math.max(max, Math.abs(val)), 0);

  // Avoid division by zero for zero vectors
  const scale = maxAbs === 0 ? 1 : maxAbs;

  const int8Values = new Int8Array(vector.length);
  for (let i = 0; i < vector.length; i++) {
    const normalized = vector[i] / scale;
    const scaled = Math.round(normalized * 127);
    int8Values[i] = Math.max(-127, Math.min(127, scaled));
  }

  return Buffer.from(int8Values.buffer).toString("base64");
}

/**
 * Build the input text for embedding using Pattern C: "character meanings..."
 * Example: "海 sea ocean"
 */
function buildInputText(entry: KanjiEntry): string {
  return `${entry.character} ${entry.meanings.join(" ")}`;
}

// ── Main ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("Loading kanji data...");
  const kanjiData: KanjiEntry[] = JSON.parse(
    fs.readFileSync(KANJI_DATA_PATH, "utf-8"),
  );
  console.log(`Loaded ${kanjiData.length} kanji entries`);

  if (kanjiData.length !== 2136) {
    console.warn(
      `WARNING: Expected 2,136 entries but found ${kanjiData.length}`,
    );
  }

  console.log(`Loading model: ${MODEL_NAME}...`);
  const extractor = await pipeline("feature-extraction", MODEL_NAME);
  console.log("Model loaded successfully");

  // Prepare input texts
  const inputTexts = kanjiData.map(buildInputText);
  const characters = kanjiData.map((entry) => entry.character);

  // Process in batches to avoid memory issues
  const allVectors: number[][] = [];
  const totalBatches = Math.ceil(inputTexts.length / BATCH_SIZE);

  for (let i = 0; i < inputTexts.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = inputTexts.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing batch ${batchNum}/${totalBatches} (${batch.length} entries)...`,
    );

    // Get embeddings for the batch
    // The model returns shape [batch_size, sequence_length, hidden_size]
    // We use { pooling: 'mean', normalize: true } for sentence embeddings
    const output = await extractor(batch, {
      pooling: "mean",
      normalize: true,
    });

    // Extract vectors from the tensor output
    // output.tolist() returns number[][] for batched input
    const vectors = output.tolist() as number[][];
    allVectors.push(...vectors);
  }

  console.log(`Generated ${allVectors.length} embedding vectors`);

  // Verify dimensions
  if (allVectors[0].length !== FULL_DIMS) {
    throw new Error(
      `Expected ${FULL_DIMS} dimensions but got ${allVectors[0].length}`,
    );
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate 128-dim version (truncate to first 128 dimensions)
  console.log("Generating 128-dim int8 embeddings...");
  const embeddings128: Record<string, string> = {};
  for (let i = 0; i < characters.length; i++) {
    const truncated = allVectors[i].slice(0, REDUCED_DIMS);
    embeddings128[characters[i]] = quantizeAndEncode(truncated);
  }

  const output128: EmbeddingOutput = {
    meta: {
      model: "paraphrase-multilingual-MiniLM-L12-v2",
      dims: REDUCED_DIMS,
      quantization: "int8",
    },
    embeddings: embeddings128,
  };

  const path128 = path.join(OUTPUT_DIR, "kanji-embeddings-128.json");
  fs.writeFileSync(path128, JSON.stringify(output128));
  const size128 = fs.statSync(path128).size;
  console.log(`Written: ${path128} (${(size128 / 1024).toFixed(1)} KB)`);

  // Generate 384-dim version (full dimensions)
  console.log("Generating 384-dim int8 embeddings...");
  const embeddings384: Record<string, string> = {};
  for (let i = 0; i < characters.length; i++) {
    embeddings384[characters[i]] = quantizeAndEncode(allVectors[i]);
  }

  const output384: EmbeddingOutput = {
    meta: {
      model: "paraphrase-multilingual-MiniLM-L12-v2",
      dims: FULL_DIMS,
      quantization: "int8",
    },
    embeddings: embeddings384,
  };

  const path384 = path.join(OUTPUT_DIR, "kanji-embeddings-384.json");
  fs.writeFileSync(path384, JSON.stringify(output384));
  const size384 = fs.statSync(path384).size;
  console.log(`Written: ${path384} (${(size384 / 1024).toFixed(1)} KB)`);

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Total kanji: ${characters.length}`);
  console.log(`Model: ${MODEL_NAME}`);
  console.log(`128-dim file: ${(size128 / 1024).toFixed(1)} KB (${path128})`);
  console.log(`384-dim file: ${(size384 / 1024).toFixed(1)} KB (${path384})`);
  console.log(`Input pattern: "character meanings..." (Pattern C)`);
  console.log(`Quantization: int8 (clamped to [-127, 127])`);

  // Dispose the pipeline to free resources
  await extractor.dispose();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
