/**
 * scroll-lock.ts — 参照カウンタ式スクロールロックヘルパ
 *
 * 複数のコンポーネント（Header のモバイルメニュー、ToolboxShell の編集モード等）が
 * 同時に scroll lock を要求する可能性があるため、単純な add/remove ではなく
 * 参照カウンタ（dataset.scrollLockCount）で管理する。
 *
 * - acquireScrollLock(): count++ → count が 0→1 で body.classList.add("scroll-locked")
 * - releaseScrollLock(): count-- → count が 1→0 で body.classList.remove("scroll-locked")
 *
 * AP-I07 準拠: body.style.overflow の直書きは禁止。
 * globals.css の .scroll-locked { overflow: hidden } と連携する。
 *
 * SSR ガード: typeof window === "undefined" のときは何もしない。
 */

function getCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = document.body.dataset["scrollLockCount"];
  const parsed = parseInt(raw ?? "0", 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

function setCount(count: number): void {
  document.body.dataset["scrollLockCount"] = String(count);
}

/**
 * スクロールロックを取得する。
 * 呼び出すたびに参照カウントを +1 する。
 * カウントが 0→1 になると body に "scroll-locked" クラスを付与する。
 */
export function acquireScrollLock(): void {
  if (typeof window === "undefined") return;
  const next = getCount() + 1;
  setCount(next);
  if (next === 1) {
    document.body.classList.add("scroll-locked");
  }
}

/**
 * スクロールロックを解放する。
 * 呼び出すたびに参照カウントを -1 する（0 を下限とする）。
 * カウントが 1→0 になると body から "scroll-locked" クラスを除去する。
 */
export function releaseScrollLock(): void {
  if (typeof window === "undefined") return;
  const current = getCount();
  if (current <= 0) return; // 0 以下にはしない
  const next = current - 1;
  setCount(next);
  if (next === 0) {
    document.body.classList.remove("scroll-locked");
  }
}
