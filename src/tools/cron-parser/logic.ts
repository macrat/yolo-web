export interface CronField {
  raw: string;
  values: number[];
  description: string;
}

export interface ParsedCron {
  valid: boolean;
  error?: string;
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
  description: string;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
const MONTH_NAMES = [
  "",
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

interface FieldRange {
  min: number;
  max: number;
}

const FIELD_RANGES: Record<string, FieldRange> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 7 },
};

function parseFieldValues(field: string, range: FieldRange): number[] | null {
  const values = new Set<number>();

  const parts = field.split(",");
  for (const part of parts) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    if (stepMatch) {
      const base = stepMatch[1];
      const step = parseInt(stepMatch[2], 10);
      if (step <= 0) return null;

      let start = range.min;
      let end = range.max;

      if (base === "*") {
        // default start and end
      } else {
        const rangeMatch = base.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          start = parseInt(rangeMatch[1], 10);
          end = parseInt(rangeMatch[2], 10);
        } else {
          return null;
        }
      }

      if (start < range.min || end > range.max || start > end) return null;

      for (let i = start; i <= end; i += step) {
        values.add(i === 7 && range.max === 7 ? 0 : i);
      }
    } else if (part === "*") {
      for (let i = range.min; i <= range.max; i++) {
        if (i === 7 && range.max === 7) {
          values.add(0);
        } else {
          values.add(i);
        }
      }
    } else {
      const rangeMatch = part.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (start < range.min || end > range.max || start > end) return null;
        for (let i = start; i <= end; i++) {
          values.add(i === 7 && range.max === 7 ? 0 : i);
        }
      } else {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < range.min || num > range.max) return null;
        values.add(num === 7 && range.max === 7 ? 0 : num);
      }
    }
  }

  const result = Array.from(values).sort((a, b) => a - b);
  return result.length > 0 ? result : null;
}

function emptyField(raw: string): CronField {
  return { raw, values: [], description: "" };
}

export function describeCronField(
  field: string,
  type: "minute" | "hour" | "dayOfMonth" | "month" | "dayOfWeek",
): string {
  const range = FIELD_RANGES[type];

  if (field === "*") {
    switch (type) {
      case "minute":
        return "毎分";
      case "hour":
        return "毎時";
      case "dayOfMonth":
        return "毎日";
      case "month":
        return "毎月";
      case "dayOfWeek":
        return "毎曜日";
    }
  }

  const stepMatch = field.match(/^\*\/(\d+)$/);
  if (stepMatch) {
    const step = stepMatch[1];
    switch (type) {
      case "minute":
        return `${step}分ごと`;
      case "hour":
        return `${step}時間ごと`;
      case "dayOfMonth":
        return `${step}日ごと`;
      case "month":
        return `${step}ヶ月ごと`;
      case "dayOfWeek":
        return `${step}曜日ごと`;
    }
  }

  const rangeStepMatch = field.match(/^(\d+)-(\d+)\/(\d+)$/);
  if (rangeStepMatch) {
    const start = parseInt(rangeStepMatch[1], 10);
    const end = parseInt(rangeStepMatch[2], 10);
    const step = rangeStepMatch[3];
    switch (type) {
      case "minute":
        return `${start}分から${end}分まで${step}分ごと`;
      case "hour":
        return `${start}時から${end}時まで${step}時間ごと`;
      case "dayOfMonth":
        return `${start}日から${end}日まで${step}日ごと`;
      case "month":
        return `${MONTH_NAMES[start]}から${MONTH_NAMES[end]}まで${step}ヶ月ごと`;
      case "dayOfWeek":
        return `${DAY_NAMES[start % 7]}曜から${DAY_NAMES[end % 7]}曜まで${step}曜日ごと`;
    }
  }

  const rangeMatch = field.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    switch (type) {
      case "minute":
        return `${start}分から${end}分`;
      case "hour":
        return `${start}時から${end}時`;
      case "dayOfMonth":
        return `${start}日から${end}日`;
      case "month":
        return `${MONTH_NAMES[start]}から${MONTH_NAMES[end]}`;
      case "dayOfWeek":
        return `${DAY_NAMES[start % 7]}曜から${DAY_NAMES[end % 7]}曜`;
    }
  }

  if (field.includes(",")) {
    const values = parseFieldValues(field, range);
    if (!values) return field;
    switch (type) {
      case "minute":
        return values.map((v) => `${v}分`).join("と");
      case "hour":
        return values.map((v) => `${v}時`).join("と");
      case "dayOfMonth":
        return values.map((v) => `${v}日`).join("と");
      case "month":
        return values.map((v) => MONTH_NAMES[v]).join("と");
      case "dayOfWeek":
        return values.map((v) => `${DAY_NAMES[v % 7]}曜`).join("と");
    }
  }

  const num = parseInt(field, 10);
  if (!isNaN(num)) {
    switch (type) {
      case "minute":
        return `${num}分`;
      case "hour":
        return `${num}時`;
      case "dayOfMonth":
        return `${num}日`;
      case "month":
        return MONTH_NAMES[num] || `${num}月`;
      case "dayOfWeek":
        return `${DAY_NAMES[num % 7]}曜`;
    }
  }

  return field;
}

