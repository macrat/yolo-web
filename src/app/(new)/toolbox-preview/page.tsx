/**
 * /toolbox-preview — hidden 検証ルート（3 層防御）
 *
 * 新コンセプト「日常の傍にある道具」のコア機能（道具箱）を来訪者向け公開なしに
 * 動作確認するための隠し検証ページ。cycle-175 2.2.9 が担当。
 *
 * 3 層防御:
 * - 層 1: metadata.robots = { index: false, follow: false }（本ファイル）
 * - 層 2: src/app/robots.ts の disallow に /toolbox-preview を追加済み
 * - 層 3: NEXT_PUBLIC_TOOLBOX_PREVIEW !== "true" のとき notFound()（dev/prod 共通）
 *         NODE_ENV 条件を設けない理由: dev でも環境変数なしで 404 にすることで
 *         誤公開リスクを排除し、dev/prod 挙動を一貫させる。
 *         dev で確認したい場合は .env.local に NEXT_PUBLIC_TOOLBOX_PREVIEW=true を設定する。
 *
 * 運用方針:
 * - Vercel Preview Deploy では NEXT_PUBLIC_TOOLBOX_PREVIEW=true を設定して有効化
 * - Production Deploy では環境変数を設定しないことで 404 にする
 * - Phase 9.2（B-336）で /toolbox-preview の実装を / 配下に統合し、本ページを廃棄する
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolboxContent from "./ToolboxContent";

// 層 1: noindex 指定（検索エンジンにインデックスさせない）
export const metadata: Metadata = {
  title: "道具箱プレビュー（開発者向け） | yolos.net",
  description:
    "新コンセプト「日常の傍にある道具」の道具箱機能検証ページ。来訪者公開前の hidden 検証環境。",
  robots: { index: false, follow: false },
};

export default function ToolboxPreviewPage() {
  // 層 3: 環境変数ガード（dev/prod 共通）
  // NEXT_PUBLIC_TOOLBOX_PREVIEW=true が設定されていない場合は 404 を返す。
  // dev 環境でも同じ条件を適用することで誤公開リスクを排除し、挙動を一貫させる。
  // dev で確認したい場合は .env.local に NEXT_PUBLIC_TOOLBOX_PREVIEW=true を設定する。
  // Vercel Preview Deploy では NEXT_PUBLIC_TOOLBOX_PREVIEW=true を設定すること。
  if (process.env.NEXT_PUBLIC_TOOLBOX_PREVIEW !== "true") {
    notFound();
  }

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
