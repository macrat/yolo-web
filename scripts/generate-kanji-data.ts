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
// Maps all 214 classical (Kangxi) radical numbers to semantic groups (1-20).
// Each radical is assigned to the group whose meaning best fits it,
// so that category feedback in the game feels intuitive to players.

// Group  1: 人・家族 — 9(人),10(儿),37(大),38(女),39(子),80(毋),81(比),83(氏),88(父),125(老),8(亠),42(小),49(己),168(長)
// Group  2: 体・器官 — 107(皮),109(目),128(耳),130(肉),132(自),135(舌),143(血),158(身),176(面),181(頁),188(骨),190(髟),185(首),209(鼻),211(齒)
// Group  3: 手・力・動作 — 19(力),29(又),55(廾),64(手),65(支),66(攴),87(爪),21(匕),58(彐)
// Group  4: 心・感情 — 61(心),194(鬼)
// Group  5: 口・言語 — 30(口),67(文),111(矢),129(聿),147(見),149(言),180(音),76(欠)
// Group  6: 足・移動 — 60(彳),77(止),105(癶),136(舛),144(行),156(走),157(足),162(辵),54(廴),70(方),133(至)
// Group  7: 水・液体 — 15(冫),85(水)
// Group  8: 火・光 — 86(火)
// Group  9: 木・植物 — 75(木),115(禾),118(竹),127(耒),140(艸),200(麻),45(屮)
// Group 10: 土・山・地形 — 32(土),46(山),47(巛),102(田),112(石),150(谷),161(辰),166(里),170(阜)
// Group 11: 天・気象 — 72(日),73(曰),74(月),84(气),173(雨),174(靑),182(風),201(黃),36(夕),71(无)
// Group 12: 動物 — 82(毛),93(牛),94(犬),123(羊),124(羽),142(虫),148(角),152(豕),153(豸),172(隹),187(馬),195(魚),196(鳥),198(鹿),122(网),141(虍)
// Group 13: 建物・場所 — 13(冂),40(宀),44(尸),53(广),63(戸),98(瓦),116(穴),117(立),121(缶),163(邑),169(門),14(冖),16(几),27(厂),31(囗),189(高)
// Group 14: 布・衣服 — 50(巾),59(彡),120(糸),145(衣),52(幺),146(襾),178(韋)
// Group 15: 刀・武器 — 18(刀),56(弋),57(弓),62(戈),78(歹),79(殳),160(辛),51(干),69(斤),110(矛),191(鬥)
// Group 16: 金・素材 — 95(玄),96(玉),106(白),155(赤),167(金),177(革),203(黑),48(工)
// Group 17: 食・飲 — 99(甘),108(皿),119(米),151(豆),164(酉),184(食),186(香),199(麦),68(斗),134(臼),193(鬲)
// Group 18: 乗り物・道具 — 137(舟),159(車),183(飛),91(片)
// Group 19: 社会・制度 — 24(十),41(寸),100(生),104(疒),113(示),139(色),154(貝),165(釆),26(卩),33(士),131(臣),12(八),175(非)
// Group 20: 抽象・記号 — 1(一),2(丨),3(丶),4(丿),5(乙),6(亅),7(二),11(入),17(凵),20(勹),22(匚),23(匸),25(卜),28(厶),34(夂),35(夊),43(尢),90(爿),89(爻),92(牙),97(瓜),101(用),103(疋),114(禸),126(而),138(艮),171(隶),179(韭),192(鬯),197(鹵),202(黍),204(黹),205(黽),206(鼎),207(鼓),208(鼠),210(齊),212(龍),213(龜),214(龠)

