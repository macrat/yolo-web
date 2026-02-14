import { describe, it, expect } from "vitest";
import {
  parseCron,
  getNextExecutions,
  buildCronExpression,
  describeCronField,
} from "../logic";

describe("parseCron", () => {
  it("parses '* * * * *' as every minute", () => {
    const result = parseCron("* * * * *");
    expect(result.valid).toBe(true);
    expect(result.minute.values).toHaveLength(60);
    expect(result.hour.values).toHaveLength(24);
    expect(result.dayOfMonth.values).toHaveLength(31);
    expect(result.month.values).toHaveLength(12);
    expect(result.dayOfWeek.values).toHaveLength(7);
    expect(result.description).toContain("毎分");
  });

  it("parses '0 9 * * *' as daily at 9:00", () => {
    const result = parseCron("0 9 * * *");
    expect(result.valid).toBe(true);
    expect(result.minute.values).toEqual([0]);
    expect(result.hour.values).toEqual([9]);
    expect(result.description).toContain("9時");
    expect(result.description).toContain("0分");
  });

  it("parses '0 9 * * 1-5' as weekdays at 9:00", () => {
    const result = parseCron("0 9 * * 1-5");
    expect(result.valid).toBe(true);
    expect(result.dayOfWeek.values).toEqual([1, 2, 3, 4, 5]);
    expect(result.dayOfWeek.description).toContain("月");
    expect(result.dayOfWeek.description).toContain("金");
  });

  it("parses '*/5 * * * *' as every 5 minutes", () => {
    const result = parseCron("*/5 * * * *");
    expect(result.valid).toBe(true);
    expect(result.minute.values).toEqual([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
    ]);
    expect(result.minute.description).toBe("5分ごと");
  });

  it("parses '0 0 1 1 *' as January 1st midnight", () => {
    const result = parseCron("0 0 1 1 *");
    expect(result.valid).toBe(true);
    expect(result.minute.values).toEqual([0]);
    expect(result.hour.values).toEqual([0]);
    expect(result.dayOfMonth.values).toEqual([1]);
    expect(result.month.values).toEqual([1]);
  });

  it("parses lists like '1,3,5' for minute", () => {
    const result = parseCron("1,3,5 * * * *");
    expect(result.valid).toBe(true);
    expect(result.minute.values).toEqual([1, 3, 5]);
  });

  it("parses ranges like '9-17' for hour", () => {
    const result = parseCron("0 9-17 * * *");
    expect(result.valid).toBe(true);
    expect(result.hour.values).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });

  it("parses range with step like '1-30/5' for minute", () => {
    const result = parseCron("1-30/5 * * * *");
    expect(result.valid).toBe(true);
    expect(result.minute.values).toEqual([1, 6, 11, 16, 21, 26]);
  });

  it("treats day of week 7 as 0 (Sunday)", () => {
    const result = parseCron("0 0 * * 7");
    expect(result.valid).toBe(true);
    expect(result.dayOfWeek.values).toEqual([0]);
  });

  it("returns invalid for wrong number of fields", () => {
    const result = parseCron("* * *");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5つ");
  });

  it("returns invalid for out-of-range minute", () => {
    const result = parseCron("60 * * * *");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("分");
  });

  it("returns invalid for out-of-range hour", () => {
    const result = parseCron("0 25 * * *");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("時");
  });

  it("returns invalid for out-of-range day of month", () => {
    const result = parseCron("0 0 32 * *");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("日");
  });

  it("returns invalid for out-of-range month", () => {
    const result = parseCron("0 0 1 13 *");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("月");
  });

  it("returns invalid for out-of-range day of week", () => {
    const result = parseCron("0 0 * * 8");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("曜日");
  });

  it("returns invalid for empty string", () => {
    const result = parseCron("");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for non-numeric values", () => {
    const result = parseCron("abc * * * *");
    expect(result.valid).toBe(false);
  });

  it("handles extra whitespace", () => {
    const result = parseCron("  0  9  *  *  *  ");
    expect(result.valid).toBe(true);
    expect(result.minute.values).toEqual([0]);
    expect(result.hour.values).toEqual([9]);
  });
});

