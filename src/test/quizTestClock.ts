import { vi } from "vitest";
import { MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS } from "@/play/quiz/quizProgress";

/**
 * QuizContainer の遷移間隔ガード（B-620）を扱うためのテスト用時計。
 *
 * QuizContainer は「**表示中の画面が変わってから**
 * MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS 未満で届いた回答」を受け付けない。
 * これは二重タップの 2 回目（別 task で届くため冪等化では塞げない）が
 * 「見ていない次の設問への回答」として通ってしまうのを防ぐためのもの。
 * 画面が変わらない操作（knowledge の「回答→次へ」）は対象外である
 * ——2 回目が落ちる先が変わらないので守るものが無く、摩擦だけが残るため。
 *
 * jsdom のテストは click を実時間ほぼ 0ms 間隔で送るため、そのままでは
 * 設問が変わった直後の回答がすべて弾かれる。テストからは「来訪者が普通に
 * 時間をかけて答えた」ことを時計を進めて表現する。
 *
 * `vi.useFakeTimers()` ではなく `Date.now` の差し替えを使うのは、React の
 * scheduler が使う `performance.now` に触れずに済み、タイマー実行順の影響を
 * テストに持ち込まないため。
 */
export type QuizTestClock = {
  /** 遷移間隔ガードを確実に通過する量だけ進める。 */
  advancePastTransitionGuard: () => void;
  /** 任意のミリ秒だけ進める（ガード境界の検証用）。 */
  advance: (ms: number) => void;
  /** Date.now の差し替えを解除する。 */
  restore: () => void;
};

export function installQuizTestClock(): QuizTestClock {
  // 0 起点だと「まだ一度も遷移していない」との区別が付きにくいので十分大きい値から。
  let now = 1_000_000;
  const spy = vi.spyOn(Date, "now").mockImplementation(() => now);
  return {
    advancePastTransitionGuard() {
      now += MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS + 1;
    },
    advance(ms: number) {
      now += ms;
    },
    restore() {
      spy.mockRestore();
    },
  };
}
