/**
 * Zen Antique で組める字の表（src/data/zen-antique-charset.json）を作る。
 *
 * next/font/google は、Google Fonts の CSS API が返す分割ファイルをビルドの時に取得して配る。
 * ブラウザがある字を Zen Antique で組むのは、その字がどれかの分割ファイルの unicode-range に入り、
 * かつ書体の cmap にあるときだけである。unicode-range は配信の単位で、書体に無い字も含む。
 * そこで、次の2つの積を表にする。
 * - next/font と同じ User-Agent で受け取る CSS の unicode-range の和
 * - User-Agent を送らないときに返る、分割されていない TrueType の cmap
 *
 * 書体の版が上がったら `npm run generate:zen-antique-charset` で表を作り直す。
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { parse } from "opentype.js";

const CSS_URL = "https://fonts.googleapis.com/css2?family=Zen+Antique";
// next/font/google が CSS を取得するときの User-Agent。これで woff2 の分割ファイルが返る。
const NEXT_FONT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/104.0.0.0 Safari/537.36";
const OUTPUT = path.join(
  process.cwd(),
  "src",
  "data",
  "zen-antique-charset.json",
);

async function fetchText(url: string, userAgent: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.text();
}

async function fetchServedCodePoints(): Promise<Set<number>> {
  const css = await fetchText(CSS_URL, NEXT_FONT_USER_AGENT);
  const served = new Set<number>();
  for (const [, list] of css.matchAll(/unicode-range:([^;]+);/g)) {
    for (const range of list.split(",")) {
      const [start, end = start] = range.trim().slice(2).split("-");
      for (let cp = parseInt(start, 16); cp <= parseInt(end, 16); cp++) {
        served.add(cp);
      }
    }
  }
  if (served.size === 0) throw new Error("no unicode-range in the CSS");
  return served;
}

async function fetchCmapCodePoints(): Promise<{
  source: string;
  codePoints: number[];
}> {
  const css = await fetchText(CSS_URL, "");
  const urls = [...css.matchAll(/url\((https:[^)]+\.ttf)\)/g)].map((m) => m[1]);
  if (urls.length !== 1) {
    throw new Error(
      `expected one TrueType file in the CSS, got ${urls.length}`,
    );
  }
  const res = await fetch(urls[0]);
  if (!res.ok) throw new Error(`${urls[0]}: ${res.status}`);
  const font = parse(await res.arrayBuffer());
  const glyphIndexMap = font.tables.cmap.glyphIndexMap as Record<
    string,
    number
  >;
  const codePoints = Object.entries(glyphIndexMap)
    .filter(([, glyphIndex]) => glyphIndex !== 0)
    .map(([cp]) => Number(cp));
  return { source: urls[0], codePoints };
}

function toRanges(sortedCodePoints: number[]): [number, number][] {
  const ranges: [number, number][] = [];
  for (const cp of sortedCodePoints) {
    const last = ranges[ranges.length - 1];
    if (last && last[1] + 1 === cp) last[1] = cp;
    else ranges.push([cp, cp]);
  }
  return ranges;
}

async function main(): Promise<void> {
  const [served, cmap] = await Promise.all([
    fetchServedCodePoints(),
    fetchCmapCodePoints(),
  ]);
  const codePoints = cmap.codePoints
    .filter((cp) => served.has(cp))
    .sort((a, b) => a - b);

  const table = { source: cmap.source, ranges: toRanges(codePoints) };
  // prettier の整形と同じ形（範囲を1行に1つ）で書き、作り直しの差分を字の増減だけにする。
  const json = [
    "{",
    `  "source": ${JSON.stringify(table.source)},`,
    `  "ranges": [`,
    table.ranges.map(([a, b]) => `    [${a}, ${b}]`).join(",\n"),
    "  ]",
    "}",
    "",
  ].join("\n");
  writeFileSync(OUTPUT, json);
  console.log(
    `${codePoints.length} code points in ${table.ranges.length} ranges → ${OUTPUT}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
