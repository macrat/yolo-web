/**
 * KANJIDIC2 Joyo Kanji Extractor
 *
 * Extracts all 2,136 joyo kanji from KANJIDIC2 (jmdict-simplified format),
 * assigns radical group mappings, and outputs kanji-base.json.
 *
 * Data source: https://github.com/scriptin/jmdict-simplified
 * License: CC BY-SA 4.0 (EDRDG)
 *
 * Usage: npx tsx scripts/generate-kanji-data.ts
 */

import * as fs from "fs";
import * as path from "path";

// ── Radical Group Mapping ──────────────────────────────────────────
// Maps classical radical numbers (1-214) to radical groups (1-20).
// Based on the plan's range-based grouping of 214 Kangxi radicals.

function radicalNumberToGroup(radicalNumber: number): number {
  if (radicalNumber >= 1 && radicalNumber <= 6) return 1; // 基本図形
  if (radicalNumber >= 7 && radicalNumber <= 16) return 2; // 人と体上部
  if (radicalNumber >= 17 && radicalNumber <= 25) return 3; // 刃物と力
  if (radicalNumber >= 26 && radicalNumber <= 33) return 4; // 口と囲い
  if (radicalNumber >= 34 && radicalNumber <= 44) return 5; // 天文と時間
  if (radicalNumber >= 45 && radicalNumber <= 53) return 6; // 山と川
  if (radicalNumber >= 54 && radicalNumber <= 65) return 7; // 動作基本
  if (radicalNumber >= 66 && radicalNumber <= 74) return 8; // 打撃と文
  if (radicalNumber >= 75 && radicalNumber <= 86) return 9; // 木と欠
  if (radicalNumber >= 87 && radicalNumber <= 96) return 10; // 爪と父
  if (radicalNumber >= 97 && radicalNumber <= 108) return 11; // 瓜と生
  if (radicalNumber >= 109 && radicalNumber <= 119) return 12; // 目と矢
  if (radicalNumber >= 120 && radicalNumber <= 129) return 13; // 米と糸
  if (radicalNumber >= 130 && radicalNumber <= 139) return 14; // 筆と肉
  if (radicalNumber >= 140 && radicalNumber <= 148) return 15; // 草と虫
  if (radicalNumber >= 149 && radicalNumber <= 158) return 16; // 見と言
  if (radicalNumber >= 159 && radicalNumber <= 168) return 17; // 足と身
  if (radicalNumber >= 169 && radicalNumber <= 178) return 18; // 金と門
  if (radicalNumber >= 179 && radicalNumber <= 194) return 19; // 面と革
  if (radicalNumber >= 195 && radicalNumber <= 214) return 20; // 魚と鳥
  throw new Error(`Invalid radical number: ${radicalNumber}`);
}