describe("getNextExecutions", () => {
  it("returns correct number of executions", () => {
    const from = new Date(2026, 0, 1, 0, 0, 0);
    const results = getNextExecutions("0 9 * * *", 3, from);
    expect(results).toHaveLength(3);
  });

  it("returns executions at the right time for daily at 9:00", () => {
    const from = new Date(2026, 0, 1, 0, 0, 0);
    const results = getNextExecutions("0 9 * * *", 3, from);
    for (const date of results) {
      expect(date.getHours()).toBe(9);
      expect(date.getMinutes()).toBe(0);
    }
  });

  it("returns executions every 5 minutes", () => {
    const from = new Date(2026, 0, 1, 0, 0, 0);
    const results = getNextExecutions("*/5 * * * *", 5, from);
    expect(results).toHaveLength(5);
    for (const date of results) {
      expect(date.getMinutes() % 5).toBe(0);
    }
  });

  it("returns empty array for invalid expression", () => {
    const results = getNextExecutions("invalid", 5);
    expect(results).toEqual([]);
  });

  it("returns only weekday executions for '0 9 * * 1-5'", () => {
    const from = new Date(2026, 0, 1, 0, 0, 0);
    const results = getNextExecutions("0 9 * * 1-5", 5, from);
    for (const date of results) {
      const dow = date.getDay();
      expect(dow).toBeGreaterThanOrEqual(1);
      expect(dow).toBeLessThanOrEqual(5);
    }
  });

  it("returns dates in ascending order", () => {
    const from = new Date(2026, 0, 1, 0, 0, 0);
    const results = getNextExecutions("0 * * * *", 5, from);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].getTime()).toBeGreaterThan(results[i - 1].getTime());
    }
  });
});

describe("buildCronExpression", () => {
  it("joins fields with spaces", () => {
    expect(buildCronExpression("0", "9", "*", "*", "*")).toBe("0 9 * * *");
  });

  it("joins all wildcards", () => {
    expect(buildCronExpression("*", "*", "*", "*", "*")).toBe("* * * * *");
  });

  it("joins complex fields", () => {
    expect(buildCronExpression("*/5", "9-17", "1,15", "1-6", "1-5")).toBe(
      "*/5 9-17 1,15 1-6 1-5",
    );
  });
});

describe("describeCronField", () => {
  describe("minute", () => {
    it("describes '*' as 毎分", () => {
      expect(describeCronField("*", "minute")).toBe("毎分");
    });

    it("describes '*/5' as 5分ごと", () => {
      expect(describeCronField("*/5", "minute")).toBe("5分ごと");
    });

    it("describes '0' as 0分", () => {
      expect(describeCronField("0", "minute")).toBe("0分");
    });

    it("describes '30' as 30分", () => {
      expect(describeCronField("30", "minute")).toBe("30分");
    });

    it("describes '1-30' as 1分から30分", () => {
      expect(describeCronField("1-30", "minute")).toBe("1分から30分");
    });

    it("describes '0,15,30,45' as list", () => {
      const desc = describeCronField("0,15,30,45", "minute");
      expect(desc).toContain("0分");
      expect(desc).toContain("15分");
      expect(desc).toContain("30分");
      expect(desc).toContain("45分");
    });
  });

  describe("hour", () => {
    it("describes '*' as 毎時", () => {
      expect(describeCronField("*", "hour")).toBe("毎時");
    });

    it("describes '9' as 9時", () => {
      expect(describeCronField("9", "hour")).toBe("9時");
    });

    it("describes '9-17' as 9時から17時", () => {
      expect(describeCronField("9-17", "hour")).toBe("9時から17時");
    });

    it("describes '*/2' as 2時間ごと", () => {
      expect(describeCronField("*/2", "hour")).toBe("2時間ごと");
    });
  });

  describe("dayOfMonth", () => {
    it("describes '*' as 毎日", () => {
      expect(describeCronField("*", "dayOfMonth")).toBe("毎日");
    });

    it("describes '1' as 1日", () => {
      expect(describeCronField("1", "dayOfMonth")).toBe("1日");
    });

    it("describes '1,15' as 1日と15日", () => {
      const desc = describeCronField("1,15", "dayOfMonth");
      expect(desc).toContain("1日");
      expect(desc).toContain("15日");
    });
  });

  describe("month", () => {
    it("describes '*' as 毎月", () => {
      expect(describeCronField("*", "month")).toBe("毎月");
    });

    it("describes '1' as 1月", () => {
      expect(describeCronField("1", "month")).toBe("1月");
    });

    it("describes '6' as 6月", () => {
      expect(describeCronField("6", "month")).toBe("6月");
    });
  });

  describe("dayOfWeek", () => {
    it("describes '*' as 毎曜日", () => {
      expect(describeCronField("*", "dayOfWeek")).toBe("毎曜日");
    });

    it("describes '0' as 日曜", () => {
      expect(describeCronField("0", "dayOfWeek")).toBe("日曜");
    });

    it("describes '1' as 月曜", () => {
      expect(describeCronField("1", "dayOfWeek")).toBe("月曜");
    });

    it("describes '1-5' as 月曜から金曜", () => {
      expect(describeCronField("1-5", "dayOfWeek")).toBe("月曜から金曜");
    });

    it("describes '0,6' as 日曜と土曜", () => {
      const desc = describeCronField("0,6", "dayOfWeek");
      expect(desc).toContain("日曜");
      expect(desc).toContain("土曜");
    });
  });
});
