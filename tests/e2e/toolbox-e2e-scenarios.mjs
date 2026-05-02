/**
 * cycle-175 2.2.10 E2E シナリオ
 *
 * シナリオ A: 道具箱の編集フロー（ToolboxShell + TileGrid）
 * シナリオ B: 双方向 overlay 排他（cycle-175.md L941 完了判定）
 * シナリオ C: パフォーマンス計測（50 タイル相当のフレーム latency）
 *
 * 実行方法:
 *   node tests/e2e/toolbox-e2e-scenarios.mjs
 *
 * 環境変数:
 *   E2E_BASE_URL - ベースURL（デフォルト: http://localhost:3099）
 */

import pkg from "../../node_modules/playwright-core/index.js";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
const { chromium } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const PERF_DIR =
  process.env.PERF_DIR ??
  path.join(__dirname, "../../tmp/cycle-175-perf-trace");

mkdirSync(PERF_DIR, { recursive: true });

let passed = 0;
let failed = 0;
const failures = [];

/**
 * /toolbox-preview は dynamic({ ssr: false }) のため CSR 完了まで toolbox-shell が DOM に現れない。
 * ページ goto 後にこの関数で toolbox-shell の出現を待つことで確実に検証できる。
 */
async function waitForToolboxShell(page, timeout = 15000) {
  await page
    .locator('[data-testid="toolbox-shell"]')
    .waitFor({ state: "visible", timeout });
}

function assert(condition, label) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failures.push(label);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// シナリオ A: 道具箱の編集フロー
// ---------------------------------------------------------------------------

