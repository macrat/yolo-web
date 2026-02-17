"use client";

import { useState, useCallback } from "react";
import type { ColorEntry } from "@/lib/dictionary/types";
import { COLOR_CATEGORY_LABELS } from "@/lib/dictionary/types";
import ColorCard from "@/components/dictionary/color/ColorCard";
import DictionaryGrid from "@/components/dictionary/DictionaryGrid";
import SearchBox from "@/components/dictionary/SearchBox";

interface ColorsIndexClientProps {
  allColors: ColorEntry[];
}

export default function ColorsIndexClient({
  allColors,
}: ColorsIndexClientProps) {
  const [filtered, setFiltered] = useState<ColorEntry[]>(allColors);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFiltered(allColors);
        return;
      }
      const q = query.trim().toLowerCase();
      setFiltered(
        allColors.filter(
          (c) =>
            c.name.includes(q) ||
            c.romaji.toLowerCase().includes(q) ||
            c.hex.toLowerCase().includes(q),
        ),
      );
    },
    [allColors],
  );

  return (
    <>
      <SearchBox
        placeholder="色名・ローマ字・カラーコードで検索..."
        onSearch={handleSearch}
      />
      <DictionaryGrid wide>
        {filtered.map((c) => (
          <div key={c.slug} role="listitem">
            <ColorCard
              slug={c.slug}
              name={c.name}
              romaji={c.romaji}
              hex={c.hex}
              categoryLabel={COLOR_CATEGORY_LABELS[c.category]}
            />
          </div>
        ))}
      </DictionaryGrid>
      {filtered.length === 0 && (
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-muted)",
            marginTop: "2rem",
          }}
        >
          該当する色が見つかりませんでした。
        </p>
      )}
    </>
  );
}
