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

/** その年・月の日数。月は 0 から数える。 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 生まれた日から monthCount か月たった日（応当日）。年齢と月と日は、この日の当日から1つ進む。
 *
 * 年齢計算ニ関スル法律は、年齢を出生の日から数え、民法 143 条を準用する。民法 143 条2項では、期間は応当日の
 * 前日が終わった時に満ち、最後の月に応当日が無いときは、その月の末日が終わった時に満ちる。この道具は満ちた
 * 翌日を区切りの初日として数えるので、応当日のある月はその日、無い月は翌月の1日を区切りにする（1月31日
 * 生まれの1か月目は3月1日、2月29日生まれの平年の誕生日は3月1日）。
 */
function monthAnniversary(birth: Date, monthCount: number): Date {
  const year =
    birth.getFullYear() + Math.floor((birth.getMonth() + monthCount) / 12);
  const month = (birth.getMonth() + monthCount) % 12;
  if (birth.getDate() > daysInMonth(year, month)) {
    return new Date(year, month + 1, 1);
  }
  return new Date(year, month, birth.getDate());
}

/**
 * 生年月日から基準日までの年齢を、満ちた月の数と、最後の区切りの日から数えた残りの日数で返す。
 * 生年月日は基準日と同じ日か、それより前の日であること（画面がそれより後の日をエラーで返す）。
 */
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

  let totalMonths =
    (target.getFullYear() - birth.getFullYear()) * 12 +
    (target.getMonth() - birth.getMonth());
  if (monthAnniversary(birth, totalMonths) > target) totalMonths--;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: diffUtcCalendarDays(monthAnniversary(birth, totalMonths), target),
    totalDays: diffUtcCalendarDays(birth, target),
    totalMonths,
  };
}

// --- Wareki (Japanese Era) Conversion ---

export interface WarekiInfo {
  era: string;
  year: number;
  /** 年の表記。1年目は「元年」、ほかは「2年」のように数字で書く。 */
  yearLabel: string;
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
      return {
        era: era.name,
        year: eraYear,
        yearLabel: eraYear === 1 ? "元年" : `${eraYear}年`,
      };
    }
  }
  return null;
}

// --- Zodiac (干支) ---

export interface Zodiac {
  /** 干支の漢字1字（「午」）。 */
  kanji: string;
  /** その読み（「うま」）。 */
  reading: string;
}

// 十二支の漢字と読み仮名のペア。FAQの順序（子〜亥）と一致させる。
const ZODIAC_ENTRIES: readonly Zodiac[] = [
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

/** 生まれ年の西暦から干支を返す。2020年が子。 */
export function getZodiac(year: number): Zodiac {
  const index = (((year - 2020) % 12) + 12) % 12;
  return ZODIAC_ENTRIES[index];
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