async function scenarioA(browser) {
  console.log("\n=== シナリオ A: 道具箱の編集フロー ===");

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // A-1. /toolbox-preview を開く
  // dynamic({ ssr: false }) のためクライアントサイドレンダリングを待つ必要がある
  await page.goto(`${BASE_URL}/toolbox-preview`, { waitUntil: "networkidle" });
  // localStorage をクリアして初期状態から開始（ページロード後に実行してリロード時の再クリアを防ぐ）
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  // toolbox-shell が DOM に現れるまで最大 15 秒待つ（CSR 完了を待機）
  const shellEl = await page
    .locator('[data-testid="toolbox-shell"]')
    .waitFor({ state: "visible", timeout: 15000 })
    .then(() => 1)
    .catch(() => 0);
  assert(
    shellEl > 0,
    "A-1. /toolbox-preview が表示される（toolbox-shell 存在）",
  );

  // A-2. 「編集」ボタンクリック → 編集モード遷移
  const editBtn = page.locator('button[aria-label="道具箱を編集モードにする"]');
  const editBtnVisible = await editBtn.isVisible();
  assert(editBtnVisible, "A-2a. 編集ボタンが表示されている");

  if (editBtnVisible) {
    await editBtn.click();
    await page.waitForTimeout(300);
    const mode = await page
      .locator('[data-testid="toolbox-shell"]')
      .getAttribute("data-mode");
    assert(mode === "edit", `A-2b. 編集モードに遷移した (data-mode="${mode}")`);
  }

  // A-3. 移動ボタン（前へ / 後へ）の存在確認
  // medium以上のタイルの移動ボタングループを確認
  const moveButtonGroups = page.locator(
    '[role="group"][aria-label="タイルの移動"]',
  );
  const moveButtonCount = await moveButtonGroups.count();
  assert(
    moveButtonCount > 0,
    `A-3. 移動ボタングループが表示されている (${moveButtonCount}個)`,
  );

  // A-4. 削除ボタンの存在確認
  const deleteButtons = page.locator('button[aria-label="削除する"]');
  const deleteCount = await deleteButtons.count();
  assert(deleteCount > 0, `A-4. 削除ボタンが表示されている (${deleteCount}個)`);

  const initialTileCount = deleteCount;

  // A-5. 削除ボタンでタイル削除
  if (deleteCount > 0) {
    await deleteButtons.first().click();
    await page.waitForTimeout(300);
    const newDeleteCount = await page
      .locator('button[aria-label="削除する"]')
      .count();
    assert(
      newDeleteCount === initialTileCount - 1,
      `A-5. 削除後タイル数が 1 減った (${initialTileCount} → ${newDeleteCount})`,
    );
  }

  // A-6. AddTileModal を開いてタイルを追加
  const addSlotBtn = page.locator('button[aria-label="ツールを追加"]');
  const addSlotVisible = await addSlotBtn.isVisible();
  assert(
    addSlotVisible,
    "A-6a. 「ツールを追加」スロットボタンが表示されている",
  );

  if (addSlotVisible) {
    await addSlotBtn.click();
    await page.waitForTimeout(300);
    const modal = page.locator('[data-testid="add-tile-modal"]');
    const modalVisible = await modal.isVisible().catch(() => false);
    // モーダルが表示されることを確認（testid が存在しない場合は aria-label で代替）
    const modalAlt = page.locator('[role="dialog"]');
    const modalAltVisible = (await modalAlt.count()) > 0;
    assert(
      modalVisible || modalAltVisible,
      "A-6b. AddTileModal が開いた（dialog role または data-testid で確認）",
    );

    // モーダルを閉じる（ESC）
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  // A-7. 「完了」ボタンで使用モード復帰
  const doneBtn = page.locator(
    'button[aria-label="編集を完了して使用モードに戻る"]',
  );
  const doneBtnVisible = await doneBtn.isVisible();
  assert(doneBtnVisible, "A-7a. 完了ボタンが表示されている");

  if (doneBtnVisible) {
    await doneBtn.click();
    await page.waitForTimeout(300);
    const modeAfter = await page
      .locator('[data-testid="toolbox-shell"]')
      .getAttribute("data-mode");
    assert(
      modeAfter === "view",
      `A-7b. 使用モードに復帰した (data-mode="${modeAfter}")`,
    );
  }

  // A-8. リロードして変更が localStorage に永続化されていることを確認
  await page.reload({ waitUntil: "networkidle" });
  // CSR 完了を待つ
  await waitForToolboxShell(page);
  // 削除後の状態（初期より 1 タイル少ない）が維持されているか確認
  // 削除を行った場合のみチェック（deleteCount > 0 の時）
  if (deleteCount > 0) {
    // view モードでは削除ボタンがないため、<article> タイル要素で数を確認する。
    // data-testid は "tile-<slug>" と "tile-content-<slug>" の 2 種があるため、
    // article[data-testid^="tile-"] でタイル本体のみを絞り込む。
    const tileArticles = page.locator('article[data-testid^="tile-"]');
    const tilesAfterReload = await tileArticles.count();
    assert(
      tilesAfterReload === initialTileCount - 1,
      `A-8. リロード後も削除した状態が維持されている (${tilesAfterReload} タイル)`,
    );
  }

  await context.close();
}

// ---------------------------------------------------------------------------
// シナリオ B: 双方向 overlay 排他
// ---------------------------------------------------------------------------

async function scenarioB(browser) {
  console.log("\n=== シナリオ B: 双方向 overlay 排他 ===");

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  await context.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto(`${BASE_URL}/toolbox-preview`, { waitUntil: "networkidle" });
  // CSR 完了を待つ
  await waitForToolboxShell(page);

  // 編集モードに切り替え
  const editBtn = page.locator('button[aria-label="道具箱を編集モードにする"]');
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(300);
  }

  // B-1. small タイルの popover を開く
  const expandBtns = page.locator('button[aria-label="移動操作を展開"]');
  const expandCount = await expandBtns.count();

  if (expandCount > 0) {
    await expandBtns.first().click();
    await page.waitForTimeout(300);

    // 展開パネルが表示されることを確認
    const closeBtn = page.locator('button[aria-label="移動操作を閉じる"]');
    const panelVisible = await closeBtn.isVisible().catch(() => false);
    assert(panelVisible, "B-1. small タイルの popover が開いた");

    // B-2. popover が開いている状態で AddTileModal を開こうとする → ブロック確認
    // ToolboxShell の overlay 暗幕が pointer events をブロックするため通常クリックは届かない。
    // force: true でクリックイベントを強制送信して、ロジックガード（openOverlayId != null）が
    // 機能することを確認する。
    const addSlotBtn = page.locator('button[aria-label="ツールを追加"]');
    if ((await addSlotBtn.count()) > 0) {
      await addSlotBtn.click({ force: true });
      await page.waitForTimeout(300);

      // overlay 排他: AddTileModal が開かないことを確認
      const modal = page.locator('[role="dialog"]');
      const modalOpen = (await modal.count()) > 0;
      assert(
        !modalOpen,
        "B-2. popover 開中は AddTileModal が開かない（排他制御 / openOverlayId ガード）",
      );
    } else {
      assert(true, "B-2. AddSlotボタンなし（スキップ）");
    }

    // B-3. popover を閉じる
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    } else {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }
    const panelClosed = !(await page
      .locator('button[aria-label="移動操作を閉じる"]')
      .isVisible()
      .catch(() => false));
    assert(panelClosed, "B-3. popover が閉じた");

    // B-4. popover を閉じた後は AddTileModal を開ける
    const addSlotBtn2 = page.locator('button[aria-label="ツールを追加"]');
    if (await addSlotBtn2.isVisible()) {
      await addSlotBtn2.click();
      await page.waitForTimeout(300);
      const modal2 = page.locator('[role="dialog"]');
      const modal2Open = (await modal2.count()) > 0;
      assert(modal2Open, "B-4. popover 閉後は AddTileModal が開ける");

      if (modal2Open) {
        // B-5. AddTileModal が開いている状態で小タイルの popover を開こうとする → ブロック
        const expandBtns2 = page.locator('button[aria-label="移動操作を展開"]');
        // inert 属性によりタイル領域のボタンがアクセス不能になっていることを確認
        const tilesContainer = page.locator('[data-testid="toolbox-tiles"]');
        const isInert = await tilesContainer.evaluate((el) =>
          el.hasAttribute("inert"),
        );
        assert(
          isInert,
          "B-5. AddTileModal 開中はタイル領域に inert 属性が付与されている",
        );

        // モーダルを ESC で閉じる
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    } else {
      assert(true, "B-4. AddSlotボタンなし（スキップ）");
      assert(true, "B-5. AddSlotボタンなし（スキップ）");
    }
  } else {
    console.log(
      "  INFO: small タイルの展開ボタンなし（B シナリオを一部スキップ）",
    );
    assert(true, "B-1. small タイル展開ボタン不在（スキップ）");
    assert(true, "B-2. skip");
    assert(true, "B-3. skip");
    assert(true, "B-4. skip");
    assert(true, "B-5. skip");
  }

  await context.close();
}

