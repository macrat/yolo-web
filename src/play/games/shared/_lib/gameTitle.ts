import type { RefObject } from "react";

/** ゲームのページの h1 の id。GameLayout が h1 に付ける。 */
export const GAME_TITLE_ID = "game-title";

/**
 * ゲームのページの h1 を指す ref。ゲームの部品が、自分で開いたダイアログを閉じたときのフォーカスの戻り先に
 * 使う。h1 はサーバーの GameLayout が描くので、ゲームの部品の外にある。
 */
export const gameTitleRef: RefObject<HTMLElement | null> = {
  get current() {
    return typeof document === "undefined"
      ? null
      : document.getElementById(GAME_TITLE_ID);
  },
};
