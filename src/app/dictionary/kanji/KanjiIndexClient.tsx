"use client";

import { useState, useCallback } from "react";
import type { KanjiEntry } from "@/dictionary/_lib/types";
import { KANJI_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import DictionaryCard from "@/dictionary/_components/DictionaryCard";
import DictionaryGrid from "@/dictionary/_components/DictionaryGrid";
import SearchBox from "@/dictionary/_components/SearchBox";

interface KanjiIndexClientProps {
  allKanji: KanjiEntry[];
}

export default function KanjiIndexClient({ allKanji }: KanjiIndexClientProps) {
  const [filtered, setFiltered] = useState<KanjiEntry[]>(allKanji);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFiltered(allKanji);
        return;
      }
      const q = query.trim().toLowerCase();
      setFiltered(
        allKanji.filter(
          (k) =>
            k.character.includes(q) ||
            k.onYomi.some((r) => r.includes(q)) ||
            k.kunYomi.some((r) => r.includes(q)) ||
            k.meanings.some((m) => m.toLowerCase().includes(q)) ||
            k.examples.some((e) => e.includes(q)),
        ),
      );
    },
    [allKanji],
  );

  return (
    <>
      <SearchBox
        placeholder={
          "\u6F22\u5B57\u30FB\u8AAD\u307F\u30FB\u610F\u5473\u3067\u691C\u7D22..."
        }
        onSearch={handleSearch}
      />
      <DictionaryGrid>
        {filtered.map((k) => (
          <div key={k.character} role="listitem">
            <DictionaryCard
              type="kanji"
              character={k.character}
              readings={[...k.onYomi, ...k.kunYomi]}
              meanings={k.meanings}
              category={KANJI_CATEGORY_LABELS[k.category]}
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
          {
            "\u8A72\u5F53\u3059\u308B\u6F22\u5B57\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002"
          }
        </p>
      )}
    </>
  );
}
