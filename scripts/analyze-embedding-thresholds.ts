/**
 * Embedding Threshold Analysis Script
 *
 * Analyzes kanji embedding vectors to:
 * A) Compare 128-dim vs 384-dim quality (Spearman rank correlation)
 * B) Determine correct/close/wrong thresholds
 * C) Verify information content for game convergence
 *
 * Usage: npx tsx scripts/analyze-embedding-thresholds.ts
 */

import * as fs from "fs";
import * as path from "path";

// ── Types ──────────────────────────────────────────────────────────

interface EmbeddingFile {
  meta: { model: string; dims: number; quantization: string };
  embeddings: Record<string, string>;
}

interface KanjiEntry {
  character: string;
  radical: string;
  radicalGroup: number;
  strokeCount: number;
  grade: number;
  onYomi: string[];
  kunYomi: string[];
  meanings: string[];
}

// ── Constants ──────────────────────────────────────────────────────

const DATA_DIR = path.resolve(__dirname, "../public/data");
const KANJI_DATA_PATH = path.resolve(__dirname, "../src/data/kanji-data.json");
const EMBEDDING_128_PATH = path.join(DATA_DIR, "kanji-embeddings-128.json");
const EMBEDDING_384_PATH = path.join(DATA_DIR, "kanji-embeddings-384.json");

/**
 * Number of kanji pairs to sample for Spearman correlation.
 * Full pairwise comparison of 2136 kanji = ~2.28M pairs, which is tractable
 * but we sample for performance while maintaining statistical validity.
 */
const SPEARMAN_SAMPLE_SIZE = 100_000;

/** Representative kanji pairs for qualitative threshold validation */
const VALIDATION_PAIRS: {
  a: string;
  b: string;
  expected: "correct" | "close" | "wrong";
  reason: string;
}[] = [
  // Pairs expected to be correct (very close meaning)
  { a: "海", b: "湖", expected: "correct", reason: "Both are bodies of water" },
  { a: "火", b: "炎", expected: "correct", reason: "Fire and flame" },
  { a: "山", b: "丘", expected: "correct", reason: "Mountain and hill" },
  { a: "父", b: "母", expected: "correct", reason: "Father and mother" },
  { a: "歩", b: "走", expected: "correct", reason: "Walk and run" },
  { a: "川", b: "河", expected: "correct", reason: "River (two words)" },
  { a: "刀", b: "剣", expected: "correct", reason: "Sword and blade" },
  { a: "見", b: "視", expected: "correct", reason: "See and watch" },
  { a: "学", b: "習", expected: "correct", reason: "Study and learn" },
  { a: "朝", b: "夕", expected: "correct", reason: "Morning and evening" },
  // Pairs expected to be close (related meaning)
  { a: "海", b: "川", expected: "close", reason: "Sea and river (both water)" },
  { a: "火", b: "熱", expected: "close", reason: "Fire and heat" },
  { a: "山", b: "谷", expected: "close", reason: "Mountain and valley" },
  { a: "木", b: "森", expected: "close", reason: "Tree and forest" },
  { a: "雨", b: "雪", expected: "close", reason: "Rain and snow" },
  { a: "手", b: "足", expected: "close", reason: "Hand and foot" },
  { a: "日", b: "月", expected: "close", reason: "Sun and moon" },
  { a: "読", b: "書", expected: "close", reason: "Read and write" },
  { a: "犬", b: "猫", expected: "close", reason: "Dog and cat" },
  { a: "男", b: "女", expected: "close", reason: "Man and woman" },
  // Pairs expected to be wrong (unrelated meaning)
  { a: "海", b: "金", expected: "wrong", reason: "Sea and gold" },
  { a: "火", b: "口", expected: "wrong", reason: "Fire and mouth" },
  { a: "山", b: "食", expected: "wrong", reason: "Mountain and food" },
  { a: "花", b: "鉄", expected: "wrong", reason: "Flower and iron" },
  { a: "目", b: "車", expected: "wrong", reason: "Eye and car" },
  { a: "空", b: "糸", expected: "wrong", reason: "Sky and thread" },
  { a: "心", b: "石", expected: "wrong", reason: "Heart and stone" },
  { a: "音", b: "田", expected: "wrong", reason: "Sound and rice field" },
  { a: "鳥", b: "数", expected: "wrong", reason: "Bird and number" },
  { a: "風", b: "刀", expected: "wrong", reason: "Wind and sword" },
];

// ── Helpers ────────────────────────────────────────────────────────

/** Decode a base64-encoded int8 embedding vector */
function decodeEmbedding(base64: string): Int8Array {
  const buffer = Buffer.from(base64, "base64");
  return new Int8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

/** Calculate cosine similarity between two int8 vectors */
function cosineSimilarity(a: Int8Array, b: Int8Array): number {
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
 * Calculate Spearman rank correlation between two arrays of values.
 * Uses the standard formula: rho = 1 - (6 * sum(d^2)) / (n * (n^2 - 1))
 */
function spearmanCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new Error("Arrays must have the same length");
  }
  const n = x.length;

  // Compute ranks (handling ties with average rank)
  const rankX = computeRanks(x);
  const rankY = computeRanks(y);

  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    const d = rankX[i] - rankY[i];
    sumD2 += d * d;
  }

  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

