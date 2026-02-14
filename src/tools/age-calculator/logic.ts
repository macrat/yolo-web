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

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round(
    Math.abs(target.getTime() - birth.getTime()) / msPerDay,
  );

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

const ZODIAC_ANIMALS = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

export function getZodiac(year: number): string {
  // 2020 = 子 (Rat). 2020 % 12 = 4, so offset is 4 for 子 (index 0)
  const index = (((year - 2020) % 12) + 12) % 12;
  return ZODIAC_ANIMALS[index];
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

// --- Date formatting helpers ---

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr + "T00:00:00");
  return isNaN(date.getTime()) ? null : date;
}
