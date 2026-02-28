/** コンテンツの信頼レベル */
export type TrustLevel = "verified" | "curated" | "generated";

/** 各信頼レベルの表示用メタデータ */
interface TrustLevelMetaEntry {
  /** 訪問者向け名称 */
  label: string;
  /** 訪問者向け説明文 */
  description: string;
  /** 表示用アイコン文字 */
  icon: string;
}

/** 各信頼レベルの表示用メタデータ定数 */
export const TRUST_LEVEL_META: Record<TrustLevel, TrustLevelMetaEntry> = {
  verified: {
    label: "正確な処理",
    description:
      "このコンテンツは標準的なアルゴリズムに基づいて処理しています。実装上のバグがない限り、正確な結果が得られます。",
    icon: "\u2713", // チェックマーク文字
  },
  curated: {
    label: "AI作成データ",
    description:
      "このコンテンツのデータはAIが公式資料や辞書を参照して作成しました。正確さを心がけていますが、誤りが含まれる可能性があります。",
    icon: "\uD83D\uDCD6", // 📖
  },
  generated: {
    label: "AI生成テキスト",
    description:
      "このコンテンツはAIが生成した文章です。参考情報としてお読みください。正確でない情報が含まれる場合があります。",
    icon: "\uD83E\uDD16", // 🤖
  },
};

/** 静的ページの信頼レベル設定マップ */
export const STATIC_PAGE_TRUST_LEVELS: Record<string, TrustLevel> = {
  "/": "generated",
  "/about": "generated",
};

/** 辞典セクションの信頼レベル設定マップ */
export const DICTIONARY_TRUST_LEVELS: Record<string, TrustLevel> = {
  "/dictionary/kanji": "curated",
  "/dictionary/yoji": "curated",
  "/dictionary/colors": "curated",
};

/** メモアーカイブの信頼レベル */
export const MEMO_TRUST_LEVEL: TrustLevel = "generated";

/** メモアーカイブの補足注記テキスト */
export const MEMO_TRUST_NOTE =
  "このセクションはAIエージェント間のやりとりの記録です。意思決定の透明性のための公開であり、内容の正確性は保証されません。";