/** Compute ranks for an array, using average ranks for ties */
function computeRanks(values: number[]): number[] {
  const indexed = values.map((v, i) => ({ value: v, index: i }));
  indexed.sort((a, b) => a.value - b.value);

  const ranks = new Array<number>(values.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    // Find all elements with the same value (ties)
    while (j < indexed.length && indexed[j].value === indexed[i].value) {
      j++;
    }
    // Assign average rank to all tied elements
    const avgRank = (i + j + 1) / 2; // 1-based average rank
    for (let k = i; k < j; k++) {
      ranks[indexed[k].index] = avgRank;
    }
    i = j;
  }
  return ranks;
}

/** Calculate Shannon entropy in bits */
function entropy(probabilities: number[]): number {
  let h = 0;
  for (const p of probabilities) {
    if (p > 0) {
      h -= p * Math.log2(p);
    }
  }
  return h;
}

// ── Step A: Dimension Quality Comparison ───────────────────────────

function stepA(
  embeddings128: Map<string, Int8Array>,
  embeddings384: Map<string, Int8Array>,
  kanjiChars: string[],
): { rho: number; recommendation: 128 | 384 } {
  console.log("\n========================================");
  console.log("Step A: 128-dim vs 384-dim Quality Comparison");
  console.log("========================================\n");

  // Sample random pairs for Spearman correlation
  const pairCount = Math.min(
    SPEARMAN_SAMPLE_SIZE,
    (kanjiChars.length * (kanjiChars.length - 1)) / 2,
  );
  console.log(`Sampling ${pairCount.toLocaleString()} random pairs...`);

  const similarities128: number[] = [];
  const similarities384: number[] = [];

  // Use deterministic sampling by stepping through pairs
  const totalPairs = (kanjiChars.length * (kanjiChars.length - 1)) / 2;
  const step = Math.max(1, Math.floor(totalPairs / pairCount));

  let pairIndex = 0;
  let sampledCount = 0;
  outer: for (let i = 0; i < kanjiChars.length; i++) {
    for (let j = i + 1; j < kanjiChars.length; j++) {
      if (pairIndex % step === 0 && sampledCount < pairCount) {
        const charA = kanjiChars[i];
        const charB = kanjiChars[j];
        const vec128A = embeddings128.get(charA)!;
        const vec128B = embeddings128.get(charB)!;
        const vec384A = embeddings384.get(charA)!;
        const vec384B = embeddings384.get(charB)!;

        similarities128.push(cosineSimilarity(vec128A, vec128B));
        similarities384.push(cosineSimilarity(vec384A, vec384B));
        sampledCount++;
        if (sampledCount >= pairCount) break outer;
      }
      pairIndex++;
    }
  }

  console.log(`Actually sampled: ${sampledCount.toLocaleString()} pairs`);
  console.log("Computing Spearman rank correlation...");

  const rho = spearmanCorrelation(similarities128, similarities384);
  console.log(`Spearman rho = ${rho.toFixed(6)}`);

  const recommendation = rho > 0.95 ? 128 : 384;
  console.log(
    `Recommendation: ${recommendation}-dim (threshold: rho > 0.95 → 128-dim)`,
  );

  if (recommendation === 128) {
    console.log(
      "  Rationale: High rank correlation indicates 128-dim preserves " +
        "relative similarity rankings. Smaller file size (356KB vs 1.1MB) " +
        "benefits load time.",
    );
  } else {
    console.log(
      "  Rationale: Low rank correlation indicates 128-dim loses significant " +
        "information. 384-dim is needed for accurate similarity judgments. " +
        "Note: Vercel size limits may be a concern.",
    );
  }

  return { rho, recommendation };
}

// ── Step B: Threshold Determination ────────────────────────────────

