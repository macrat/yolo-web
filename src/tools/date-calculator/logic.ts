// --- Date Difference ---

export interface DateDiffResult {
  days: number;
  weeks: number;
  months: number;
  years: number;
  totalDays: number;
}

export function dateDiff(date1: Date, date2: Date): DateDiffResult {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round(
    Math.abs(d2.getTime() - d1.getTime()) / msPerDay,
  );

  const weeks = Math.floor(totalDays / 7);

  // Calculate year/month difference
  const [earlier, later] = d1 <= d2 ? [d1, d2] : [d2, d1];
  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();

  if (days < 0) {
    months--;
    // Days in previous month
    const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    days,
    weeks,
    months: years * 12 + months,
    years,
    totalDays,
  };
}

// --- Date Addition/Subtraction ---

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

// --- Wareki (Japanese Era) Conversion ---

interface EraDefinition {
  name: string;
  nameKanji: string;
  startDate: Date;
}

const ERAS: EraDefinition[] = [
  { name: "Reiwa", nameKanji: "令和", startDate: new Date(2019, 4, 1) },
  { name: "Heisei", nameKanji: "平成", startDate: new Date(1989, 0, 8) },
  { name: "Showa", nameKanji: "昭和", startDate: new Date(1926, 11, 25) },
  { name: "Taisho", nameKanji: "大正", startDate: new Date(1912, 6, 30) },
  { name: "Meiji", nameKanji: "明治", startDate: new Date(1868, 0, 25) },
];

export interface WarekiResult {
  success: boolean;
  era?: string;
  eraKanji?: string;
  year?: number;
  formatted?: string;
  error?: string;
}

export function toWareki(date: Date): WarekiResult {
  for (const era of ERAS) {
    if (date >= era.startDate) {
      const eraYear = date.getFullYear() - era.startDate.getFullYear() + 1;
      const yearStr = eraYear === 1 ? "元" : String(eraYear);
      const m = date.getMonth() + 1;
      const d = date.getDate();
      return {
        success: true,
        era: era.name,
        eraKanji: era.nameKanji,
        year: eraYear,
        formatted: `${era.nameKanji}${yearStr}年${m}月${d}日`,
      };
    }
  }
  return {
    success: false,
    error: "明治以前の日付には対応していません",
  };
}

export function fromWareki(
  eraKanji: string,
  eraYear: number,
  month: number,
  day: number,
): { success: boolean; date?: Date; error?: string } {
  const era = ERAS.find((e) => e.nameKanji === eraKanji);
  if (!era) {
    return { success: false, error: `不明な元号: ${eraKanji}` };
  }

  const westernYear = era.startDate.getFullYear() + eraYear - 1;
  const date = new Date(westernYear, month - 1, day);

  if (isNaN(date.getTime())) {
    return { success: false, error: "無効な日付です" };
  }

  // Verify the date is within the era
  if (date < era.startDate) {
    return {
      success: false,
      error: `${eraKanji}${eraYear}年は元号の開始日より前です`,
    };
  }

  return { success: true, date };
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

// --- Day of week ---
const DAY_NAMES_JA = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
];

export function getDayOfWeek(date: Date): string {
  return DAY_NAMES_JA[date.getDay()];
}