// ── Radical Number to Character Mapping ────────────────────────────
// Maps classical radical numbers to their representative kanji characters.
// This is the standard Kangxi radical table.
const RADICAL_CHARACTERS: Record<number, string> = {
  1: "一",
  2: "丨",
  3: "丶",
  4: "丿",
  5: "乙",
  6: "亅",
  7: "二",
  8: "亠",
  9: "人",
  10: "儿",
  11: "入",
  12: "八",
  13: "冂",
  14: "冖",
  15: "冫",
  16: "几",
  17: "凵",
  18: "刀",
  19: "力",
  20: "勹",
  21: "匕",
  22: "匚",
  23: "匸",
  24: "十",
  25: "卜",
  26: "卩",
  27: "厂",
  28: "厶",
  29: "又",
  30: "口",
  31: "囗",
  32: "土",
  33: "士",
  34: "夂",
  35: "夊",
  36: "夕",
  37: "大",
  38: "女",
  39: "子",
  40: "宀",
  41: "寸",
  42: "小",
  43: "尢",
  44: "尸",
  45: "屮",
  46: "山",
  47: "巛",
  48: "工",
  49: "己",
  50: "巾",
  51: "干",
  52: "幺",
  53: "广",
  54: "廴",
  55: "廾",
  56: "弋",
  57: "弓",
  58: "彐",
  59: "彡",
  60: "彳",
  61: "心",
  62: "戈",
  63: "戸",
  64: "手",
  65: "支",
  66: "攴",
  67: "文",
  68: "斗",
  69: "斤",
  70: "方",
  71: "无",
  72: "日",
  73: "曰",
  74: "月",
  75: "木",
  76: "欠",
  77: "止",
  78: "歹",
  79: "殳",
  80: "毋",
  81: "比",
  82: "毛",
  83: "氏",
  84: "气",
  85: "水",
  86: "火",
  87: "爪",
  88: "父",
  89: "爻",
  90: "爿",
  91: "片",
  92: "牙",
  93: "牛",
  94: "犬",
  95: "玄",
  96: "玉",
  97: "瓜",
  98: "瓦",
  99: "甘",
  100: "生",
  101: "用",
  102: "田",
  103: "疋",
  104: "疒",
  105: "癶",
  106: "白",
  107: "皮",
  108: "皿",
  109: "目",
  110: "矛",
  111: "矢",
  112: "石",
  113: "示",
  114: "禸",
  115: "禾",
  116: "穴",
  117: "立",
  118: "竹",
  119: "米",
  120: "糸",
  121: "缶",
  122: "网",
  123: "羊",
  124: "羽",
  125: "老",
  126: "而",
  127: "耒",
  128: "耳",
  129: "聿",
  130: "肉",
  131: "臣",
  132: "自",
  133: "至",
  134: "臼",
  135: "舌",
  136: "舛",
  137: "舟",
  138: "艮",
  139: "色",
  140: "艸",
  141: "虍",
  142: "虫",
  143: "血",
  144: "行",
  145: "衣",
  146: "襾",
  147: "見",
  148: "角",
  149: "言",
  150: "谷",
  151: "豆",
  152: "豕",
  153: "豸",
  154: "貝",
  155: "赤",
  156: "走",
  157: "足",
  158: "身",
  159: "車",
  160: "辛",
  161: "辰",
  162: "辵",
  163: "邑",
  164: "酉",
  165: "釆",
  166: "里",
  167: "金",
  168: "長",
  169: "門",
  170: "阜",
  171: "隶",
  172: "隹",
  173: "雨",
  174: "靑",
  175: "非",
  176: "面",
  177: "革",
  178: "韋",
  179: "韭",
  180: "音",
  181: "頁",
  182: "風",
  183: "飛",
  184: "食",
  185: "首",
  186: "香",
  187: "馬",
  188: "骨",
  189: "高",
  190: "髟",
  191: "鬥",
  192: "鬯",
  193: "鬲",
  194: "鬼",
  195: "魚",
  196: "鳥",
  197: "鹵",
  198: "鹿",
  199: "麦",
  200: "麻",
  201: "黃",
  202: "黍",
  203: "黑",
  204: "黹",
  205: "黽",
  206: "鼎",
  207: "鼓",
  208: "鼠",
  209: "鼻",
  210: "齊",
  211: "齒",
  212: "龍",
  213: "龜",
  214: "龠",
};

// ── KANJIDIC2 entry type (simplified) ──────────────────────────────
interface Kanjidic2Entry {
  literal: string;
  radicals: { type: string; value: number }[];
  misc: {
    grade: number | null;
    strokeCounts: number[];
    radicalNames: string[];
  };
  readingMeaning: {
    groups: {
      readings: { type: string; value: string }[];
      meanings: { lang: string; value: string }[];
    }[];
  } | null;
}

interface Kanjidic2File {
  characters: Kanjidic2Entry[];
}

// ── Output type (matches KanjiEntry from types.ts) ─────────────────
interface KanjiBaseEntry {
  character: string;
  radical: string;
  radicalGroup: number;
  strokeCount: number;
  grade: number;
  onYomi: string[];
  kunYomi: string[];
  meanings: string[];
  category: number; // Will be the radical group ID; type alignment happens in task 2
  examples: string[];
}

