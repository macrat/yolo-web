import { readFileSync } from "node:fs";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";
import opentype from "opentype.js";
import { describe, expect, test } from "vitest";

/**
 * 画像の生成が読む WOFF（`IBMPlexSans-{Regular,Bold}.woff`）が、画面が読む woff2
 * （`IBMPlexSans-{Regular,Bold}-Latin1.woff2`）と同じ `@ibm/plex-sans` の版で、
 * 欧文の基本範囲の字を同じ幅で組むことを確かめる。
 */

const DIR = join(process.cwd(), "src/fonts/ibm-plex-sans");
const VERSION = "Version 3.005";

/** U+0020〜007E。 */
const BASIC_LATIN = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) =>
  String.fromCharCode(0x20 + i),
);

/** WOFF2 のテーブルの表で、1バイトの番号が指すタグ（WOFF2 の仕様の Known Table Tags）。 */
const WOFF2_KNOWN_TAGS = [
  "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ",
  "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp",
  "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF",
  "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL",
  "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc",
  "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx",
  "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill",
]; // prettier-ignore

/**
 * WOFF2 を解いて、テーブルのタグから中身を引ける表にする。
 * `glyf`・`loca` は変形されたまま返す（ここでは字の形を読まない）。
 */
function readWoff2Tables(buf: Buffer): Map<string, Buffer> {
  expect(buf.toString("latin1", 0, 4)).toBe("wOF2");
  const numTables = buf.readUInt16BE(12);
  let pos = 48;

  const readBase128 = (): number => {
    let value = 0;
    for (let i = 0; i < 5; i++) {
      const byte = buf[pos++];
      value = value * 128 + (byte & 0x7f);
      if ((byte & 0x80) === 0) return value;
    }
    throw new Error("UIntBase128 が5バイトを超えた");
  };

  const entries: Array<{ tag: string; length: number }> = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[pos++];
    let tag: string;
    if ((flags & 0x3f) === 0x3f) {
      tag = buf.toString("latin1", pos, pos + 4);
      pos += 4;
    } else {
      tag = WOFF2_KNOWN_TAGS[flags & 0x3f];
    }
    const transformVersion = flags >> 6;
    const origLength = readBase128();
    const transformed =
      tag === "glyf" || tag === "loca"
        ? transformVersion === 0
        : transformVersion !== 0;
    const length = transformed ? readBase128() : origLength;
    entries.push({ tag, length });
  }

  const totalCompressedSize = buf.readUInt32BE(20);
  const data = brotliDecompressSync(
    buf.subarray(pos, pos + totalCompressedSize),
  );
  const tables = new Map<string, Buffer>();
  let offset = 0;
  for (const { tag, length } of entries) {
    tables.set(tag, data.subarray(offset, offset + length));
    offset += length;
  }
  return tables;
}

/** `name` の Windows・Unicode BMP の記録から、nameID の字を取る。 */
function nameString(name: Buffer, nameId: number): string | undefined {
  const count = name.readUInt16BE(2);
  const stringOffset = name.readUInt16BE(4);
  for (let i = 0; i < count; i++) {
    const rec = 6 + i * 12;
    if (
      name.readUInt16BE(rec) === 3 &&
      name.readUInt16BE(rec + 2) === 1 &&
      name.readUInt16BE(rec + 6) === nameId
    ) {
      const length = name.readUInt16BE(rec + 8);
      const start = stringOffset + name.readUInt16BE(rec + 10);
      return Buffer.from(name.subarray(start, start + length))
        .swap16()
        .toString("utf16le");
    }
  }
  return undefined;
}

/** `cmap` の Windows・Unicode BMP（format 4）の表で、字の番号を字形の番号にする。 */
function glyphIdOf(cmap: Buffer, codePoint: number): number {
  const numTables = cmap.readUInt16BE(2);
  for (let i = 0; i < numTables; i++) {
    const rec = 4 + i * 8;
    if (cmap.readUInt16BE(rec) !== 3 || cmap.readUInt16BE(rec + 2) !== 1) {
      continue;
    }
    const sub = cmap.readUInt32BE(rec + 4);
    expect(cmap.readUInt16BE(sub)).toBe(4);
    const segCount = cmap.readUInt16BE(sub + 6) / 2;
    const endCodes = sub + 14;
    const startCodes = endCodes + segCount * 2 + 2;
    const idDeltas = startCodes + segCount * 2;
    const idRangeOffsets = idDeltas + segCount * 2;
    for (let s = 0; s < segCount; s++) {
      if (codePoint > cmap.readUInt16BE(endCodes + s * 2)) continue;
      const start = cmap.readUInt16BE(startCodes + s * 2);
      if (codePoint < start) return 0;
      const idDelta = cmap.readInt16BE(idDeltas + s * 2);
      const rangeOffsetAt = idRangeOffsets + s * 2;
      const idRangeOffset = cmap.readUInt16BE(rangeOffsetAt);
      if (idRangeOffset === 0) return (codePoint + idDelta) & 0xffff;
      const glyphId = cmap.readUInt16BE(
        rangeOffsetAt + idRangeOffset + (codePoint - start) * 2,
      );
      return glyphId === 0 ? 0 : (glyphId + idDelta) & 0xffff;
    }
    return 0;
  }
  throw new Error("cmap に Windows・Unicode BMP の表が無い");
}

/** 画面の woff2 の、字ごとの送り幅と `name` の版。 */
function readScreenFont(file: string) {
  const tables = readWoff2Tables(readFileSync(join(DIR, file)));
  const cmap = tables.get("cmap")!;
  const hmtx = tables.get("hmtx")!;
  const numberOfHMetrics = tables.get("hhea")!.readUInt16BE(34);
  const advanceWidth = (char: string): number => {
    const glyphId = glyphIdOf(cmap, char.codePointAt(0)!);
    expect(glyphId).not.toBe(0);
    return hmtx.readUInt16BE(Math.min(glyphId, numberOfHMetrics - 1) * 4);
  };
  return {
    version: nameString(tables.get("name")!, 5),
    unitsPerEm: tables.get("head")!.readUInt16BE(18),
    advanceWidth,
  };
}

/** 画像の WOFF を、画像の生成と同じく opentype.js で読む。 */
function readImageFont(file: string): opentype.Font {
  const buf = readFileSync(join(DIR, file));
  return opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
}

describe.each([
  ["IBMPlexSans-Regular.woff", "IBMPlexSans-Regular-Latin1.woff2"],
  ["IBMPlexSans-Bold.woff", "IBMPlexSans-Bold-Latin1.woff2"],
])("%s", (imageFile, screenFile) => {
  const image = readImageFont(imageFile);
  const screen = readScreenFont(screenFile);

  test(`name の版が画面の ${screenFile} と同じ ${VERSION}`, () => {
    expect(image.getEnglishName("version")).toBe(VERSION);
    expect(screen.version).toBe(VERSION);
  });

  test(`U+0020〜007E の送り幅が画面の ${screenFile} と同じ`, () => {
    expect(image.unitsPerEm).toBe(screen.unitsPerEm);
    const imageWidths = BASIC_LATIN.map(
      (char) => image.charToGlyph(char).advanceWidth,
    );
    const screenWidths = BASIC_LATIN.map(screen.advanceWidth);
    expect(imageWidths).toEqual(screenWidths);
  });
});
