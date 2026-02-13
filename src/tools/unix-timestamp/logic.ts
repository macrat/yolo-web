export interface TimestampConversion {
  seconds: number;
  milliseconds: number;
  isoString: string;
  localString: string;
  utcString: string;
  date: {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function getCurrentTimestampMs(): number {
  return Date.now();
}

export function timestampToDate(
  timestamp: number,
  isMilliseconds: boolean = false,
): TimestampConversion | null {
  const ms = isMilliseconds ? timestamp : timestamp * 1000;
  const date = new Date(ms);

  if (isNaN(date.getTime())) {
    return null;
  }

  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
    isoString: date.toISOString(),
    localString: date.toLocaleString("ja-JP", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    utcString: date.toUTCString(),
    date: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
    },
  };
}

export function dateToTimestamp(
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0,
): { seconds: number; milliseconds: number } | null {
  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  if (isNaN(date.getTime())) {
    return null;
  }
  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
  };
}
