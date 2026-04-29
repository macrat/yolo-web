"use client";

import { useState, useCallback } from "react";
import type { YojiEntry } from "@/dictionary/_lib/types";
import {
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
} from "@/dictionary/_lib/types";
import DictionaryCard from "@/dictionary/_components/DictionaryCard";
import DictionaryGrid from "@/dictionary/_components/DictionaryGrid";
import SearchBox from "@/dictionary/_components/SearchBox";

interface YojiIndexClientProps {
  allYoji: YojiEntry[];
}

export default function YojiIndexClient({ allYoji }: YojiIndexClientProps) {
  const [filtered, setFiltered] = useState<YojiEntry[]>(allYoji);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFiltered(allYoji);
        return;
      }
      const q = query.trim().toLowerCase();
      setFiltered(
        allYoji.filter(
          (y) =>
            y.yoji.includes(q) ||
            y.reading.includes(q) ||
            y.meaning.includes(q),
        ),
      );
    },
    [allYoji],
  );

  return (
    <>
      <SearchBox
        placeholder="四字熟語・読み・意味で検索..."
        onSearch={handleSearch}
      />
      <DictionaryGrid wide>
        {filtered.map((y) => (
          <div key={y.yoji} role="listitem">
            <DictionaryCard
              type="yoji"
              yoji={y.yoji}
              reading={y.reading}
              meaning={y.meaning}
              category={YOJI_CATEGORY_LABELS[y.category]}
              difficultyLabel={YOJI_DIFFICULTY_LABELS[y.difficulty]}
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
          該当する四字熟語が見つかりませんでした。
        </p>
      )}
    </>
  );
}
