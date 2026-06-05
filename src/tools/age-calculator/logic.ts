import { parseDate, formatDate } from "@/lib/date-validation";
import { diffUtcCalendarDays } from "@/tools/_lib/utc-day-serial";

// --- Date formatting helpers (re-export from shared utility) ---
export { parseDate, formatDate };

// --- Age Calculation ---

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
}

export function calculateAge(birthDate: Date, targetDate: Date): AgeResult {
  const birth = new Date(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );
  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  const totalDays = diffUtcCalendarDays(birth, target);

  const [earlier, later] = birth <= target ? [birth, target] : [target, birth];

  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = years * 12 + months;

  return { years, months, days, totalDays, totalMonths };
}

// --- Wareki (Japanese Era) Conversion ---

export interface WarekiInfo {
  era: string;
  year: number;
  formatted: string;
}

interface EraDefinition {
  name: string;
  startDate: Date; // Inclusive start date of era
}

const ERAS: EraDefinition[] = [
  { name: "令和", startDate: new Date(2019, 4, 1) }, // 2019-05-01
  { name: "平成", startDate: new Date(1989, 0, 8) }, // 1989-01-08
  { name: "昭和", startDate: new Date(1926, 11, 25) }, // 1926-12-25
  { name: "大正", startDate: new Date(1912, 6, 30) }, // 1912-07-30
  { name: "明治", startDate: new Date(1868, 0, 25) }, // 1868-01-25
];

export function toWareki(date: Date): WarekiInfo | null {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  for (const era of ERAS) {
    if (d >= era.startDate) {
      // Japanese era years follow calendar years, not anniversaries
      const eraYear = d.getFullYear() - era.startDate.getFullYear() + 1;
      const yearStr = eraYear === 1 ? "元" : String(eraYear);
      return {
        era: era.name,
        year: eraYear,
        formatted: `${era.name}${yearStr}年`,
      };
    }
  }
  return null;
}

// --- Zodiac (干支) ---

// 十二支の漢字と読み仮名のペア。FAQの順序（子〜亥）と一致させる。
const ZODIAC_ENTRIES: ReadonlyArray<{ kanji: string; reading: string }> = [
  { kanji: "子", reading: "ね" },
  { kanji: "丑", reading: "うし" },
  { kanji: "寅", reading: "とら" },
  { kanji: "卯", reading: "う" },
  { kanji: "辰", reading: "たつ" },
  { kanji: "巳", reading: "み" },
  { kanji: "午", reading: "うま" },
  { kanji: "未", reading: "ひつじ" },
  { kanji: "申", reading: "さる" },
  { kanji: "酉", reading: "とり" },
  { kanji: "戌", reading: "いぬ" },
  { kanji: "亥", reading: "い" },
] as const;

/** 生まれ年の西暦から干支の漢字一字を返す（後方互換・内部用）。 */
export function getZodiac(year: number): string {
  // 2020 = 子 (Rat). 2020 % 12 = 4, so offset is 4 for 子 (index 0)
  const index = (((year - 2020) % 12) + 12) % 12;
  return ZODIAC_ENTRIES[index].kanji;
}

/** 生まれ年の西暦から干支の漢字に読み仮名を括弧付きで付与した文字列を返す（例: 「午（うま）」）。 */
export function getZodiacWithReading(year: number): string {
  const index = (((year - 2020) % 12) + 12) % 12;
  const { kanji, reading } = ZODIAC_ENTRIES[index];
  return `${kanji}（${reading}）`;
}

// --- Constellation (星座) ---

interface ConstellationRange {
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const CONSTELLATIONS: ConstellationRange[] = [
  { name: "山羊座", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: "水瓶座", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: "魚座", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: "牡羊座", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: "牡牛座", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: "双子座", startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { name: "蟹座", startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { name: "獅子座", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: "乙女座", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: "天秤座", startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { name: "蠍座", startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
  { name: "射手座", startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
];

export function getConstellation(month: number, day: number): string {
  for (const c of CONSTELLATIONS) {
    if (c.startMonth === c.endMonth) {
      // Same month range
      if (month === c.startMonth && day >= c.startDay && day <= c.endDay) {
        return c.name;
      }
    } else if (c.startMonth > c.endMonth) {
      // Wraps around year (Capricorn: Dec-Jan)
      if (
        (month === c.startMonth && day >= c.startDay) ||
        (month === c.endMonth && day <= c.endDay)
      ) {
        return c.name;
      }
    } else {
      // Normal range
      if (
        (month === c.startMonth && day >= c.startDay) ||
        (month === c.endMonth && day <= c.endDay)
      ) {
        return c.name;
      }
    }
  }
  return "";
}