const RADICAL_TO_GROUP: Record<number, number> = {
  // Group 1: 人・家族
  9: 1,
  10: 1,
  37: 1,
  38: 1,
  39: 1,
  80: 1,
  81: 1,
  83: 1,
  88: 1,
  125: 1,
  8: 1,
  42: 1,
  49: 1,
  168: 1,
  // Group 2: 体・器官
  107: 2,
  109: 2,
  128: 2,
  130: 2,
  132: 2,
  135: 2,
  143: 2,
  158: 2,
  176: 2,
  181: 2,
  188: 2,
  190: 2,
  185: 2,
  209: 2,
  211: 2,
  // Group 3: 手・力・動作
  19: 3,
  29: 3,
  55: 3,
  64: 3,
  65: 3,
  66: 3,
  87: 3,
  21: 3,
  58: 3,
  // Group 4: 心・感情
  61: 4,
  194: 4,
  // Group 5: 口・言語
  30: 5,
  67: 5,
  111: 5,
  129: 5,
  147: 5,
  149: 5,
  180: 5,
  76: 5,
  // Group 6: 足・移動
  60: 6,
  77: 6,
  105: 6,
  136: 6,
  144: 6,
  156: 6,
  157: 6,
  162: 6,
  54: 6,
  70: 6,
  133: 6,
  // Group 7: 水・液体
  15: 7,
  85: 7,
  // Group 8: 火・光
  86: 8,
  // Group 9: 木・植物
  75: 9,
  115: 9,
  118: 9,
  127: 9,
  140: 9,
  200: 9,
  45: 9,
  // Group 10: 土・山・地形
  32: 10,
  46: 10,
  47: 10,
  102: 10,
  112: 10,
  150: 10,
  161: 10,
  166: 10,
  170: 10,
  // Group 11: 天・気象
  72: 11,
  73: 11,
  74: 11,
  84: 11,
  173: 11,
  174: 11,
  182: 11,
  201: 11,
  36: 11,
  71: 11,
  // Group 12: 動物
  82: 12,
  93: 12,
  94: 12,
  123: 12,
  124: 12,
  142: 12,
  148: 12,
  152: 12,
  153: 12,
  172: 12,
  187: 12,
  195: 12,
  196: 12,
  198: 12,
  122: 12,
  141: 12,
  // Group 13: 建物・場所
  13: 13,
  40: 13,
  44: 13,
  53: 13,
  63: 13,
  98: 13,
  116: 13,
  117: 13,
  121: 13,
  163: 13,
  169: 13,
  14: 13,
  16: 13,
  27: 13,
  31: 13,
  189: 13,
  // Group 14: 布・衣服
  50: 14,
  59: 14,
  120: 14,
  145: 14,
  52: 14,
  146: 14,
  178: 14,
  // Group 15: 刀・武器
  18: 15,
  56: 15,
  57: 15,
  62: 15,
  78: 15,
  79: 15,
  160: 15,
  51: 15,
  69: 15,
  110: 15,
  191: 15,
  // Group 16: 金・素材
  95: 16,
  96: 16,
  106: 16,
  155: 16,
  167: 16,
  177: 16,
  203: 16,
  48: 16,
  // Group 17: 食・飲
  99: 17,
  108: 17,
  119: 17,
  151: 17,
  164: 17,
  184: 17,
  186: 17,
  199: 17,
  68: 17,
  134: 17,
  193: 17,
  // Group 18: 乗り物・道具
  137: 18,
  159: 18,
  183: 18,
  91: 18,
  // Group 19: 社会・制度
  24: 19,
  41: 19,
  100: 19,
  104: 19,
  113: 19,
  139: 19,
  154: 19,
  165: 19,
  26: 19,
  33: 19,
  131: 19,
  12: 19,
  175: 19,
  // Group 20: 抽象・記号
  1: 20,
  2: 20,
  3: 20,
  4: 20,
  5: 20,
  6: 20,
  7: 20,
  11: 20,
  17: 20,
  20: 20,
  22: 20,
  23: 20,
  25: 20,
  28: 20,
  34: 20,
  35: 20,
  43: 20,
  90: 20,
  89: 20,
  92: 20,
  97: 20,
  101: 20,
  103: 20,
  114: 20,
  126: 20,
  138: 20,
  171: 20,
  179: 20,
  192: 20,
  197: 20,
  202: 20,
  204: 20,
  205: 20,
  206: 20,
  207: 20,
  208: 20,
  210: 20,
  212: 20,
  213: 20,
  214: 20,
};

// Validate that all 214 radicals are mapped (防御的チェック: 割り当て漏れ再発防止)
const TOTAL_RADICALS = 214;
const mappedRadicals = Object.keys(RADICAL_TO_GROUP).map(Number);
if (mappedRadicals.length !== TOTAL_RADICALS) {
  const missing = [];
  for (let i = 1; i <= TOTAL_RADICALS; i++) {
    if (!(i in RADICAL_TO_GROUP)) missing.push(i);
  }
  throw new Error(
    `RADICAL_TO_GROUP must cover all ${TOTAL_RADICALS} radicals. Missing: ${missing.join(", ")}`,
  );
}

function radicalNumberToGroup(radicalNumber: number): number {
  const group = RADICAL_TO_GROUP[radicalNumber];
  if (group === undefined) {
    throw new Error(`Invalid radical number: ${radicalNumber}`);
  }
  return group;
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
