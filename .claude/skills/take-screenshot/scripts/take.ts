import { chromium } from "playwright";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const url = process.argv[2];
if (!url) {
  console.error(
    "Usage: npx tsx take.ts <URL> [--selector <CSS selector>] [--dark]",
  );
  process.exit(1);
}

const selectorIndex = process.argv.indexOf("--selector");
const selector = selectorIndex !== -1 ? process.argv[selectorIndex + 1] : null;
if (selectorIndex !== -1 && !selector) {
  console.error("--selector requires a CSS selector argument");
  process.exit(1);
}

// --dark フラグ: 指定時はダークテーマで撮影する。
// サイトは端末の設定（prefers-color-scheme）に従うので、ブラウザの設定を dark にして撮る。
const darkMode = process.argv.includes("--dark");

const widths = [1920, 1536, 1280, 720, 440, 360];

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function sanitizeUrl(rawUrl: string): string {
  return rawUrl
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const outDir = path.join("tmp", "screenshots");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const timestamp = getTimestamp();
  const sanitized = sanitizeUrl(url);

  // dark 適用に失敗した幅を追跡する（後で非ゼロ終了に使う）
  const darkFailedWidths: number[] = [];

  for (const width of widths) {
    const context = await browser.newContext({
      colorScheme: darkMode ? "dark" : "light",
    });
    const page = await context.newPage();

    await page.setViewportSize({ width, height: 900 });
    await page.goto(url, { waitUntil: "networkidle" });

    // dark 適用の成否を判定する
    let darkApplied = false;
    if (darkMode) {
      // 撮る前に、dark の値が実際に当たったことを確かめる。
      // テーマの値を上書きする仕組みが紛れ込んでも、light のまま dark の名前で保存しないため。
      darkApplied = await page.evaluate(
        () =>
          window.matchMedia("(prefers-color-scheme: dark)").matches &&
          getComputedStyle(document.documentElement).colorScheme === "dark",
      );

      if (!darkApplied) {
        // ファイル名と終了コードの両方で失敗を通知する（ログ見落としを防ぐ二重化）
        console.error(
          `[ERROR] w${width}: dark の値が当たっていません。` +
            ` ファイル名を _dark-FAILED に変更して保存します。`,
        );
        darkFailedWidths.push(width);
      }
    }

    const sanitizedSelector = selector
      ? `_sel-${selector
          .replace(/[^a-zA-Z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")}`
      : "";
    // テーマタグ:
    //   light（--dark なし）  → タグなし（後方互換）
    //   dark 適用成功         → "_dark"
    //   dark 適用失敗         → "_dark-FAILED"（中身が light なのに dark だと見落とせない）
    const themeTag = darkMode ? (darkApplied ? "_dark" : "_dark-FAILED") : "";
    const filename = `${timestamp}_${sanitized}${sanitizedSelector}${themeTag}_w${width}.jpg`;
    const filepath = path.join(outDir, filename);

    if (selector) {
      const element = page.locator(selector).first();
      await element.screenshot({ type: "jpeg", path: filepath });
    } else {
      await page.screenshot({ type: "jpeg", fullPage: true, path: filepath });
    }

    const { width: imgW, height: imgH } = await sharp(filepath).metadata();
    console.log(`Saved: ${filepath} (${imgW}x${imgH}px)`);

    await context.close();
  }

  await browser.close();

  // dark 適用失敗があれば非ゼロ終了コードで終了する（CI・フック・自動チェックでも検知可能）
  if (darkFailedWidths.length > 0) {
    console.error(
      `[ERROR] dark テーマの適用に失敗した幅: ${darkFailedWidths.join(", ")}px` +
        ` — 該当ファイルのファイル名に "_dark-FAILED" が付いています。`,
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