function stepB(
  embeddings: Map<string, Int8Array>,
  kanjiChars: string[],
  dims: number,
): {
  correctThreshold: number;
  closeThreshold: number;
  distribution: { percentile: number; similarity: number }[];
} {
  console.log("\n========================================");
  console.log(`Step B: Threshold Determination (${dims}-dim)`);
  console.log("========================================\n");

  // Compute all pairwise similarities (for distribution analysis)
  // Use sampled pairs for efficiency
  const sampleSize = 200_000;
  const totalPairs = (kanjiChars.length * (kanjiChars.length - 1)) / 2;
  const step = Math.max(1, Math.floor(totalPairs / sampleSize));

  console.log(
    `Sampling ~${sampleSize.toLocaleString()} pairs for distribution analysis...`,
  );
  const allSimilarities: number[] = [];

  let pairIndex = 0;
  outer: for (let i = 0; i < kanjiChars.length; i++) {
    for (let j = i + 1; j < kanjiChars.length; j++) {
      if (pairIndex % step === 0) {
        const vecA = embeddings.get(kanjiChars[i])!;
        const vecB = embeddings.get(kanjiChars[j])!;
        allSimilarities.push(cosineSimilarity(vecA, vecB));
        if (allSimilarities.length >= sampleSize) break outer;
      }
      pairIndex++;
    }
  }

  allSimilarities.sort((a, b) => a - b);

  // Print distribution percentiles
  const percentiles = [50, 75, 80, 85, 90, 95, 97, 99, 99.5, 99.9];
  console.log("\nSimilarity distribution percentiles:");
  const distribution: { percentile: number; similarity: number }[] = [];
  for (const p of percentiles) {
    const idx = Math.floor((allSimilarities.length * p) / 100);
    const sim = allSimilarities[Math.min(idx, allSimilarities.length - 1)];
    distribution.push({ percentile: p, similarity: sim });
    console.log(`  P${p}: ${sim.toFixed(4)}`);
  }

  console.log(
    `  Min: ${allSimilarities[0].toFixed(4)}, Max: ${allSimilarities[allSimilarities.length - 1].toFixed(4)}`,
  );
  console.log(
    `  Mean: ${(allSimilarities.reduce((s, v) => s + v, 0) / allSimilarities.length).toFixed(4)}`,
  );

  // First, check validation pairs to understand where meaningful pairs fall
  console.log("\n--- Validation pair similarities ---");
  const correctPairSims: number[] = [];
  const closePairSims: number[] = [];
  const wrongPairSims: number[] = [];

  for (const pair of VALIDATION_PAIRS) {
    const vecA = embeddings.get(pair.a);
    const vecB = embeddings.get(pair.b);
    if (!vecA || !vecB) {
      console.log(`  WARNING: Missing embedding for ${pair.a} or ${pair.b}`);
      continue;
    }
    const sim = cosineSimilarity(vecA, vecB);
    console.log(
      `  ${pair.a}-${pair.b}: ${sim.toFixed(4)} (expected: ${pair.expected}, ${pair.reason})`,
    );
    if (pair.expected === "correct") correctPairSims.push(sim);
    else if (pair.expected === "close") closePairSims.push(sim);
    else wrongPairSims.push(sim);
  }

  console.log("\n--- Similarity ranges by expected category ---");
  if (correctPairSims.length > 0) {
    console.log(
      `  correct pairs: min=${Math.min(...correctPairSims).toFixed(4)}, max=${Math.max(...correctPairSims).toFixed(4)}, avg=${(correctPairSims.reduce((s, v) => s + v, 0) / correctPairSims.length).toFixed(4)}`,
    );
  }
  if (closePairSims.length > 0) {
    console.log(
      `  close pairs:   min=${Math.min(...closePairSims).toFixed(4)}, max=${Math.max(...closePairSims).toFixed(4)}, avg=${(closePairSims.reduce((s, v) => s + v, 0) / closePairSims.length).toFixed(4)}`,
    );
  }
  if (wrongPairSims.length > 0) {
    console.log(
      `  wrong pairs:   min=${Math.min(...wrongPairSims).toFixed(4)}, max=${Math.max(...wrongPairSims).toFixed(4)}, avg=${(wrongPairSims.reduce((s, v) => s + v, 0) / wrongPairSims.length).toFixed(4)}`,
    );
  }

  // Determine thresholds based on validation pairs and distribution
  // correct threshold: should capture pairs like 海-湖, 火-炎 but not close pairs
  // close threshold: should separate close pairs from wrong pairs

  // Use the minimum of correct pair similarities as a starting point,
  // then adjust based on distribution to avoid too many false positives
  const minCorrectSim = Math.min(...correctPairSims);
  const maxCloseSim = Math.max(...closePairSims);
  const maxWrongSim = Math.max(...wrongPairSims);

  // ── Data-driven threshold selection ──
  // The embedding model measures semantic similarity of meaning descriptions,
  // not conceptual relatedness. We use the distribution and information-theoretic
  // criteria to find optimal thresholds for game playability.
  //
  // Key insight from the data:
  // - Truly synonymous pairs (妬-嫉, 選-択, 火-炎) score 0.70-0.99
  // - Strongly related pairs (父-母, 山-丘, 学-習) score 0.50-0.70
  // - Moderately related pairs (火-熱, 男-女, 上-下) score 0.30-0.50
  // - Weakly/unrelated pairs score below 0.30

  // Candidate thresholds: scan the full range with finer granularity
  const correctCandidates = [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7];
  const closeCandidates = [0.15, 0.2, 0.25, 0.3, 0.35];

  console.log("\n--- Threshold candidate analysis ---");
  console.log(
    "For each correct threshold, counting how many of 2136 kanji " +
      "would be 'correct' for a random target:",
  );

  for (const ct of correctCandidates) {
    const aboveCount = allSimilarities.filter((s) => s >= ct).length;
    const pct = ((aboveCount / allSimilarities.length) * 100).toFixed(2);
    const avgCorrectPerTarget = Math.round(
      (aboveCount / allSimilarities.length) * (kanjiChars.length - 1),
    );
    console.log(
      `  correct >= ${ct.toFixed(2)}: ${pct}% of pairs (avg ~${avgCorrectPerTarget} per target)`,
    );
  }

  console.log("");
  for (const clt of closeCandidates) {
    for (const ct of [0.5, 0.55, 0.6]) {
      const betweenCount = allSimilarities.filter(
        (s) => s >= clt && s < ct,
      ).length;
      const pct = ((betweenCount / allSimilarities.length) * 100).toFixed(2);
      const avgClosePerTarget = Math.round(
        (betweenCount / allSimilarities.length) * (kanjiChars.length - 1),
      );
      console.log(
        `  close >= ${clt.toFixed(2)} (& < ${ct.toFixed(2)}): ${pct}% of pairs (avg ~${avgClosePerTarget} per target)`,
      );
    }
  }

  // ── Information-theoretic threshold optimization ──
  // For each candidate (correct, close) threshold pair, compute the
  // category feedback entropy. Higher entropy = more information per guess.
  console.log("\n--- Entropy optimization ---");
  console.log("Computing category entropy for each threshold combination...");

  let bestCorrectThreshold = 0.5;
  let bestCloseThreshold = 0.25;
  let bestEntropy = 0;

  // Sample 100 targets for entropy computation
  const entropyTargets = kanjiChars.filter(
    (_, i) => i % Math.max(1, Math.floor(kanjiChars.length / 100)) === 0,
  );

  for (const ct of correctCandidates) {
    for (const clt of closeCandidates) {
      if (clt >= ct) continue; // close threshold must be below correct threshold

      let totalH = 0;
      for (const target of entropyTargets) {
        const targetVec = embeddings.get(target)!;
        let correctN = 0;
        let closeN = 0;
        let wrongN = 0;
        for (const candidate of kanjiChars) {
          if (candidate === target) continue;
          const sim = cosineSimilarity(targetVec, embeddings.get(candidate)!);
          if (sim >= ct) correctN++;
          else if (sim >= clt) closeN++;
          else wrongN++;
        }
        const total = correctN + closeN + wrongN;
        const probs = [correctN / total, closeN / total, wrongN / total];
        totalH += entropy(probs);
      }
      const avgH = totalH / entropyTargets.length;

      // Also check that wrong validation pairs are below close threshold
      const wrongAboveClose = wrongPairSims.filter((s) => s >= clt).length;

      console.log(
        `  correct=${ct.toFixed(2)} close=${clt.toFixed(2)}: entropy=${avgH.toFixed(4)} bits` +
          (wrongAboveClose > 0
            ? ` (${wrongAboveClose} wrong pairs misclassified)`
            : ""),
      );

      // Prefer thresholds that: (1) maximize entropy, (2) don't misclassify wrong pairs
      if (wrongAboveClose === 0 && avgH > bestEntropy) {
        bestEntropy = avgH;
        bestCorrectThreshold = ct;
        bestCloseThreshold = clt;
      }
    }
  }

  // If no threshold avoids all wrong misclassifications, pick the best entropy
  // with the fewest misclassifications
  if (bestEntropy === 0) {
    console.log(
      "\n  No threshold pair avoids all wrong-pair misclassifications.",
    );
    console.log("  Selecting threshold with best entropy overall...");

    let minMisclass = Infinity;
    for (const ct of correctCandidates) {
      for (const clt of closeCandidates) {
        if (clt >= ct) continue;
        const wrongAboveClose = wrongPairSims.filter((s) => s >= clt).length;
        let totalH = 0;
        for (const target of entropyTargets) {
          const targetVec = embeddings.get(target)!;
          let correctN = 0;
          let closeN = 0;
          let wrongN = 0;
          for (const candidate of kanjiChars) {
            if (candidate === target) continue;
            const sim = cosineSimilarity(targetVec, embeddings.get(candidate)!);
            if (sim >= ct) correctN++;
            else if (sim >= clt) closeN++;
            else wrongN++;
          }
          const total = correctN + closeN + wrongN;
          totalH += entropy([correctN / total, closeN / total, wrongN / total]);
        }
        const avgH = totalH / entropyTargets.length;
        if (
          wrongAboveClose < minMisclass ||
          (wrongAboveClose === minMisclass && avgH > bestEntropy)
        ) {
          minMisclass = wrongAboveClose;
          bestEntropy = avgH;
          bestCorrectThreshold = ct;
          bestCloseThreshold = clt;
        }
      }
    }
  }

  console.log(`\n--- Selected thresholds ---`);
  console.log(`  correct threshold: ${bestCorrectThreshold.toFixed(2)}`);
  console.log(`  close threshold:   ${bestCloseThreshold.toFixed(2)}`);
  console.log(`  Min correct validation pair sim: ${minCorrectSim.toFixed(4)}`);
  console.log(`  Max close validation pair sim:   ${maxCloseSim.toFixed(4)}`);
  console.log(`  Max wrong validation pair sim:   ${maxWrongSim.toFixed(4)}`);

  // Verify all validation pairs
  console.log("\n--- Verification against validation pairs ---");
  let allCorrect = true;
  for (const pair of VALIDATION_PAIRS) {
    const vecA = embeddings.get(pair.a);
    const vecB = embeddings.get(pair.b);
    if (!vecA || !vecB) continue;
    const sim = cosineSimilarity(vecA, vecB);
    let actual: "correct" | "close" | "wrong";
    if (sim >= bestCorrectThreshold) actual = "correct";
    else if (sim >= bestCloseThreshold) actual = "close";
    else actual = "wrong";

    const match = actual === pair.expected ? "OK" : "MISMATCH";
    if (match === "MISMATCH") allCorrect = false;
    console.log(
      `  ${pair.a}-${pair.b}: sim=${sim.toFixed(4)} → ${actual} (expected: ${pair.expected}) [${match}]`,
    );
  }

  if (!allCorrect) {
    console.log(
      "\n  WARNING: Some validation pairs do not match expected categories.",
    );
    console.log("  This may indicate the thresholds need manual adjustment or");
    console.log(
      "  the embedding model's similarity does not align with intuition.",
    );
  }

  return {
    correctThreshold: bestCorrectThreshold,
    closeThreshold: bestCloseThreshold,
    distribution,
  };
}

