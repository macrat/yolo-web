/**
 * /toolbox-preview — hidden 検証ルート
 *
 * 新コンセプト「日常の傍にある道具」のコア機能（道具箱）を来訪者向け公開なしに
 * 動作確認するための隠し検証ページ。cycle-175 2.2.9 が担当。
 *
 * 防御方針（/storybook と同じ運用）:
 * - noindex meta（本ファイル）: 検索エンジンにインデックスさせない
 * - robots.txt には掲載しない: disallow に書くと URL が公開ファイルに漏れるため
 * - sitemap に不掲載
 * - サイトナビ動線なし: どのページからもリンクされない
 *
 * 環境変数ガードを設けない理由:
 * noindex + サイトナビ動線なしで来訪者の到達経路が存在しないため、
 * 追加のアクセス制御は過剰防衛になる。
 *
 * 運用方針:
 * - Phase 9.2（B-336）で /toolbox-preview の実装を / 配下に統合し、本ページを廃棄する
 */

import type { Metadata } from "next";
import ToolboxContent from "./ToolboxContent";

// 層 1: noindex 指定（検索エンジンにインデックスさせない）
export const metadata: Metadata = {
  title: "道具箱プレビュー（開発者向け） | yolos.net",
  description:
    "新コンセプト「日常の傍にある道具」の道具箱機能検証ページ。来訪者公開前の hidden 検証環境。",
  robots: { index: false, follow: false },
};

export default function ToolboxPreviewPage() {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          color: "var(--fg)",
        }}
      >
        道具箱プレビュー
      </h1>
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--fg-soft)",
          marginBottom: "2rem",
        }}
      >
        このページは開発検証用の hidden
        ルートです。来訪者向けには公開されていません。
        「編集」ボタンでタイルの並び替え・追加・削除が行えます。
      </p>
      {/* ToolboxContent は "use client" コンポーネント。
          dnd-kit 由来の hydration mismatch を防ぐため dynamic ssr:false で読み込む */}
      <ToolboxContent />
    </div>
  );
}
