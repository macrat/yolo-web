import { getAllEntries } from "./data";

/** ユーモア辞書全体のメタ情報 */
export interface HumorDictMeta {
  /** サイトマップ・OGP等で使用するコンテンツ初回公開日時 (ISO 8601, JST) */
  publishedAt: string;
  /** コンテンツ更新日時 (ISO 8601, JST)。更新時に変更する */
  updatedAt: string;
  /** 辞書の日本語タイトル */
  title: string;
  /** 辞書の説明文 */
  description: string;
}

/**
 * ユーモア辞書のメタ情報。
 * サイトマップ生成、OGPメタデータ生成などで参照する。
 */
export const humorDictMeta: HumorDictMeta = {
  publishedAt: "2026-03-16T00:00:00+09:00",
  updatedAt: "2026-03-16T00:00:00+09:00",
  title: "ユーモア辞典",
  description: `身近な言葉${getAllEntries().length}語を、AIがまじめな顔で定義し直したユーモア辞典。本当の意味ではありません。`,
};
