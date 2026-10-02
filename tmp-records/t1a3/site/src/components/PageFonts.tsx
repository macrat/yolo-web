// Prototype (cycle-316 T1a): per-page font families. The page's @font-face and the CSS variables that
// point at them are rendered by the page itself, so they travel with the page (HTML on a document load,
// the page's RSC on a client-side navigation) and are removed when the page unmounts.
import fs from "node:fs";
import path from "node:path";
import mode from "@/lib/fontmode.json";
import FontPreload from "@/components/FontPreload";

type Face = { file: string; chars: string; bytes: number } | null;
type Entry = { fam: string; page: Record<string, Face>; q?: Record<string, Face>; r?: Record<string, Face> };
let manifest: Record<string, Entry> | null = null;
function load(): Record<string, Entry> {
  if (!manifest) manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), "fontbuild/manifest.json"), "utf8"))[mode.FACE];
  return manifest!;
}
const esc = (s: string) => [...s].map((c) => "U+" + c.codePointAt(0)!.toString(16).toUpperCase()).join(",");
const MINCHO = `"Hiragino Mincho ProN","Yu Mincho",serif`;
const GOTHIC = `"Hiragino Kaku Gothic ProN","Yu Gothic Medium","Noto Sans JP","IPAGothic",sans-serif`;

export default function PageFonts({ k }: { k: string }) {
  const e = load()[k];
  if (!e) return null;
  const src = (f: string) =>
    mode.INLINE
      ? `url(data:font/woff2;base64,${fs.readFileSync(path.join(process.cwd(), "public/__pf", f)).toString("base64")})`
      : `url(/__pf/${f})`;
  let css = "";
  const preloads: { href: string; low?: boolean }[] = [];
  const face = (fam: string, w: number, f: Face, layer: boolean, pre: "high" | "low" | null) => {
    if (!f) return;
    css += `@font-face{font-family:"${fam}";font-weight:${w};font-display:${mode.DISPLAY};src:${src(f.file)} format("woff2")${layer ? `;unicode-range:${esc(f.chars)}` : ""}}`;
    if (!mode.INLINE && pre) preloads.push({ href: `/__pf/${f.file}`, low: pre === "low" });
  };
  const layered = !!(e.q || e.r);
  face(`${e.fam}-h`, 400, e.page.zen, layered, "high");
  face(e.fam, 400, e.page.biz400, layered, "high");
  face(e.fam, 700, e.page.biz700, layered, "high");
  if (e.q) { face(`${e.fam}-h`, 400, e.q.zen, true, "low"); face(e.fam, 400, e.q.biz400, true, "low"); }
  if (e.r) { face(`${e.fam}-h`, 400, e.r.zen, true, null); face(e.fam, 400, e.r.biz400, true, null); face(e.fam, 700, e.r.biz700, true, null); }
  css += `:root{--font-mincho:"Yolos Sans","${e.fam}-h","Yolos Sans Fallback",${MINCHO};--font-gothic:"Yolos Sans","${e.fam}","Yolos Sans Fallback",${GOTHIC};--font-number:"Yolos Sans","${e.fam}","Yolos Sans Fallback",${GOTHIC}}`;
  return (
    <>
      {mode.PRELOAD === "div" && preloads.length > 0 && <FontPreload hrefs={preloads.filter((p) => !p.low).map((p) => p.href)} low={preloads.filter((p) => p.low).map((p) => p.href)} />}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
