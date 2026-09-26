import { getAllColors } from "@/dictionary/_lib/colors";
import {
  colorListCategories,
  colorListSorts,
} from "@/dictionary/_lib/color-list";
import {
  COLOR_CATEGORY_LABELS,
  type ColorEntry,
} from "@/dictionary/_lib/types";
import {
  sortBrowseItems,
  type BrowseItem,
  type BrowseSpec,
} from "@/lib/list-browse";

/**
 * 色の格子の絞り込みと並び順の選択肢。種別は色の系統で、並び順は伝統色の辞典の一覧と同じ、色み順と明るい順
 * （色見本の色を OKLCH にした値で比べる）。
 */
export const PALETTE_SPEC: BrowseSpec = {
  kinds: colorListCategories().map((category) => ({
    value: category,
    label: COLOR_CATEGORY_LABELS[category],
  })),
  filterGroups: [],
  sorts: colorListSorts({ type: "all" }),
};

/** 色の格子の1つ。絞り込みと並べ替えに使う値と、選んだときに配色を組む伝統色。 */
export interface PaletteItem extends BrowseItem {
  color: ColorEntry;
}

/** 全色を色の格子の項目にして、既定の並び順で返す。名前の絞り込みは、色名とローマ字に一致を見る。 */
export const PALETTE_ITEMS: PaletteItem[] = sortBrowseItems(
  getAllColors().map((color) => ({
    name: color.name,
    slug: color.slug,
    readings: [color.romaji],
    kind: COLOR_CATEGORY_LABELS[color.category],
    swatch: color.hex,
    color,
  })),
  PALETTE_SPEC.sorts[0],
);
