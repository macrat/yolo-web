"use client";

/**
 * TileStorybookGridClient — クライアント専用 Tile グリッド表示コンポーネント。
 *
 * このコンポーネントは StorybookContent から dynamic({ ssr: false }) で読み込む。
 *
 * ## なぜ ssr: false が必要か
 * @dnd-kit/utilities の useUniqueId はモジュールスコープのカウンタで ID を採番する。
 * SSR と CSR でカウンタ初期値が異なるため、aria-describedby 属性が不一致になり
 * hydration mismatch が発生する（dnd-kit 既知の SSR 問題）。
 *
 * 対応: dynamic import + ssr: false でクライアント mount 後にのみ render することで
 * SSR のレンダリングをスキップし、hydration mismatch を根本解消する。
 *
 * 参照: docs/knowledge/dnd-kit.md
 */

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import Tile from "@/components/Tile";
import EmptySlot from "@/components/Tile/EmptySlot";
import {
  FIXTURE_SMALL_1,
  FIXTURE_SMALL_2,
  FIXTURE_MEDIUM_1,
  FIXTURE_MEDIUM_2,
  FIXTURE_LARGE_1,
} from "@/components/Tile/fixtures";
import tileStyles from "./TileStorybook.module.css";

interface TileStorybookGridClientProps {
  mode: "view" | "edit";
}

/**
 * Tile の storybook グリッド表示用コンポーネント（クライアント専用）。
 * useSortable（Tile 内部）を正常動作させるために DndContext + SortableContext をラップ。
 * storybook はデモ用途なので実際の並べ替えは行わない（onDragEnd は no-op）。
 */
export default function TileStorybookGridClient({
  mode,
}: TileStorybookGridClientProps) {
  const fixtures = [
    FIXTURE_SMALL_1,
    FIXTURE_MEDIUM_1,
    FIXTURE_SMALL_2,
    FIXTURE_MEDIUM_2,
    FIXTURE_LARGE_1,
  ];
  const slugs = fixtures.map((f) => f.tileable.slug);

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={() => {}}>
        <SortableContext items={slugs} strategy={rectSortingStrategy}>
          <div className={tileStyles.grid}>
            {fixtures.map((fixture) => (
              <Tile
                key={`${mode}-${fixture.tileable.slug}`}
                tileable={fixture.tileable}
                size={fixture.recommendedSize}
                mode={mode}
                onDelete={mode === "edit" ? () => {} : undefined}
                onContentClick={mode === "view" ? () => {} : undefined}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {mode === "edit" && (
        <>
          <h3
            style={{
              marginTop: "1.5rem",
              marginBottom: "0.75rem",
              fontSize: "0.95rem",
              color: "var(--fg)",
            }}
          >
            EmptySlot（追加スロット）
          </h3>
          <div className={tileStyles.grid}>
            <EmptySlot size="small" index={0} />
            <EmptySlot size="medium" index={1} />
            <EmptySlot size="large" index={2} />
          </div>
        </>
      )}
    </>
  );
}
