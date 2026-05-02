"use client";

/**
 * TileGridStorybookClient — クライアント専用 TileGrid storybook 表示コンポーネント。
 *
 * StorybookContent から dynamic({ ssr: false }) で読み込む。
 * dnd-kit の SSR hydration mismatch を回避するためクライアント mount 限定にする。
 * 参照: docs/knowledge/dnd-kit.md
 *
 * 2.2.6 完了判定用の DnD インタラクティブデモ:
 * - small × 2、medium × 2、large × 1 の混合 5 タイル（FIXTURE_5_TILES）
 * - ToolboxShell でモード切替 → TileGrid で DnD 並び替え・削除・追加を実際に操作できる
 */

import { useState } from "react";
import ToolboxShell from "@/components/ToolboxShell";
import TileGrid, { type TileGridConfig } from "@/components/TileGrid";
import { FIXTURE_5_TILES, ALL_FIXTURES } from "@/components/Tile/fixtures";
import type { Tileable } from "@/lib/toolbox/types";
import type { TileSize } from "@/components/Tile/types";

/**
 * フィクスチャから初期 TileGridConfig を構築する。
 */
function buildInitialConfig(): TileGridConfig {
  const tiles = FIXTURE_5_TILES.map((f, i) => ({
    slug: f.tileable.slug,
    size: f.recommendedSize,
    order: i,
  }));

  const tileableMap = new Map<string, Tileable>(
    ALL_FIXTURES.map((f) => [f.tileable.slug, f.tileable]),
  );

  return { tiles, tileableMap };
}

/**
 * フィクスチャから AddTileModal に渡す追加候補を構築する小ヘルパ。
 * TileGrid は registry と fixtures の両方から候補を自動取得するが、
 * storybook では本番の registry（実タイル 0 件）+ ALL_FIXTURES が候補になる。
 */
export default function TileGridStorybookClient() {
  const [config, setConfig] = useState<TileGridConfig>(buildInitialConfig);

  const handleConfigChange = (newConfig: TileGridConfig) => {
    setConfig(newConfig);
  };

  return (
    <div style={{ padding: "0.5rem 0" }}>
      {/* 現在の tiles 配列をデバッグ表示（開発確認用） */}
      <details
        style={{
          marginBottom: "1rem",
          fontSize: "0.75rem",
          color: "var(--fg-soft)",
        }}
      >
        <summary style={{ cursor: "pointer", userSelect: "none" }}>
          現在の配置（{config.tiles.length} 個） — デバッグ用
        </summary>
        <pre
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem",
            background: "var(--bg-soft)",
            borderRadius: "var(--r-normal)",
            overflowX: "auto",
            fontSize: "0.7rem",
          }}
        >
          {JSON.stringify(
            config.tiles.map((t) => ({
              slug: t.slug,
              size: t.size,
              order: t.order,
            })),
            null,
            2,
          )}
        </pre>
      </details>

      <ToolboxShell>
        {({ mode, setDndHandlers, openOverlayId, setOpenOverlay }) => (
          <TileGrid
            config={config}
            mode={mode}
            onConfigChange={handleConfigChange}
            setDndHandlers={setDndHandlers}
            openOverlayId={openOverlayId}
            setOpenOverlay={setOpenOverlay}
          />
        )}
      </ToolboxShell>
    </div>
  );
}

/**
 * 50 個タイルを使ったパフォーマンステスト用コンポーネント。
 * storybook の "50 個ケース" セクションで使用する。
 */
export function TileGrid50Client() {
  const [config, setConfig] = useState<TileGridConfig>(() => {
    // ALL_FIXTURES（7 種）を繰り返して 50 個分の tiles を生成
    const sizes: TileSize[] = ["small", "medium", "large", "small", "medium"];
    const tiles = Array.from({ length: 50 }, (_, i) => ({
      slug: `perf-tile-${i}`,
      size: sizes[i % sizes.length],
      order: i,
    }));

    // tileableMap に perf-tile-* の Tileable を登録（ALL_FIXTURES から循環コピー）
    const baseFixtures = ALL_FIXTURES;
    const tileableMap = new Map<string, Tileable>(
      tiles.map((t, i) => [
        t.slug,
        {
          ...baseFixtures[i % baseFixtures.length].tileable,
          slug: t.slug,
          displayName: `パフォーマンステスト ${i + 1}`,
        },
      ]),
    );

    return { tiles, tileableMap };
  });

  return (
    <div data-testid="tile-grid-50" style={{ padding: "0.5rem 0" }}>
      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--fg-soft)",
          marginBottom: "0.75rem",
        }}
      >
        50
        個のタイルでパフォーマンスを確認。「編集」ボタンからドラッグ並び替えを試してください。
      </p>
      <ToolboxShell>
        {({ mode, setDndHandlers, openOverlayId, setOpenOverlay }) => (
          <TileGrid
            config={config}
            mode={mode}
            onConfigChange={setConfig}
            setDndHandlers={setDndHandlers}
            openOverlayId={openOverlayId}
            setOpenOverlay={setOpenOverlay}
          />
        )}
      </ToolboxShell>
    </div>
  );
}
