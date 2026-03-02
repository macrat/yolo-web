import type { ToolMeta, ToolDefinition } from "./types";

import { meta as charCountMeta } from "./char-count/meta";
import { meta as jsonFormatterMeta } from "./json-formatter/meta";
import { meta as base64Meta } from "./base64/meta";
import { meta as urlEncodeMeta } from "./url-encode/meta";
import { meta as textDiffMeta } from "./text-diff/meta";
import { meta as hashGeneratorMeta } from "./hash-generator/meta";
import { meta as passwordGeneratorMeta } from "./password-generator/meta";
import { meta as qrCodeMeta } from "./qr-code/meta";
import { meta as regexTesterMeta } from "./regex-tester/meta";
import { meta as unixTimestampMeta } from "./unix-timestamp/meta";
import { meta as htmlEntityMeta } from "./html-entity/meta";
import { meta as fullwidthConverterMeta } from "./fullwidth-converter/meta";
import { meta as textReplaceMeta } from "./text-replace/meta";
import { meta as colorConverterMeta } from "./color-converter/meta";
import { meta as markdownPreviewMeta } from "./markdown-preview/meta";
import { meta as dummyTextMeta } from "./dummy-text/meta";
import { meta as dateCalculatorMeta } from "./date-calculator/meta";
import { meta as byteCounterMeta } from "./byte-counter/meta";
import { meta as csvConverterMeta } from "./csv-converter/meta";
import { meta as numberBaseConverterMeta } from "./number-base-converter/meta";
import { meta as kanaConverterMeta } from "./kana-converter/meta";
import { meta as emailValidatorMeta } from "./email-validator/meta";
import { meta as unitConverterMeta } from "./unit-converter/meta";
import { meta as yamlFormatterMeta } from "./yaml-formatter/meta";
import { meta as imageBase64Meta } from "./image-base64/meta";
import { meta as ageCalculatorMeta } from "./age-calculator/meta";
import { meta as bmiCalculatorMeta } from "./bmi-calculator/meta";
import { meta as sqlFormatterMeta } from "./sql-formatter/meta";
import { meta as cronParserMeta } from "./cron-parser/meta";
import { meta as imageResizerMeta } from "./image-resizer/meta";
import { meta as businessEmailMeta } from "./business-email/meta";
import { meta as keigoReferenceMeta } from "./keigo-reference/meta";
import { meta as traditionalColorPaletteMeta } from "./traditional-color-palette/meta";

const toolEntries: ToolDefinition[] = [
  {
    meta: charCountMeta,
  },
  {
    meta: jsonFormatterMeta,
  },
  {
    meta: base64Meta,
  },
  {
    meta: urlEncodeMeta,
  },
  {
    meta: textDiffMeta,
  },
  {
    meta: hashGeneratorMeta,
  },
  {
    meta: passwordGeneratorMeta,
  },
  {
    meta: qrCodeMeta,
  },
  {
    meta: regexTesterMeta,
  },
  {
    meta: unixTimestampMeta,
  },
  {
    meta: htmlEntityMeta,
  },
  {
    meta: fullwidthConverterMeta,
  },
  {
    meta: textReplaceMeta,
  },
  {
    meta: colorConverterMeta,
  },
  {
    meta: markdownPreviewMeta,
  },
  {
    meta: dummyTextMeta,
  },
  {
    meta: dateCalculatorMeta,
  },
  {
    meta: byteCounterMeta,
  },
  {
    meta: csvConverterMeta,
  },
  {
    meta: numberBaseConverterMeta,
  },
  {
    meta: kanaConverterMeta,
  },
  {
    meta: emailValidatorMeta,
  },
  {
    meta: unitConverterMeta,
  },
  {
    meta: yamlFormatterMeta,
  },
  {
    meta: imageBase64Meta,
  },
  {
    meta: ageCalculatorMeta,
  },
  {
    meta: bmiCalculatorMeta,
  },
  {
    meta: sqlFormatterMeta,
  },
  {
    meta: cronParserMeta,
  },
  {
    meta: imageResizerMeta,
  },
  {
    meta: businessEmailMeta,
  },
  {
    meta: keigoReferenceMeta,
  },
  {
    meta: traditionalColorPaletteMeta,
  },
];

// Indexed by slug for O(1) lookup
export const toolsBySlug: Map<string, ToolDefinition> = new Map(
  toolEntries.map((entry) => [entry.meta.slug, entry]),
);

// All tool metadata (no component code loaded)
export const allToolMetas: ToolMeta[] = toolEntries.map((e) => e.meta);

// Get all tool slugs
export function getAllToolSlugs(): string[] {
  return toolEntries.map((e) => e.meta.slug);
}
