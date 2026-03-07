const MS_PER_DAY = 86_400_000;

export function toUtcDaySerial(date: Date): number {
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY
  );
}

export function diffUtcCalendarDays(date1: Date, date2: Date): number {
  return Math.abs(toUtcDaySerial(date2) - toUtcDaySerial(date1));
}
