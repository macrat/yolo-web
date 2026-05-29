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

// --dark フラグ: 指定時はダークテーマで撮影する
// next-themes は attribute="class" で <html class="dark"> を管理するため、
// emulateMedia だけでは silent-light になる場合がある。
// addInitScript で localStorage に theme='dark' を事前注入し、
// next-themes に dark を選ばせる方式を採用する。
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
    const context = await browser.newContext();

    if (darkMode) {
      // ページ遷移前に localStorage へ dark を注入する。
      // next-themes はハイドレーション時に localStorage['theme'] を読んで
      // <html class="dark"> を付与するため、この順序が必須。
      await context.addInitScript(() => {
        localStorage.setItem("theme", "dark");
      });
    }

    const page = await context.newPage();

    if (darkMode) {
      // 保険として OS レベルのカラースキームも dark にする（page.goto 前に設定）
      await page.emulateMedia({ colorScheme: "dark" });
    }

    await page.setViewportSize({ width, height: 900 });
    await page.goto(url, { waitUntil: "networkidle" });

    // dark 適用の成否を判定する
    let darkApplied = false;
    if (darkMode) {
      // next-themes がハイドレーション後に <html class="dark"> を付与するまで待つ。
      // タイムアウト 5 秒以内に dark クラスが付かない場合は失敗とみなす。
      darkApplied = await page
        .waitForFunction(
          () => document.documentElement.classList.contains("dark"),
          { timeout: 5000 },
        )
        .then(() => true)
        .catch(() => false);

      if (!darkApplied) {
        // ファイル名と終了コードの両方で失敗を通知する（ログ見落としを防ぐ二重化）
        console.error(
          `[ERROR] w${width}: <html class="dark"> が 5 秒以内に付与されませんでした。` +
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
