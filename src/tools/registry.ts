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

const toolEntries: ToolDefinition[] = [
  {
    meta: charCountMeta,
    componentImport: () => import("./char-count/Component"),
  },
  {
    meta: jsonFormatterMeta,
    componentImport: () => import("./json-formatter/Component"),
  },
  {
    meta: base64Meta,
    componentImport: () => import("./base64/Component"),
  },
  {
    meta: urlEncodeMeta,
    componentImport: () => import("./url-encode/Component"),
  },
  {
    meta: textDiffMeta,
    componentImport: () => import("./text-diff/Component"),
  },
  {
    meta: hashGeneratorMeta,
    componentImport: () => import("./hash-generator/Component"),
  },
  {
    meta: passwordGeneratorMeta,
    componentImport: () => import("./password-generator/Component"),
  },
  {
    meta: qrCodeMeta,
    componentImport: () => import("./qr-code/Component"),
  },
  {
    meta: regexTesterMeta,
    componentImport: () => import("./regex-tester/Component"),
  },
  {
    meta: unixTimestampMeta,
    componentImport: () => import("./unix-timestamp/Component"),
  },
  {
    meta: htmlEntityMeta,
    componentImport: () => import("./html-entity/Component"),
  },
  {
    meta: fullwidthConverterMeta,
    componentImport: () => import("./fullwidth-converter/Component"),
  },
  {
    meta: textReplaceMeta,
    componentImport: () => import("./text-replace/Component"),
  },
  {
    meta: colorConverterMeta,
    componentImport: () => import("./color-converter/Component"),
  },
  {
    meta: markdownPreviewMeta,
    componentImport: () => import("./markdown-preview/Component"),
  },
  {
    meta: dummyTextMeta,
    componentImport: () => import("./dummy-text/Component"),
  },
  {
    meta: dateCalculatorMeta,
    componentImport: () => import("./date-calculator/Component"),
  },
  {
    meta: byteCounterMeta,
    componentImport: () => import("./byte-counter/Component"),
  },
  {
    meta: csvConverterMeta,
    componentImport: () => import("./csv-converter/Component"),
  },
  {
    meta: numberBaseConverterMeta,
    componentImport: () => import("./number-base-converter/Component"),
  },
  {
    meta: kanaConverterMeta,
    componentImport: () => import("./kana-converter/Component"),
  },
  {
    meta: emailValidatorMeta,
    componentImport: () => import("./email-validator/Component"),
  },
  {
    meta: unitConverterMeta,
    componentImport: () => import("./unit-converter/Component"),
  },
  {
    meta: yamlFormatterMeta,
    componentImport: () => import("./yaml-formatter/Component"),
  },
  {
    meta: imageBase64Meta,
    componentImport: () => import("./image-base64/Component"),
  },
];

// Indexed by slug for O(1) lookup
export const toolsBySlug: Map<string, ToolDefinition> = new Map(
  toolEntries.map((entry) => [entry.meta.slug, entry]),
);

// All tool metadata (no component code loaded)
export const allToolMetas: ToolMeta[] = toolEntries.map((e) => e.meta);

// Get slugs for generateStaticParams
export function getAllToolSlugs(): string[] {
  return toolEntries.map((e) => e.meta.slug);
}
