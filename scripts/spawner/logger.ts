import fs from "node:fs";
import path from "node:path";

/** Format a Date as "YYYY-MM-DD HH:mm:ss+ZZ:ZZ" */
function formatDatetime(date: Date): string {
  const pad = (n: number, len = 2): string => String(n).padStart(len, "0");
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());

  const tzOffset = -date.getTimezoneOffset();
  const sign = tzOffset >= 0 ? "+" : "-";
  const tzH = pad(Math.floor(Math.abs(tzOffset) / 60));
  const tzM = pad(Math.abs(tzOffset) % 60);

  return `${y}-${mo}-${d} ${h}:${mi}:${s}${sign}${tzH}:${tzM}`;
}

/** Format a Date as "YYYYMMDD-HHmmss" for log filenames */
export function formatFileDatetime(date: Date): string {
  const pad = (n: number, len = 2): string => String(n).padStart(len, "0");
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}${mo}${d}-${h}${mi}${s}`;
}

export interface Logger {
  /** Log a general message: "${datetime} ${message}" */
  log(message: string): void;

  /** Log an agent-scoped message: "${datetime} [${agent}] ${message}" */
  agent(agent: string, message: string): void;

  /** Log a memo detection: "${datetime} [${from}] -> [${to}] ${subject}" */
  memo(from: string, to: string, subject: string): void;

  /** Close the log file stream (if any) */
  close(): void;
}

export function createLogger(logsDir: string, startTime: Date): Logger {
  const datetimeStr = formatFileDatetime(startTime);
  const logFilePath = path.join(logsDir, `${datetimeStr}_spawner.log`);

  let fd: number | null = null;
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    fd = fs.openSync(logFilePath, "a");
  } catch {
    process.stderr.write(`[spawner] Failed to open log file: ${logFilePath}\n`);
  }

  function write(line: string): void {
    const fullLine = line + "\n";
    process.stdout.write(fullLine);
    if (fd !== null) {
      try {
        fs.writeSync(fd, fullLine);
      } catch {
        process.stderr.write(fullLine);
      }
    }
  }

  function now(): string {
    return formatDatetime(new Date());
  }

  return {
    log(message: string): void {
      write(`${now()} ${message}`);
    },

    agent(agent: string, message: string): void {
      write(`${now()} [${agent}] ${message}`);
    },

    memo(from: string, to: string, subject: string): void {
      write(`${now()} [${from}] -> [${to}] ${subject}`);
    },

    close(): void {
      if (fd !== null) {
        try {
          fs.closeSync(fd);
        } catch {
          // ignore close errors
        }
        fd = null;
      }
    },
  };
}
