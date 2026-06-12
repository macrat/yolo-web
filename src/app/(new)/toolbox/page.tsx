import type { Metadata } from "next";
import ToolboxContent from "./ToolboxContent";

/**
 * /toolbox — 道具箱プレビュー（noindex）
 *
 * cycle-226 T-2: 生きたタイルを並べる本物の道具箱の noindex プレビュー。
 *
 * ## 設計原則
 *
 * - **noindex**: 来訪者への公開対象外のプレビュー。タイルの追加・削除と構成の
 *   localStorage 保存は cycle-230 で実装済み。DnD 並べ替え/正式公開は後続サイクル。
 * - **server page → client content**: タイルは "use client" のため、
 *   ToolboxContent に閉じ込めて server component を汚染しない（storybook と同じ作法）。
 * - **リンクカードではない**: タイルは詳細ページへの誘導ではなく、
 *   その場で機能が動く（入力・変換・コピーがタイル内で完結する）自己完結ユニット。
 */
export const metadata: Metadata = {
  title: "道具箱プレビュー | yolos.net",
  description: "タイルを並べる道具箱のプレビューページ。",
  robots: { index: false, follow: false },
};

export default function ToolboxPage() {
  return <ToolboxContent />;
}
