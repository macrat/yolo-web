/**
 * Server-side embedding similarity module for kanji-kanaru.
 *
 * Loads 384-dimensional int8-quantized embeddings from src/data/ and provides
 * cosine similarity computation for category (semantic) feedback.
 * This module must only be imported from server-side code (Route Handlers)
 * because it reads a large JSON file that should not be included in the
 * client bundle.
 */

import type { FeedbackLevel } from "./types";
import embeddingsJson from "@/data/kanji-embeddings-384.json";

/** Similarity threshold: at or above this value, feedback is "correct". */
const THRESHOLD_CORRECT = 0.4;

/** Similarity threshold: at or above this value (but below correct), feedback is "close". */
const THRESHOLD_CLOSE = 0.35;

interface EmbeddingsData {
  meta: {
    model: string;
    dims: number;
    quantization: string;
  };
  embeddings: Record<string, string>;
}

/** Lazily-initialized cache of decoded embedding vectors. */
let embeddingCache: Map<string, Int8Array> | null = null;

/**
 * Decode a base64-encoded string into an Int8Array.
 */
function decodeBase64ToInt8Array(base64: string): Int8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  // Reinterpret as signed Int8Array (same underlying buffer)
  return new Int8Array(bytes.buffer);
}

/**
 * Initialize or retrieve the embedding cache.
 * Converts all base64-encoded vectors to Int8Arrays on first access.
 */
function getEmbeddingCache(): Map<string, Int8Array> {
  if (embeddingCache) return embeddingCache;

  const data = embeddingsJson as unknown as EmbeddingsData;
  const cache = new Map<string, Int8Array>();

  for (const [char, base64] of Object.entries(data.embeddings)) {
    cache.set(char, decodeBase64ToInt8Array(base64));
  }

  embeddingCache = cache;
  return cache;
}

/**
 * Compute the cosine similarity between two Int8Array vectors.
 * Returns a value between -1.0 and 1.0.
 */
export function getCosineSimilarity(a: Int8Array, b: Int8Array): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Evaluate the semantic similarity between two kanji characters
 * and return a FeedbackLevel based on embedding cosine similarity.
 *
 * Thresholds:
 * - correct: similarity >= 0.40
 * - close:   similarity >= 0.35
 * - wrong:   similarity < 0.35
 *
 * If either character lacks an embedding, returns "wrong".
 */
export function evaluateSimilarity(
  guessChar: string,
  targetChar: string,
): FeedbackLevel {
  // Same character is always correct
  if (guessChar === targetChar) return "correct";

  const cache = getEmbeddingCache();
  const guessVec = cache.get(guessChar);
  const targetVec = cache.get(targetChar);

  if (!guessVec || !targetVec) return "wrong";

  const similarity = getCosineSimilarity(guessVec, targetVec);

  if (similarity >= THRESHOLD_CORRECT) return "correct";
  if (similarity >= THRESHOLD_CLOSE) return "close";
  return "wrong";
}