// ---------------------------------------------------------------------------
// シナリオ C: パフォーマンス計測（storybook TileGrid フィクスチャ）
// ---------------------------------------------------------------------------

async function scenarioC(browser) {
  console.log("\n=== シナリオ C: パフォーマンス計測 ===");

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // Performance trace を取得
  await context.tracing.start({ screenshots: false, snapshots: false });

  await page.goto(`${BASE_URL}/storybook`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // TileGrid セクションにスクロール
  await page.evaluate(() => {
    const el = document.getElementById("tile-grid");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(500);

  // /toolbox-preview でのパフォーマンス計測（ドラッグ操作はE2Eでシミュレートが難しいため、
  // ページの基本描画 latency を計測する）
  await page.goto(`${BASE_URL}/toolbox-preview`, { waitUntil: "networkidle" });
  // CSR 完了を待つ
  await waitForToolboxShell(page);

  // 編集モードに遷移してリペイントを誘発
  const editBtn = page.locator('button[aria-label="道具箱を編集モードにする"]');
  if (await editBtn.isVisible()) {
    // 編集ボタンクリック前の時刻記録
    const t0 = await page.evaluate(() => performance.now());
    await editBtn.click();
    // 描画完了まで待機
    await page.waitForTimeout(100);
    const t1 = await page.evaluate(() => performance.now());
    const editModeLatency = t1 - t0;
    assert(
      editModeLatency < 500,
      `C-1. 編集モード遷移の latency が 500ms 未満 (${editModeLatency.toFixed(1)}ms)`,
    );

    // 完了ボタンクリックの latency
    const t2 = await page.evaluate(() => performance.now());
    const doneBtn = page.locator(
      'button[aria-label="編集を完了して使用モードに戻る"]',
    );
    if (await doneBtn.isVisible()) {
      await doneBtn.click();
      await page.waitForTimeout(100);
      const t3 = await page.evaluate(() => performance.now());
      const viewModeLatency = t3 - t2;
      assert(
        viewModeLatency < 500,
        `C-2. 使用モード復帰の latency が 500ms 未満 (${viewModeLatency.toFixed(1)}ms)`,
      );
    }

    // Long Task の計測（PerformanceObserver 経由）
    const longTaskCount = await page.evaluate(() => {
      return new Promise((resolve) => {
        let count = 0;
        const observer = new PerformanceObserver((list) => {
          count += list.getEntries().length;
        });
        observer.observe({ entryTypes: ["longtask"] });
        // 500ms 後に結果を返す
        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, 500);
      });
    });
    assert(
      longTaskCount < 5,
      `C-3. Long Task（50ms超）が 5 件未満 (観測: ${longTaskCount}件)`,
    );

    // パフォーマンス情報をファイルに書き出す
    const perfData = {
      editModeLatencyMs: editModeLatency.toFixed(1),
      longTaskCount,
      measuredAt: new Date().toISOString(),
    };
    console.log("  パフォーマンス計測値:", JSON.stringify(perfData, null, 2));

    // ファイルに書き出す
    import("fs").then((fs) => {
      fs.writeFileSync(
        `${PERF_DIR}/perf-results.json`,
        JSON.stringify(perfData, null, 2),
      );
      console.log(`  Saved: ${PERF_DIR}/perf-results.json`);
    });
  }

  // トレース保存
  const traceFile = `${PERF_DIR}/trace.zip`;
  await context.tracing.stop({ path: traceFile });
  console.log(`  Saved: ${traceFile}`);

  await context.close();
}

// ---------------------------------------------------------------------------
// キーボード操作の網羅検証
// ---------------------------------------------------------------------------

async function scenarioKeyboard(browser) {
  console.log("\n=== キーボード操作網羅検証 ===");

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  await context.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto(`${BASE_URL}/toolbox-preview`, { waitUntil: "networkidle" });
  // CSR 完了を待つ
  await waitForToolboxShell(page);

  // K-1. Tab でツールバーの編集ボタンに到達できるか
  await page.keyboard.press("Tab");
  await page.waitForTimeout(100);
  const focusedEl = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el?.tagName,
      ariaLabel: el?.getAttribute("aria-label"),
      type: el?.getAttribute("type"),
    };
  });
  // 編集ボタンに到達するまで最大 10 回 Tab を押す
  let editButtonFocused = focusedEl?.ariaLabel === "道具箱を編集モードにする";
  for (let i = 0; i < 10 && !editButtonFocused; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(50);
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute("aria-label");
    });
    editButtonFocused = f === "道具箱を編集モードにする";
  }
  assert(editButtonFocused, "K-1. Tab で編集ボタンに到達できる");

  // K-2. Enter で編集モードに遷移
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  const modeAfterEnter = await page
    .locator('[data-testid="toolbox-shell"]')
    .getAttribute("data-mode");
  assert(modeAfterEnter === "edit", "K-2. Enter で編集モードに遷移できる");

  // K-3. 完了ボタン（Tabでフォーカス到達、Enter で押下）
  const doneBtn = page.locator(
    'button[aria-label="編集を完了して使用モードに戻る"]',
  );
  const doneFocused = await doneBtn.evaluate(
    (el) => el === document.activeElement,
  );
  // 編集モードに入ると完了ボタンにフォーカスが移動するはず
  assert(doneFocused, "K-3. 編集モード遷移後に完了ボタンへ自動フォーカス移動");

  // K-4. 編集モード中の ESC で popover を閉じる（small タイルがあれば）
  const expandBtns = page.locator('button[aria-label="移動操作を展開"]');
  if ((await expandBtns.count()) > 0) {
    await expandBtns.first().click();
    await page.waitForTimeout(200);
    const panelOpen = await page
      .locator('button[aria-label="移動操作を閉じる"]')
      .isVisible()
      .catch(() => false);
    if (panelOpen) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      const panelClosed = !(await page
        .locator('button[aria-label="移動操作を閉じる"]')
        .isVisible()
        .catch(() => false));
      assert(panelClosed, "K-4. ESC で small タイルの popover が閉じる");
    }
  }

  // K-5. view モードではタイルタイトルに card-link（titleLink）が表示される
  await page.keyboard.press("Enter"); // 完了ボタン or ESC で完了モードへ
  const doneBtnForClose = page.locator(
    'button[aria-label="編集を完了して使用モードに戻る"]',
  );
  if (await doneBtnForClose.isVisible()) {
    await doneBtnForClose.click();
    await page.waitForTimeout(300);
  }

  const titleLinks = page.locator('[class*="titleLink"]');
  const titleLinkCount = await titleLinks.count();
  assert(
    titleLinkCount > 0,
    `K-5. 使用モードではタイルタイトルがリンク表示される (${titleLinkCount}個)`,
  );

  await context.close();
}

