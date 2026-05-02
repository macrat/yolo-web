"use client";

/**
 * ToolboxContent — /toolbox-preview ページのクライアントサイド UI。
 *
 * 責務:
 * - useToolboxConfig フック（2.2.8）でタイルレイアウトを取得する
 * - ToolboxShell でモード制御 + TileGrid でタイル配置 UI を提供する
 * - dnd-kit の hydration mismatch を防ぐため、dynamic({ ssr: false }) 経由で
 *   親 page.tsx から読み込むこと（docs/knowledge/dnd-kit.md 参照）
 *
 * SSR 挙動:
 * - このコンポーネントは dynamic({ ssr: false }) 経由で読み込まれるため、
 *   SSR では描画されない（BAILOUT_TO_CLIENT_SIDE_RENDERING）。
 * - dnd-kit の aria-describedby カウンタ不一致による hydration mismatch を
 *   根本解決するために ssr: false が必須（docs/knowledge/dnd-kit.md 参照）。
 * - 環境変数ガード（層 3）は page.tsx の Server Component 側で行うため、
 *   本コンポーネントは環境変数を参照しない
 */

import { useCallback } from "react";
import ToolboxShell from "@/components/ToolboxShell";
import TileGrid, { type TileGridConfig } from "@/components/TileGrid";
import { useToolboxConfig } from "@/lib/toolbox/useToolboxConfig";
import { ALL_FIXTURES } from "@/components/Tile/fixtures";
import type { Tileable } from "@/lib/toolbox/types";
import type { TileLayoutEntry } from "@/lib/toolbox/storage";

/**
 * フィクスチャ全件から tileableMap を構築する（ページローカルの定数）。
 * toolbox-preview は実タイルが未実装のため、フィクスチャで検証する。
 * Phase 7 でタイル化が進んだ後は getAllTileables() から構築するよう置き換える。
 */
const FIXTURE_TILEABLE_MAP = new Map<string, Tileable>(
  ALL_FIXTURES.map((f) => [f.tileable.slug, f.tileable]),
);

/**
 * tiles 配列と tileableMap から TileGridConfig を生成するヘルパー。
 * useToolboxConfig が返す tiles を TileGrid が受け取れる形式に変換する。
 */
function buildConfig(tiles: TileLayoutEntry[]): TileGridConfig {
  return {
    tiles,
    tileableMap: FIXTURE_TILEABLE_MAP,
  };
}

/**
 * ToolboxContent — 道具箱プレビュー UI。
 *
 * useToolboxConfig で localStorage からレイアウトを取得し、
 * ToolboxShell + TileGrid で道具箱の編集 / 使用体験を提供する。
 */
export default function ToolboxContent() {
  const { tiles, setTiles } = useToolboxConfig();

  const config = buildConfig(tiles);

  const handleConfigChange = useCallback(
    (newConfig: TileGridConfig) => {
      setTiles(newConfig.tiles);
    },
    [setTiles],
  );

  return (
    <ToolboxShell>
      {({ mode, setDndHandlers }) => (
        <TileGrid
          config={config}
          mode={mode}
          onConfigChange={handleConfigChange}
          setDndHandlers={setDndHandlers}
        />
      )}
    </ToolboxShell>
  );
}
