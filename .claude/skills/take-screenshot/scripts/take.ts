import { chromium, type Browser } from "playwright";
import sharp from "sharp";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const url = process.argv[2];
if (!url) {
  console.error(
    "Usage: npx tsx take.ts <URL> [--selector <CSS selector>] [--dark] [--out <dir>]",
  );
  process.exit(1);
}

// 値を取るオプションの値を返す。オプションが無ければ null。値が無いか `--` で始まる
// （すぐ後ろに別のフラグを書いた）ときは、そのフラグを値と取り違えないようにエラーで止める。
function optionValue(name: string, valueName: string): string | null {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    console.error(`${name} requires a ${valueName} argument`);
    process.exit(1);
  }
  return value;
}

const selector = optionValue("--selector", "CSS selector");

// --out: 画像の書き出し先。既定は cwd の tmp/screenshots。並行して撮る作業者は自分専用のディレクトリを渡す。
const outDir =
  optionValue("--out", "directory") ?? path.join("tmp", "screenshots");

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

// ブラウザの置き場（PLAYWRIGHT_BROWSERS_PATH、無ければ Playwright の既定の置き場）に入っている
// Chromium の本体のうち、版がいちばん新しいものを返す。
function findInstalledChromium(): string | null {
  const browsersDir =
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
    path.join(os.homedir(), ".cache", "ms-playwright");
  if (!fs.existsSync(browsersDir)) return null;

  const candidates = fs
    .readdirSync(browsersDir)
    .map((name) => ({ name, revision: /^chromium-(\d+)$/.exec(name)?.[1] }))
    .filter((entry) => entry.revision !== undefined)
    .sort((a, b) => Number(b.revision) - Number(a.revision))
    .flatMap(({ name }) =>
      ["chrome-linux64", "chrome-linux"].map((sub) =>
        path.join(browsersDir, name, sub, "chrome"),
      ),
    );
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

// リポジトリの playwright が求める版のブラウザで起動する。その版が入っていないとき
// （ブラウザを足さない環境で、入っている版が違うとき）は、入っている Chromium で起動する。
async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch();
  } catch (err) {
    const missingExecutable =
      err instanceof Error && err.message.includes("Executable doesn't exist");
    const installed = missingExecutable ? findInstalledChromium() : null;
    if (!installed) throw err;
    console.log(
      `playwright が求める版のブラウザが無いので、入っている Chromium で撮ります: ${installed}`,
    );
    return chromium.launch({ executablePath: installed });
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await launchBrowser();
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