// ── Step C: Information Content Verification ───────────────────────

function stepC(
  embeddings: Map<string, Int8Array>,
  kanjiChars: string[],
  kanjiData: KanjiEntry[],
  correctThreshold: number,
  closeThreshold: number,
): {
  categoryEntropy: number;
  totalEntropy: number;
  bitsNeeded: number;
  converges: boolean;
} {
  console.log("\n========================================");
  console.log("Step C: Information Content Verification");
  console.log("========================================\n");

  const bitsNeeded = Math.log2(kanjiChars.length);
  console.log(
    `Bits needed to identify 1 kanji from ${kanjiChars.length}: ${bitsNeeded.toFixed(2)} bits`,
  );

  // Calculate category feedback entropy
  // For each kanji as target, count how many candidates fall into each category
  console.log(
    "\nCalculating category feedback entropy (sampling 200 targets)...",
  );

  const sampleTargets = kanjiChars.filter(
    (_, i) => i % Math.max(1, Math.floor(kanjiChars.length / 200)) === 0,
  );

  let totalCategoryEntropy = 0;
  const avgCategoryCounts = { correct: 0, close: 0, wrong: 0 };

  for (const target of sampleTargets) {
    const targetVec = embeddings.get(target)!;
    let correctCount = 0;
    let closeCount = 0;
    let wrongCount = 0;

    for (const candidate of kanjiChars) {
      if (candidate === target) continue;
      const sim = cosineSimilarity(targetVec, embeddings.get(candidate)!);
      if (sim >= correctThreshold) correctCount++;
      else if (sim >= closeThreshold) closeCount++;
      else wrongCount++;
    }

    const total = correctCount + closeCount + wrongCount;
    const probs = [
      correctCount / total,
      closeCount / total,
      wrongCount / total,
    ];
    totalCategoryEntropy += entropy(probs);

    avgCategoryCounts.correct += correctCount;
    avgCategoryCounts.close += closeCount;
    avgCategoryCounts.wrong += wrongCount;
  }

  const avgCategoryEntropy = totalCategoryEntropy / sampleTargets.length;
  avgCategoryCounts.correct /= sampleTargets.length;
  avgCategoryCounts.close /= sampleTargets.length;
  avgCategoryCounts.wrong /= sampleTargets.length;

  console.log(
    `\nCategory feedback (average over ${sampleTargets.length} sampled targets):`,
  );
  console.log(
    `  correct: avg ${avgCategoryCounts.correct.toFixed(1)} kanji (${((avgCategoryCounts.correct / (kanjiChars.length - 1)) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  close:   avg ${avgCategoryCounts.close.toFixed(1)} kanji (${((avgCategoryCounts.close / (kanjiChars.length - 1)) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  wrong:   avg ${avgCategoryCounts.wrong.toFixed(1)} kanji (${((avgCategoryCounts.wrong / (kanjiChars.length - 1)) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  Category entropy: ${avgCategoryEntropy.toFixed(4)} bits per guess`,
  );

  // Calculate entropy for other feedback columns
  console.log("\nCalculating entropy for other feedback columns...");

  // Radical feedback: binary (correct/wrong)
  const radicalGroups = new Map<string, number>();
  for (const entry of kanjiData) {
    radicalGroups.set(
      entry.radical,
      (radicalGroups.get(entry.radical) ?? 0) + 1,
    );
  }
  // For binary feedback (match/no-match), the entropy depends on the guess
  // Average entropy: for each possible radical, P(correct)=count/total
  let avgRadicalEntropy = 0;
  for (const count of radicalGroups.values()) {
    const pCorrect = count / kanjiData.length;
    const pWrong = 1 - pCorrect;
    avgRadicalEntropy +=
      (count / kanjiData.length) * entropy([pCorrect, pWrong]);
  }
  console.log(
    `  Radical: ${avgRadicalEntropy.toFixed(4)} bits (binary correct/wrong)`,
  );

  // Stroke count feedback: correct / close (within +/-2) / wrong
  const strokeCounts = new Map<number, number>();
  for (const entry of kanjiData) {
    strokeCounts.set(
      entry.strokeCount,
      (strokeCounts.get(entry.strokeCount) ?? 0) + 1,
    );
  }
  let avgStrokeEntropy = 0;
  const uniqueStrokes = Array.from(strokeCounts.keys()).sort((a, b) => a - b);
  for (const guessStroke of uniqueStrokes) {
    const guessCount = strokeCounts.get(guessStroke)!;
    let correctN = 0;
    let closeN = 0;
    let wrongN = 0;
    for (const targetStroke of uniqueStrokes) {
      const targetCount = strokeCounts.get(targetStroke)!;
      const diff = Math.abs(guessStroke - targetStroke);
      if (diff === 0) correctN += targetCount;
      else if (diff <= 2) closeN += targetCount;
      else wrongN += targetCount;
    }
    const total = correctN + closeN + wrongN;
    const probs = [correctN / total, closeN / total, wrongN / total].filter(
      (p) => p > 0,
    );
    avgStrokeEntropy += (guessCount / kanjiData.length) * entropy(probs);
  }
  console.log(
    `  Stroke count: ${avgStrokeEntropy.toFixed(4)} bits (correct/close±2/wrong)`,
  );

  // Grade feedback: correct / close (within +/-1) / wrong + direction
  const grades = new Map<number, number>();
  for (const entry of kanjiData) {
    grades.set(entry.grade, (grades.get(entry.grade) ?? 0) + 1);
  }
  let avgGradeEntropy = 0;
  const uniqueGrades = Array.from(grades.keys()).sort((a, b) => a - b);
  for (const guessGrade of uniqueGrades) {
    const guessCount = grades.get(guessGrade)!;
    let correctN = 0;
    let closeUpN = 0;
    let closeDownN = 0;
    let wrongUpN = 0;
    let wrongDownN = 0;
    for (const targetGrade of uniqueGrades) {
      const targetCount = grades.get(targetGrade)!;
      const diff = targetGrade - guessGrade;
      if (diff === 0) correctN += targetCount;
      else if (Math.abs(diff) <= 1 && diff > 0) closeUpN += targetCount;
      else if (Math.abs(diff) <= 1 && diff < 0) closeDownN += targetCount;
      else if (diff > 0) wrongUpN += targetCount;
      else wrongDownN += targetCount;
    }
    const total = correctN + closeUpN + closeDownN + wrongUpN + wrongDownN;
    const probs = [
      correctN / total,
      closeUpN / total,
      closeDownN / total,
      wrongUpN / total,
      wrongDownN / total,
    ].filter((p) => p > 0);
    avgGradeEntropy += (guessCount / kanjiData.length) * entropy(probs);
  }
  console.log(
    `  Grade: ${avgGradeEntropy.toFixed(4)} bits (correct/close±1+direction/wrong+direction)`,
  );

  // On'yomi feedback: binary (correct = shares at least one reading / wrong)
  // This requires comparing all pairs, sample instead
  console.log("  On'yomi: computing (sampling 200 targets)...");
  let avgOnYomiEntropy = 0;
  for (const target of sampleTargets) {
    const targetEntry = kanjiData.find((k) => k.character === target);
    if (!targetEntry) continue;
    let matchCount = 0;
    for (const candidate of kanjiData) {
      if (candidate.character === target) continue;
      const shares = candidate.onYomi.some((r) =>
        targetEntry.onYomi.includes(r),
      );
      if (shares) matchCount++;
    }
    const total = kanjiData.length - 1;
    const pCorrect = matchCount / total;
    const pWrong = 1 - pCorrect;
    avgOnYomiEntropy += entropy([pCorrect, pWrong].filter((p) => p > 0));
  }
  avgOnYomiEntropy /= sampleTargets.length;
  console.log(
    `  On'yomi: ${avgOnYomiEntropy.toFixed(4)} bits (binary correct/wrong)`,
  );

  // Kun'yomi count feedback: correct / close (within +/-1) / wrong
  const kunYomiCounts = new Map<number, number>();
  for (const entry of kanjiData) {
    const count = entry.kunYomi.length;
    kunYomiCounts.set(count, (kunYomiCounts.get(count) ?? 0) + 1);
  }
  let avgKunYomiEntropy = 0;
  const uniqueKunCounts = Array.from(kunYomiCounts.keys()).sort(
    (a, b) => a - b,
  );
  for (const guessCount of uniqueKunCounts) {
    const guessN = kunYomiCounts.get(guessCount)!;
    let correctN = 0;
    let closeN = 0;
    let wrongN = 0;
    for (const targetCount of uniqueKunCounts) {
      const targetN = kunYomiCounts.get(targetCount)!;
      const diff = Math.abs(guessCount - targetCount);
      if (diff === 0) correctN += targetN;
      else if (diff <= 1) closeN += targetN;
      else wrongN += targetN;
    }
    const total = correctN + closeN + wrongN;
    const probs = [correctN / total, closeN / total, wrongN / total].filter(
      (p) => p > 0,
    );
    avgKunYomiEntropy += (guessN / kanjiData.length) * entropy(probs);
  }
  console.log(
    `  Kun'yomi count: ${avgKunYomiEntropy.toFixed(4)} bits (correct/close±1/wrong)`,
  );

  // Total information per guess
  const totalEntropy =
    avgCategoryEntropy +
    avgRadicalEntropy +
    avgStrokeEntropy +
    avgGradeEntropy +
    avgOnYomiEntropy +
    avgKunYomiEntropy;

  console.log(`\n--- Information Summary ---`);
  console.log(`  Category (embedding):  ${avgCategoryEntropy.toFixed(4)} bits`);
  console.log(`  Radical:               ${avgRadicalEntropy.toFixed(4)} bits`);
  console.log(`  Stroke count:          ${avgStrokeEntropy.toFixed(4)} bits`);
  console.log(`  Grade + direction:     ${avgGradeEntropy.toFixed(4)} bits`);
  console.log(`  On'yomi:               ${avgOnYomiEntropy.toFixed(4)} bits`);
  console.log(`  Kun'yomi count:        ${avgKunYomiEntropy.toFixed(4)} bits`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Total per guess:       ${totalEntropy.toFixed(4)} bits`);
  console.log(`  Total over 6 guesses:  ${(totalEntropy * 6).toFixed(4)} bits`);
  console.log(`  Bits needed:           ${bitsNeeded.toFixed(4)} bits`);

  const converges = totalEntropy * 6 >= bitsNeeded;
  console.log(
    `\n  Convergence: ${converges ? "YES" : "NO"} (${(totalEntropy * 6).toFixed(2)} ${converges ? ">=" : "<"} ${bitsNeeded.toFixed(2)} bits)`,
  );

  if (!converges) {
    console.log(
      "  WARNING: 6 guesses may not provide enough information to identify " +
        "the target kanji. Consider adjusting thresholds to increase category entropy.",
    );
  } else {
    console.log(
      "  Note: This is a theoretical upper bound assuming optimal play. " +
        "Actual information gain depends on guess strategy.",
    );
  }

  return {
    categoryEntropy: avgCategoryEntropy,
    totalEntropy,
    bitsNeeded,
    converges,
  };
}

// ── Step D: Additional pair analysis ──────────────────────────────

function stepD(
  embeddings: Map<string, Int8Array>,
  kanjiChars: string[],
  correctThreshold: number,
  closeThreshold: number,
): void {
  console.log("\n========================================");
  console.log("Step D: Extended Pair Analysis");
  console.log("========================================\n");

  // Find top-N most similar pairs overall
  console.log("Finding top 30 most similar kanji pairs...");
  const topPairs: { a: string; b: string; sim: number }[] = [];

  // Sample systematically to find high-similarity pairs
  for (let i = 0; i < kanjiChars.length; i++) {
    const vecA = embeddings.get(kanjiChars[i])!;
    for (let j = i + 1; j < kanjiChars.length; j++) {
      const sim = cosineSimilarity(vecA, embeddings.get(kanjiChars[j])!);
      if (topPairs.length < 30 || sim > topPairs[topPairs.length - 1].sim) {
        topPairs.push({ a: kanjiChars[i], b: kanjiChars[j], sim });
        topPairs.sort((x, y) => y.sim - x.sim);
        if (topPairs.length > 30) topPairs.pop();
      }
    }
    // Progress indicator every 500 kanji
    if (i % 500 === 0 && i > 0) {
      console.log(`  Progress: ${i}/${kanjiChars.length} kanji processed...`);
    }
  }

  console.log("\nTop 30 most similar pairs:");
  for (const pair of topPairs) {
    let category: string;
    if (pair.sim >= correctThreshold) category = "correct";
    else if (pair.sim >= closeThreshold) category = "close";
    else category = "wrong";
    console.log(`  ${pair.a}-${pair.b}: ${pair.sim.toFixed(4)} → ${category}`);
  }

  // Find pairs near the correct threshold boundary
  console.log(
    `\nPairs near correct threshold (${correctThreshold.toFixed(2)} ± 0.03):`,
  );
  const nearCorrect: { a: string; b: string; sim: number }[] = [];
  const step = Math.max(
    1,
    Math.floor((kanjiChars.length * (kanjiChars.length - 1)) / 2 / 500_000),
  );
  let pIdx = 0;
  for (let i = 0; i < kanjiChars.length && nearCorrect.length < 20; i++) {
    const vecA = embeddings.get(kanjiChars[i])!;
    for (let j = i + 1; j < kanjiChars.length; j++) {
      if (pIdx++ % step !== 0) continue;
      const sim = cosineSimilarity(vecA, embeddings.get(kanjiChars[j])!);
      if (Math.abs(sim - correctThreshold) <= 0.03 && nearCorrect.length < 20) {
        nearCorrect.push({ a: kanjiChars[i], b: kanjiChars[j], sim });
      }
    }
  }
  nearCorrect.sort((a, b) => b.sim - a.sim);
  for (const pair of nearCorrect) {
    const side = pair.sim >= correctThreshold ? "correct" : "close";
    console.log(`  ${pair.a}-${pair.b}: ${pair.sim.toFixed(4)} → ${side}`);
  }

  // Find pairs near the close threshold boundary
  console.log(
    `\nPairs near close threshold (${closeThreshold.toFixed(2)} ± 0.03):`,
  );
  const nearClose: { a: string; b: string; sim: number }[] = [];
  pIdx = 0;
  for (let i = 0; i < kanjiChars.length && nearClose.length < 20; i++) {
    const vecA = embeddings.get(kanjiChars[i])!;
    for (let j = i + 1; j < kanjiChars.length; j++) {
      if (pIdx++ % step !== 0) continue;
      const sim = cosineSimilarity(vecA, embeddings.get(kanjiChars[j])!);
      if (Math.abs(sim - closeThreshold) <= 0.03 && nearClose.length < 20) {
        nearClose.push({ a: kanjiChars[i], b: kanjiChars[j], sim });
      }
    }
  }
  nearClose.sort((a, b) => b.sim - a.sim);
  for (const pair of nearClose) {
    const side = pair.sim >= closeThreshold ? "close" : "wrong";
    console.log(`  ${pair.a}-${pair.b}: ${pair.sim.toFixed(4)} → ${side}`);
  }

  // Check for "wrong" pairs that might feel intuitively close
  console.log(
    "\nSpot-check: Pairs commonly expected to be related but classified as wrong:",
  );
  const spotCheckPairs = [
    ["大", "小"],
    ["上", "下"],
    ["左", "右"],
    ["東", "西"],
    ["春", "夏"],
    ["天", "地"],
    ["白", "黒"],
    ["生", "死"],
    ["入", "出"],
    ["始", "終"],
  ];
  for (const [a, b] of spotCheckPairs) {
    const vecA = embeddings.get(a);
    const vecB = embeddings.get(b);
    if (!vecA || !vecB) {
      console.log(`  ${a}-${b}: missing embedding`);
      continue;
    }
    const sim = cosineSimilarity(vecA, vecB);
    let category: string;
    if (sim >= correctThreshold) category = "correct";
    else if (sim >= closeThreshold) category = "close";
    else category = "wrong";
    console.log(`  ${a}-${b}: ${sim.toFixed(4)} → ${category}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("=== Kanji Embedding Threshold Analysis ===\n");

  // Load data
  console.log("Loading embedding data...");
  const data128: EmbeddingFile = JSON.parse(
    fs.readFileSync(EMBEDDING_128_PATH, "utf-8"),
  );
  const data384: EmbeddingFile = JSON.parse(
    fs.readFileSync(EMBEDDING_384_PATH, "utf-8"),
  );

  console.log("Loading kanji data...");
  const kanjiData: KanjiEntry[] = JSON.parse(
    fs.readFileSync(KANJI_DATA_PATH, "utf-8"),
  );

  // Decode embeddings
  console.log("Decoding embeddings...");
  const embeddings128 = new Map<string, Int8Array>();
  for (const [char, b64] of Object.entries(data128.embeddings)) {
    embeddings128.set(char, decodeEmbedding(b64));
  }

  const embeddings384 = new Map<string, Int8Array>();
  for (const [char, b64] of Object.entries(data384.embeddings)) {
    embeddings384.set(char, decodeEmbedding(b64));
  }

  const kanjiChars = Object.keys(data128.embeddings);
  console.log(`Loaded ${kanjiChars.length} kanji embeddings`);
  console.log(
    `128-dim: ${data128.meta.dims} dims, 384-dim: ${data384.meta.dims} dims`,
  );

  // Step A: Dimension comparison
  const { rho, recommendation } = stepA(
    embeddings128,
    embeddings384,
    kanjiChars,
  );

  // Use the recommended embeddings for subsequent steps
  const selectedEmbeddings =
    recommendation === 128 ? embeddings128 : embeddings384;
  const selectedDims = recommendation;

  // Step B: Threshold determination
  const { correctThreshold, closeThreshold } = stepB(
    selectedEmbeddings,
    kanjiChars,
    selectedDims,
  );

  // Step C: Information content verification
  const { categoryEntropy, totalEntropy, bitsNeeded, converges } = stepC(
    selectedEmbeddings,
    kanjiChars,
    kanjiData,
    correctThreshold,
    closeThreshold,
  );

  // Step D: Extended pair analysis
  stepD(selectedEmbeddings, kanjiChars, correctThreshold, closeThreshold);

  // ── Final Summary ──────────────────────────────────────────────
  console.log("\n========================================");
  console.log("FINAL SUMMARY");
  console.log("========================================");
  console.log(`Recommended dimensions: ${recommendation}`);
  console.log(`Spearman rho (128 vs 384): ${rho.toFixed(6)}`);
  console.log(`Correct threshold: ${correctThreshold.toFixed(2)}`);
  console.log(`Close threshold: ${closeThreshold.toFixed(2)}`);
  console.log(`Category entropy: ${categoryEntropy.toFixed(4)} bits/guess`);
  console.log(`Total entropy: ${totalEntropy.toFixed(4)} bits/guess`);
  console.log(`Total over 6 guesses: ${(totalEntropy * 6).toFixed(4)} bits`);
  console.log(`Bits needed: ${bitsNeeded.toFixed(4)} bits`);
  console.log(`Convergence in 6 guesses: ${converges ? "YES" : "NO"}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
