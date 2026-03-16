/** ユーモア辞書の1エントリを表すインターフェース */
export interface HumorDictionaryEntry {
  /** URL用の英語スラッグ (例: "monday") */
  slug: string;
  /** 見出し語 (例: "月曜日") */
  word: string;
  /** よみがな (例: "げつようび") */
  reading: string;
  /** ユーモア定義文 (50-150文字) */
  definition: string;
  /** 解説・背景 (150-350文字) */
  explanation: string;
  /** 用例 (50-150文字) */
  example: string;
  /** 関連語のスラッグ (2-3語) */
  relatedSlugs: string[];
}