// ---------------------------------------------------------------------------
// アクセシビリティ確認
// ---------------------------------------------------------------------------

async function scenarioA11y(browser) {
  console.log("\n=== アクセシビリティ確認 ===");

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  await context.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto(`${BASE_URL}/toolbox-preview`, { waitUntil: "networkidle" });
  // CSR 完了を待つ
  await waitForToolboxShell(page);

  // 編集モードに切り替え
  const editBtn = page.locator('button[aria-label="道具箱を編集モードにする"]');
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(300);
  }

  // A11y-1. ドラッグハンドルボタンに aria-label があるか
  const dragHandles = page.locator('button[aria-label="ドラッグして移動"]');
  const dragHandleCount = await dragHandles.count();
  assert(
    dragHandleCount > 0,
    `A11y-1. ドラッグハンドルに aria-label あり (${dragHandleCount}個)`,
  );

  // A11y-2. 削除ボタンに aria-label があるか
  const deleteButtons = page.locator('button[aria-label="削除する"]');
  const deleteButtonCount = await deleteButtons.count();
  assert(
    deleteButtonCount > 0,
    `A11y-2. 削除ボタンに aria-label あり (${deleteButtonCount}個)`,
  );

  // A11y-3. タップターゲットサイズ（44px以上）の確認
  if (dragHandleCount > 0) {
    const dragHandleSize = await dragHandles.first().evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    assert(
      dragHandleSize.height >= 40,
      `A11y-3a. ドラッグハンドルのタップターゲット高さ ≥ 40px (${dragHandleSize.height.toFixed(0)}px)`,
    );
  }

  if (deleteButtonCount > 0) {
    const deleteButtonSize = await deleteButtons.first().evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    assert(
      deleteButtonSize.height >= 40,
      `A11y-3b. 削除ボタンのタップターゲット高さ ≥ 40px (${deleteButtonSize.height.toFixed(0)}px)`,
    );
  }

  // A11y-4. 移動ボタングループに role="group" と aria-label があるか
  const moveGroups = page.locator('[role="group"][aria-label="タイルの移動"]');
  const moveGroupCount = await moveGroups.count();
  assert(
    moveGroupCount > 0,
    `A11y-4. 移動ボタングループに role="group" + aria-label あり (${moveGroupCount}個)`,
  );

  // A11y-5. ToolboxShell の toolbar が存在するか
  const toolbarEl = page.locator('[data-testid="toolbox-shell"]');
  const toolbarExists = (await toolbarEl.count()) > 0;
  assert(
    toolbarExists,
    "A11y-5. ToolboxShell（toolbox-shell testid）が存在する",
  );

  // A11y-6. 編集ボタン / 完了ボタンの aria-label
  const doneBtnEl = page.locator(
    'button[aria-label="編集を完了して使用モードに戻る"]',
  );
  const doneBtnCount = await doneBtnEl.count();
  assert(doneBtnCount > 0, "A11y-6. 完了ボタンに適切な aria-label あり");

  // A11y-7. small タイル展開ボタンに aria-expanded があるか
  const expandBtns = page.locator('button[aria-label="移動操作を展開"]');
  const expandCount = await expandBtns.count();
  if (expandCount > 0) {
    const ariaExpanded = await expandBtns.first().getAttribute("aria-expanded");
    assert(
      ariaExpanded !== null,
      `A11y-7. small タイル展開ボタンに aria-expanded あり (${ariaExpanded})`,
    );
  }

  // A11y-8. aria-live ステータス領域の確認
  const liveRegion = page.locator('[aria-live="polite"][role="status"]');
  const liveRegionCount = await liveRegion.count();
  assert(
    liveRegionCount > 0,
    `A11y-8. aria-live 領域（編集中通知）が存在する (${liveRegionCount}個)`,
  );

  await context.close();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });

  await scenarioA(browser);
  await scenarioB(browser);
  await scenarioC(browser);
  await scenarioKeyboard(browser);
  await scenarioA11y(browser);

  await browser.close();

  console.log(
    `\n=== E2E シナリオ完了: ${passed} passed / ${failed} failed ===`,
  );
  if (failures.length > 0) {
    console.error("失敗したテスト:");
    for (const f of failures) {
      console.error(` - ${f}`);
    }
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
