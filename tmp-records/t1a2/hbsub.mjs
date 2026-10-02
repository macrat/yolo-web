// Production-candidate subsetter: harfbuzz hb-subset (harfbuzzjs 1.6.2 wasm) + Google woff2 encoder (wawoff2 2.0.1).
// The source face is parsed once and reused for every subset (build-time use).
// Settings (fixed): explicit layout-feature allowlist (no vert/jp78/... closure), hinting kept,
// name IDs 0-6 + 13 (license) + 14 (license URL) kept.
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const wawoff2 = require("wawoff2");
const wasmPath = require.resolve("harfbuzzjs/dist/harfbuzz-subset.wasm");
const { instance } = await WebAssembly.instantiate(fs.readFileSync(wasmPath));
const hb = instance.exports;
hb._initialize();
const heap = () => new Uint8Array(hb.memory.buffer);
const TAG = (s) => s.split("").reduce((a, c) => (a << 8) + c.charCodeAt(0), 0);
export const FEATURES = ["ccmp", "locl", "kern", "mark", "mkmk", "palt", "halt", "chws"];
export const NAME_IDS = [0, 1, 2, 3, 4, 5, 6, 13, 14];

export function openFace(path) {
  const buf = fs.readFileSync(path);
  const p = hb.malloc(buf.byteLength);
  heap().set(buf, p);
  const blob = hb.hb_blob_create(p, buf.byteLength, 2, 0, 0);
  const face = hb.hb_face_create(blob, 0);
  hb.hb_blob_destroy(blob);
  return face;
}

export function subsetTTF(face, text, { features = FEATURES, nameIds = NAME_IDS, pin } = {}) {
  const input = hb.hb_subset_input_create_or_fail();
  const lf = hb.hb_subset_input_set(input, 6);
  hb.hb_set_clear(lf);
  for (const f of features) hb.hb_set_add(lf, TAG(f));
  const nid = hb.hb_subset_input_set(input, 4);
  hb.hb_set_clear(nid);
  for (const n of nameIds) hb.hb_set_add(nid, n);
  const us = hb.hb_subset_input_unicode_set(input);
  for (const c of text) hb.hb_set_add(us, c.codePointAt(0));
  if (pin) for (const [a, v] of Object.entries(pin)) hb.hb_subset_input_pin_axis_location(input, face, TAG(a), v);
  const sub = hb.hb_subset_or_fail(face, input);
  hb.hb_subset_input_destroy(input);
  if (!sub) throw new Error("subset failed");
  const blob = hb.hb_face_reference_blob(sub);
  const off = hb.hb_blob_get_data(blob, 0);
  const len = hb.hb_blob_get_length(blob);
  const out = Buffer.from(heap().subarray(off, off + len));
  hb.hb_blob_destroy(blob);
  hb.hb_face_destroy(sub);
  return out;
}

export async function toWoff2(ttf) {
  return Buffer.from(await wawoff2.compress(ttf));
}
