/**
 * click の**発生源**を書き分けるテスト用ヘルパー（B-620）。
 *
 * QuizContainer の遷移間隔ガードは「1 つのジェスチャの 2 打目が、画面の入れ替わり
 * で別の要素に落ちる」ことだけを守っており、**ポインタ由来の click にしか当てない**
 * （`activationOriginOfClick`）。したがってテストは「指やマウスで押した」のか
 * 「キーボード / 支援技術で起動した」のかを区別して書かなければ、守っている当の
 * 経路も、守ってはいけない経路も検証できない。
 *
 * `HTMLElement.click()` は仕様上**キーボード等と同じ合成 click**（detail = 0）で
 * あり、指でのタップの代わりにはならない。jsdom もこの仕様どおりに実装している
 * （`click()` → PointerEvent / `detail: 0` / `pointerType: ""`）ので、
 * ポインタ入力は `detail` を 1 以上にした click を自分で dispatch して表現する。
 */

/**
 * 指やマウスで押したときの click（座標のヒットテストを経て届く入力）。
 *
 * `detail` は click 回数で、ポインタ由来なら 1 以上になる。同じジェスチャの
 * 2 打目を表したいときは `clickCount` に 2 を渡してもよいが、判定に使うのは
 * 「0 かどうか」だけなので既定の 1 で足りる。
 */
export function clickAsPointer(element: HTMLElement, clickCount = 1): void {
  element.dispatchEvent(
    new PointerEvent("click", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: clickCount,
      pointerType: "touch",
    }),
  );
}

/**
 * キーボード（Enter / Space）・支援技術の起動・プログラム的な起動による click。
 *
 * HTML の "fire a synthetic pointer event" は `detail` を初期化しないので、
 * これらの click の `detail` は 0 になる。`HTMLElement.click()` がまさにこの形。
 */
export function clickAsKeyboard(element: HTMLElement): void {
  element.click();
}
