/**
 * 答えを送ったときの結果。入力の誤りと、答え合わせができなかったことを分ける。
 *
 * - "invalid": 入力が誤り。何が問題でどう直すかを、欄のエラーとして欄に結ぶ（§8）。
 * - "unavailable": 通信やサーバーの失敗で答え合わせができなかった。入力は正しいので欄を誤りと示さず、
 *   欄の外で、何が起きたかとどうすればよいかを言う。
 */
export type GuessSubmitResult =
  | { kind: "accepted" }
  | { kind: "invalid"; message: string }
  | { kind: "unavailable" };

/** 答え合わせができなかったときに、欄の外に出す文。 */
export const EVALUATE_UNAVAILABLE_MESSAGE =
  "答え合わせができませんでした。時間をおいて、もう一度送ってください";
