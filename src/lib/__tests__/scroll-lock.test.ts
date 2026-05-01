/**
 * scroll-lock.ts のユニットテスト
 *
 * 参照カウンタ方式の scroll lock ヘルパ。
 * - count が 0→1 で body に scroll-locked クラスを付与
 * - count が 1→0 で body から scroll-locked クラスを除去
 * - 複数呼び出し元が同居しても最後の release まで locked を維持
 */

import { expect, test, describe, beforeEach } from "vitest";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";

describe("scroll-lock", () => {
  beforeEach(() => {
    // body のクラスと dataset をリセット
    document.body.className = "";
    delete document.body.dataset["scrollLockCount"];
  });

  test("acquireScrollLock を 1 回呼ぶと body に scroll-locked クラスが付く", () => {
    acquireScrollLock();
    expect(document.body.classList.contains("scroll-locked")).toBe(true);
  });

  test("releaseScrollLock を呼ぶとクラスが除去される（1:1 の場合）", () => {
    acquireScrollLock();
    releaseScrollLock();
    expect(document.body.classList.contains("scroll-locked")).toBe(false);
  });

  test("acquire × 2 → release × 1 ではまだ locked のまま", () => {
    acquireScrollLock();
    acquireScrollLock();
    releaseScrollLock();
    expect(document.body.classList.contains("scroll-locked")).toBe(true);
  });

  test("acquire × 2 → release × 2 でクラスが除去される", () => {
    acquireScrollLock();
    acquireScrollLock();
    releaseScrollLock();
    releaseScrollLock();
    expect(document.body.classList.contains("scroll-locked")).toBe(false);
  });

  test("count が 0 のときに releaseScrollLock を呼んでも負にならない（0 を下限として維持）", () => {
    releaseScrollLock(); // count=0 の状態で release
    releaseScrollLock(); // 2 回目
    acquireScrollLock(); // 1 回 acquire
    // 負にならないので count=1 → locked
    expect(document.body.classList.contains("scroll-locked")).toBe(true);
    releaseScrollLock();
    expect(document.body.classList.contains("scroll-locked")).toBe(false);
  });

  test("dataset.scrollLockCount がカウンタを正確に追跡する", () => {
    acquireScrollLock();
    expect(document.body.dataset["scrollLockCount"]).toBe("1");
    acquireScrollLock();
    expect(document.body.dataset["scrollLockCount"]).toBe("2");
    releaseScrollLock();
    expect(document.body.dataset["scrollLockCount"]).toBe("1");
    releaseScrollLock();
    expect(document.body.dataset["scrollLockCount"]).toBe("0");
  });
});