function main(): void {
  const inputPath = path.resolve(__dirname, "tmp/kanjidic2-en-3.6.2.json");
  if (!fs.existsSync(inputPath)) {
    console.error(
      `KANJIDIC2 file not found: ${inputPath}\nDownload it from https://github.com/scriptin/jmdict-simplified/releases`,
    );
    process.exit(1);
  }

  const data: Kanjidic2File = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  console.log(`Loaded ${data.characters.length} characters from KANJIDIC2`);

  // Filter joyo kanji: grades 1-6 (elementary) and 8 (secondary)
  const joyoEntries = data.characters.filter((c) => {
    const g = c.misc.grade;
    return g !== null && g >= 1 && g <= 8 && g !== 7;
  });

  console.log(`Found ${joyoEntries.length} joyo kanji`);

  if (joyoEntries.length !== 2136) {
    console.error(
      `Expected 2,136 joyo kanji but found ${joyoEntries.length}. Aborting.`,
    );
    process.exit(1);
  }

  const result: KanjiBaseEntry[] = joyoEntries.map((entry) => {
    // Get classical radical number
    const classicalRadical = entry.radicals.find((r) => r.type === "classical");
    if (!classicalRadical) {
      throw new Error(`No classical radical found for ${entry.literal}`);
    }
    const radicalNumber = classicalRadical.value;
    const radicalChar = RADICAL_CHARACTERS[radicalNumber];
    if (!radicalChar) {
      throw new Error(
        `No radical character mapping for radical number ${radicalNumber}`,
      );
    }

    // Grade mapping: KANJIDIC2 grade 8 -> 7
    const rawGrade = entry.misc.grade!;
    const grade = rawGrade === 8 ? 7 : rawGrade;

    // Stroke count (first value is the standard count)
    const strokeCount = entry.misc.strokeCounts[0];

    // Extract readings and meanings
    const onYomi: string[] = [];
    const kunYomi: string[] = [];
    const meanings: string[] = [];

    if (entry.readingMeaning) {
      for (const group of entry.readingMeaning.groups) {
        for (const reading of group.readings) {
          if (reading.type === "ja_on") {
            onYomi.push(reading.value);
          } else if (reading.type === "ja_kun") {
            kunYomi.push(reading.value);
          }
        }
        for (const meaning of group.meanings) {
          if (meaning.lang === "en") {
            meanings.push(meaning.value);
          }
        }
      }
    }

    // Radical group from mapping table
    const radicalGroup = radicalNumberToGroup(radicalNumber);

    return {
      character: entry.literal,
      radical: radicalChar,
      radicalGroup: radicalNumber, // Keep the actual classical radical number
      strokeCount,
      grade,
      onYomi,
      kunYomi,
      meanings,
      category: radicalGroup, // Radical group ID (1-20)
      examples: [], // Will be filled by extract-jmdict-examples.ts
    };
  });

  // Sort by grade ascending, then by stroke count, then by Unicode code point
  result.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    if (a.strokeCount !== b.strokeCount) return a.strokeCount - b.strokeCount;
    return a.character.charCodeAt(0) - b.character.charCodeAt(0);
  });

  // Write intermediate output
  const outputPath = path.resolve(__dirname, "tmp/kanji-base.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");

  // Print statistics
  const gradeDistribution: Record<number, number> = {};
  const groupDistribution: Record<number, number> = {};
  for (const entry of result) {
    gradeDistribution[entry.grade] = (gradeDistribution[entry.grade] || 0) + 1;
    groupDistribution[entry.category] =
      (groupDistribution[entry.category] || 0) + 1;
  }

  console.log("\nGrade distribution:");
  for (const g of Object.keys(gradeDistribution).sort(
    (a, b) => Number(a) - Number(b),
  )) {
    console.log(`  Grade ${g}: ${gradeDistribution[Number(g)]} kanji`);
  }

  console.log("\nRadical group distribution:");
  for (const g of Object.keys(groupDistribution).sort(
    (a, b) => Number(a) - Number(b),
  )) {
    console.log(`  Group ${g}: ${groupDistribution[Number(g)]} kanji`);
  }

  console.log(`\nWrote ${result.length} entries to ${outputPath}`);
}

main();
