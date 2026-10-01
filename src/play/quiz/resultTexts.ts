/**
 * 診断・クイズの結果を人に渡すときに、診断ごとに決まった文。結果のページ（`/play/{slug}/result/{id}`）が使う。
 */

interface ResultTexts {
  /**
   * 共有の文の終わりに付けるハッシュタグの語（「#」を除く）。受け取った人が同じ診断の投稿を探せる1語にし、
   * 空白・ダッシュ・疑問符のようにハッシュタグをそこで切る字を含めない。
   */
  hashtag: string;
  /** 結果のページの、この診断を遊ぶ誘いの文。ページの頭のボタンと、読みもののあとのリンクが言う。 */
  ctaText: string;
}

const TEXTS_BY_SLUG: Readonly<Record<string, ResultTexts>> = {
  "kanji-level": { hashtag: "漢字力診断", ctaText: "あなたも挑戦してみよう" },
  "kotowaza-level": {
    hashtag: "ことわざ・慣用句力診断",
    ctaText: "あなたも挑戦してみよう",
  },
  "yoji-level": {
    hashtag: "四字熟語力診断",
    ctaText: "あなたも挑戦してみよう",
  },
  "traditional-color": {
    hashtag: "伝統色診断",
    ctaText: "あなたはどの伝統色? 診断してみよう",
  },
  "yoji-personality": {
    hashtag: "四字熟語診断",
    ctaText: "あなたはどの四字熟語? 診断してみよう",
  },
  "impossible-advice": {
    hashtag: "達成困難アドバイス診断",
    ctaText: "あなたも診断してみよう",
  },
  "contrarian-fortune": {
    hashtag: "逆張り運勢診断",
    ctaText: "あなたも診断してみよう",
  },
  "unexpected-compatibility": {
    hashtag: "斜め上の相性診断",
    ctaText: "あなたの相性を診断してみよう",
  },
  "music-personality": {
    hashtag: "音楽性格診断",
    ctaText: "あなたはどのタイプ? 診断してみよう",
  },
  "character-fortune": {
    hashtag: "あなたの守護キャラ診断",
    ctaText: "あなたはどのタイプ? 診断してみよう",
  },
  "animal-personality": {
    hashtag: "日本にしかいない動物で性格診断",
    ctaText: "あなたはどのタイプ? 診断してみよう",
  },
  "science-thinking": {
    hashtag: "理系思考タイプ診断",
    ctaText: "あなたはどのタイプ? 診断してみよう",
  },
  "japanese-culture": {
    hashtag: "あなたが極めるべき日本文化診断",
    ctaText: "あなたはどのタイプ? 診断してみよう",
  },
  "character-personality": {
    hashtag: "あなたに似たキャラ診断",
    ctaText: "あなたはどのタイプ? 診断してみよう",
  },
  "word-sense-personality": {
    hashtag: "あなたの言葉センス診断",
    ctaText: "あなたはどのタイプ? 診断してみよう",
  },
};

/** 診断の slug から、その診断の結果を渡すときの文を引く。 */
export function resultTexts(slug: string): ResultTexts {
  const texts = TEXTS_BY_SLUG[slug];
  if (!texts) throw new Error(`結果の文を持たない診断: ${slug}`);
  return texts;
}
