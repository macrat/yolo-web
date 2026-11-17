import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { oklchToHex, parseOklch } from "../oklchToHex";
import {
  PAPER,
  INK,
  INK_2,
  RULE,
  RULE_2,
  PAPER_DARK,
  INK_DARK,
} from "../token-hex";

describe("token-hex — globals.css のトークンとの一致", () => {
  // globals.css の oklch を hex に変換し直して突き合わせる。
  // ダークの値は prefers-color-scheme: dark のブロックにあり、それより前がライト。
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  const [lightCss, darkCss] = css.split("@media (prefers-color-scheme: dark)");

  function tokenHexIn(block: string, name: string): string {
    const m = block.match(new RegExp(`--${name}:\\s*(oklch\\([^)]*\\))`));
    if (!m) throw new Error(`token --${name} not found in globals.css`);
    const parsed = parseOklch(m[1]);
    if (!parsed) throw new Error(`token --${name} is not oklch`);
    return oklchToHex(parsed.l, parsed.c, parsed.h);
  }

  const LIGHT: ReadonlyArray<[hex: string, token: string]> = [
    [PAPER, "paper"],
    [INK, "ink"],
    [INK_2, "ink-2"],
    // --rule は var(--ink) なので、墨の oklch と突き合わせる。
    [RULE, "ink"],
    [RULE_2, "rule-2"],
  ];

  test.each(LIGHT)(
    "%s が globals.css のライトのトークン --%s から作れる",
    (hex, token) => {
      expect(tokenHexIn(lightCss, token)).toBe(hex);
    },
  );

  const DARK: ReadonlyArray<[hex: string, token: string]> = [
    [PAPER_DARK, "paper"],
    [INK_DARK, "ink"],
  ];

  test.each(DARK)(
    "%s が globals.css のダークのトークン --%s から作れる",
    (hex, token) => {
      expect(tokenHexIn(darkCss, token)).toBe(hex);
    },
  );
});