function buildFullDescription(
  minute: CronField,
  hour: CronField,
  dayOfMonth: CronField,
  month: CronField,
  dayOfWeek: CronField,
): string {
  const parts: string[] = [];

  // Month
  if (month.raw !== "*") {
    parts.push(month.description);
  }

  // Day of month
  if (dayOfMonth.raw !== "*") {
    parts.push(dayOfMonth.description);
  }

  // Day of week
  if (dayOfWeek.raw !== "*") {
    parts.push(dayOfWeek.description);
  }

  // Time description
  if (minute.raw === "*" && hour.raw === "*") {
    parts.push("毎分");
  } else if (minute.raw === "*") {
    parts.push(`${hour.description}の毎分`);
  } else if (hour.raw === "*") {
    if (minute.raw.includes("/")) {
      parts.push(minute.description);
    } else {
      parts.push(`毎時${minute.description}`);
    }
  } else {
    // Specific hour and minute
    const minuteVal = parseInt(minute.raw, 10);
    const hourVal = parseInt(hour.raw, 10);
    if (!isNaN(minuteVal) && !isNaN(hourVal)) {
      const period = hourVal < 12 ? "午前" : "午後";
      const displayHour = hourVal === 0 ? 0 : hourVal;
      parts.push(`${period}${displayHour}時${minuteVal}分`);
    } else {
      parts.push(`${hour.description}の${minute.description}`);
    }
  }

  parts.push("に実行");

  if (
    month.raw === "*" &&
    dayOfMonth.raw === "*" &&
    dayOfWeek.raw === "*" &&
    hour.raw !== "*" &&
    minute.raw !== "*"
  ) {
    return "毎日 " + parts.join(" ");
  }

  return parts.join(" ");
}

export function parseCron(expression: string): ParsedCron {
  const trimmed = expression.trim();
  const fields = trimmed.split(/\s+/);

  const invalid = (error: string): ParsedCron => ({
    valid: false,
    error,
    minute: emptyField(""),
    hour: emptyField(""),
    dayOfMonth: emptyField(""),
    month: emptyField(""),
    dayOfWeek: emptyField(""),
    description: "",
  });

  if (fields.length !== 5) {
    return invalid(
      `Cron式は5つのフィールドが必要です（${fields.length}つ検出）`,
    );
  }

  const [minuteRaw, hourRaw, dayOfMonthRaw, monthRaw, dayOfWeekRaw] = fields;

  const minuteValues = parseFieldValues(minuteRaw, FIELD_RANGES.minute);
  if (!minuteValues) {
    return invalid(`分フィールドが無効です: ${minuteRaw}`);
  }

  const hourValues = parseFieldValues(hourRaw, FIELD_RANGES.hour);
  if (!hourValues) {
    return invalid(`時フィールドが無効です: ${hourRaw}`);
  }

  const dayOfMonthValues = parseFieldValues(
    dayOfMonthRaw,
    FIELD_RANGES.dayOfMonth,
  );
  if (!dayOfMonthValues) {
    return invalid(`日フィールドが無効です: ${dayOfMonthRaw}`);
  }

  const monthValues = parseFieldValues(monthRaw, FIELD_RANGES.month);
  if (!monthValues) {
    return invalid(`月フィールドが無効です: ${monthRaw}`);
  }

  const dayOfWeekValues = parseFieldValues(
    dayOfWeekRaw,
    FIELD_RANGES.dayOfWeek,
  );
  if (!dayOfWeekValues) {
    return invalid(`曜日フィールドが無効です: ${dayOfWeekRaw}`);
  }

  const minute: CronField = {
    raw: minuteRaw,
    values: minuteValues,
    description: describeCronField(minuteRaw, "minute"),
  };

  const hour: CronField = {
    raw: hourRaw,
    values: hourValues,
    description: describeCronField(hourRaw, "hour"),
  };

  const dayOfMonth: CronField = {
    raw: dayOfMonthRaw,
    values: dayOfMonthValues,
    description: describeCronField(dayOfMonthRaw, "dayOfMonth"),
  };

  const month: CronField = {
    raw: monthRaw,
    values: monthValues,
    description: describeCronField(monthRaw, "month"),
  };

  const dayOfWeek: CronField = {
    raw: dayOfWeekRaw,
    values: dayOfWeekValues,
    description: describeCronField(dayOfWeekRaw, "dayOfWeek"),
  };

  const description = buildFullDescription(
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
  );

  return {
    valid: true,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
    description,
  };
}

export function getNextExecutions(
  expression: string,
  count: number,
  from?: Date,
): Date[] {
  const parsed = parseCron(expression);
  if (!parsed.valid) return [];

  const results: Date[] = [];
  const start = from ? new Date(from) : new Date();
  // Move to next minute boundary
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1);

  const current = new Date(start);
  const MAX_ITERATIONS = 366 * 24 * 60; // ~1 year of minutes
  let iterations = 0;

  while (results.length < count && iterations < MAX_ITERATIONS) {
    iterations++;

    const m = current.getMinutes();
    const h = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay(); // 0=Sunday

    if (
      parsed.minute.values.includes(m) &&
      parsed.hour.values.includes(h) &&
      parsed.dayOfMonth.values.includes(dom) &&
      parsed.month.values.includes(mon) &&
      parsed.dayOfWeek.values.includes(dow)
    ) {
      results.push(new Date(current));
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

export function buildCronExpression(
  minute: string,
  hour: string,
  dayOfMonth: string,
  month: string,
  dayOfWeek: string,
): string {
  return [minute, hour, dayOfMonth, month, dayOfWeek].join(" ");
}
