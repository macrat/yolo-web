/**
 * 結果ごとのおすすめのリンク（`QuizResult` の `recommendation`・`recommendationLink`）を、解き終えた画面のどこに
 * 置くか。
 *
 * - `aboutType`: その結果そのものをもっと知るリンク。辞典の項目のページ（伝統色の藍色・四字熟語の初志貫徹など）で、
 *   「このタイプについて」の読みもののすぐ後ろに置く。結果を読み終えた来訪者が、その結果の続きを同じ区画で見つける。
 * - `next`: ほかの遊びや、辞典の一覧への誘い。「次はこれを試してみよう」の「もう一度挑戦する」の下に置く。
 *
 * 分け方はリンクの行き先で決める。来訪者が押して着くページが、その結果の項目か、そうでないかだからである。
 * 辞典のページのうち、パスの区切りが3つ（`/dictionary/{辞典}/{項目}`）なのは項目のページだけで、一覧のページは
 * 2つ以下（`/dictionary`・`/dictionary/{辞典}`）か4つ以上（ページ送り・分類・学年・部首・画数）である。
 */
export type RecommendationPlacement = "aboutType" | "next";

export function recommendationPlacement(link: string): RecommendationPlacement {
  const segments = link.split(/[?#]/)[0].split("/").filter(Boolean);
  const isDictionaryItem =
    segments.length === 3 && segments[0] === "dictionary";
  return isDictionaryItem ? "aboutType" : "next";
}
