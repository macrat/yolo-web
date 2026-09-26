"use client";

/**
 * TraditionalColorPaletteTile — 伝統色のカラーパレットのタイル。ルートが <Panel>（DESIGN.md §5 のボックス）で
 * 自己完結する。
 *
 * 件数の行・名前の欄・畳める色の系統と並び順の組・色の格子・配色パターンのラジオボタンの組・配色の結果を
 * 縦に並べる。色の格子の絞り込みと並び順は palette-list.ts の選択肢で、URL のクエリに持つ（§7「件数と備え」）。
 * 配色の計算は logic.ts の computeHarmony・getAchromaticPalette が持つ。
 *
 * - 色の格子は1つを選ぶラジオボタンの組で、色見本そのものが選択肢になる（§6）。色見本は字を載せず（§2）、
 *   読み上げの名前に色の名前とカラーコードを持つ。
 * - 選んだ色の名前とカラーコードは、選んだ見本の行のすぐ下に開く（§8）。
 * - 選んだ色の配色は、見えない role="status" の文でも読み上げに伝える。
 */

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import Panel from "@/components/Panel";
import ListStack from "@/components/ListStack";
import Button from "@/components/Button";
import RadioGroup from "@/components/RadioGroup";
import ListControls from "@/components/ListControls";
import ListStatus from "@/components/ListStatus";
import { useListBrowseState } from "@/components/hooks/useListBrowseState";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import { getAllColors } from "@/dictionary/_lib/colors";
import type { ColorEntry } from "@/dictionary/_lib/types";
import {
  computeHarmony,
  isAchromatic,
  getAchromaticPalette,
  HARMONY_TYPE_INFO,
} from "./logic";
import type { HarmonyType } from "./logic";
import { PALETTE_ITEMS, PALETTE_SPEC } from "./palette-list";
import styles from "./TraditionalColorPaletteTile.module.css";

/** 配色パターンのラジオボタンの組に渡す選択肢 */
const HARMONY_RADIO_OPTIONS = HARMONY_TYPE_INFO.map((info) => ({
  label: info.label,
  value: info.type,
}));

/** RGB タプルを "rgb(R, G, B)" 文字列に変換 */
function formatRgb(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/** HSL タプルを "hsl(H, S%, L%)" 文字列に変換 */
function formatHsl(hsl: [number, number, number]): string {
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}

/** 全色データ（モジュールレベルでキャッシュ） */
const allColors = getAllColors();

export interface TraditionalColorPaletteTileProps {
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

/** 選んだ色の見本・名前・読み・カラーコード。 */
function PickedColor({ color }: { color: ColorEntry }) {
  return (
    <>
      <span
        className={styles.pickedSwatch}
        style={{ backgroundColor: color.hex }}
      />
      <span className={styles.pickedText}>
        <span className={styles.pickedLabel}>選んだ色</span>
        <span className={styles.pickedName}>{color.name}</span>
        <span className={styles.pickedRomaji}>{color.romaji}</span>
        <span className={styles.pickedHex}>{color.hex}</span>
      </span>
    </>
  );
}

/** 格子の列の数。格子の幅と列の最小幅からブラウザが決めた数を読む。 */
function readColumnCount(grid: HTMLElement): number {
  return getComputedStyle(grid).gridTemplateColumns.split(" ").length;
}

export default function TraditionalColorPaletteTile({
  as = "section",
  className,
}: TraditionalColorPaletteTileProps = {}) {
  // ---------- State ----------
  const [selectedColor, setSelectedColor] = useState<ColorEntry | null>(null);
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("complementary");
  const {
    state,
    slice,
    announcement,
    clear,
    filtering,
    matched,
    searchRef,
    setKind,
    setQuery,
    setSort,
    statusRef,
  } = useListBrowseState({
    items: PALETTE_ITEMS,
    spec: PALETTE_SPEC,
    unit: "色",
  });

  // 色コードのコピー。どのカードのどのコードをコピーしたかを "slug-codeType" の鍵で見分ける。
  const { copy, copiedKey } = useCopyToClipboard();

  // 有彩色の配色計算
  const harmonyResult = useMemo(() => {
    if (!selectedColor || isAchromatic(selectedColor)) {
      return null;
    }
    return computeHarmony(selectedColor, harmonyType, allColors);
  }, [selectedColor, harmonyType]);

  // 無彩色パレット計算
  const achromaticPalette = useMemo(() => {
    if (!selectedColor || !isAchromatic(selectedColor)) {
      return null;
    }
    return getAchromaticPalette(selectedColor, allColors);
  }, [selectedColor]);

  const radioName = useId();
  const hasItems = slice.items.length > 0;
  const gridRef = useRef<HTMLDivElement>(null);
  const pickedRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(0);

  // 選んだ色は見本の行のすぐ下に開くので、1行に並ぶ見本の数を幅の変化に合わせて読む。
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const update = () => setColumns(readColumnCount(grid));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [hasItems]);

  // 押した見本の画面の中の位置。選んだ色の欄が開き直って見本の行が上下に動いても、押した見本を同じ位置に保つ。
  const anchorRef = useRef<{ slug: string; top: number } | null>(null);

  const handleColorSelect = useCallback(
    (color: ColorEntry, event: ChangeEvent<HTMLInputElement>) => {
      const swatch = event.currentTarget.closest("label");
      anchorRef.current = swatch
        ? { slug: color.slug, top: swatch.getBoundingClientRect().top }
        : null;
      setSelectedColor(color);
    },
    [],
  );

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    anchorRef.current = null;
    const swatch = gridRef.current
      ?.querySelector(`[data-swatch-slug="${anchor?.slug}"]`)
      ?.closest("label");
    if (!anchor || !swatch) return;
    window.scrollBy(0, swatch.getBoundingClientRect().top - anchor.top);
    // 選んだ色の欄が画面の下にはみ出すなら、押した見本が画面の上から出ない範囲で送って見せる。
    const picked = pickedRef.current;
    if (!picked) return;
    const overflow = picked.getBoundingClientRect().bottom - window.innerHeight;
    const room = swatch.getBoundingClientRect().top;
    if (overflow > 0) window.scrollBy(0, Math.min(overflow, room));
  }, [selectedColor]);

  const selectedIndex = selectedColor
    ? slice.items.findIndex(({ color }) => color.slug === selectedColor.slug)
    : -1;

  // 選んだ色の配色を読み上げに伝える文。
  const liveSummary = useMemo(() => {
    if (!selectedColor) return "";
    if (isAchromatic(selectedColor)) {
      return `${selectedColor.name}を選択しました（無彩色パレット表示中）`;
    }
    const currentInfo = HARMONY_TYPE_INFO.find((i) => i.type === harmonyType);
    const count = harmonyResult?.colors.length ?? 0;
    return `${selectedColor.name}の${currentInfo?.label ?? ""}配色 ${count}色`;
  }, [selectedColor, harmonyType, harmonyResult]);

  // 現在の配色パターンの説明
  const currentHarmonyInfo = HARMONY_TYPE_INFO.find(
    (info) => info.type === harmonyType,
  );

  /** 単一パレットカードのレンダリング */
  const renderColorCard = (color: ColorEntry, index: number) => {
    const hexValue = color.hex;
    const rgbValue = formatRgb(color.rgb);
    const hslValue = formatHsl(color.hsl);
    const cardKey = `${color.slug}-${index}`;

    // コピーキー: "slug-codeType" で複数カード・複数コードタイプを識別
    const hexKey = `${color.slug}-hex`;
    const rgbKey = `${color.slug}-rgb`;
    const hslKey = `${color.slug}-hsl`;

    return (
      <div key={cardKey} className={styles.paletteCard}>
        {/* 色見本。地の色が伝統色そのもの（§2）。 */}
        <div
          className={styles.paletteColorSwatch}
          style={{ backgroundColor: hexValue }}
          aria-label={`${color.name}の色見本`}
          role="img"
        />
        {/* 色名（辞書詳細ページへのリンク） */}
        <div className={styles.paletteColorName}>
          {color.slug === selectedColor?.slug ? (
            <span className={styles.pickedLabel}>選んだ色</span>
          ) : null}
          <Link
            href={`/dictionary/colors/${color.slug}`}
            className={styles.paletteColorNameLink}
            data-text-box="inline"
          >
            {color.name}
          </Link>
        </div>
        <div className={styles.paletteColorRomaji}>{color.romaji}</div>

        {/* HEX コピーボタン付き */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>HEX</span>
          <span className={styles.colorCodeValue}>{hexValue}</span>
          <Button
            variant="default"
            onClick={() => void copy(hexValue, hexKey)}
            aria-label={
              copiedKey === hexKey ? COPIED_LABEL : `HEX ${hexValue} をコピー`
            }
          >
            {copiedKey === hexKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>

        {/* RGB */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>RGB</span>
          <span className={styles.colorCodeValue}>{rgbValue}</span>
          <Button
            variant="default"
            onClick={() => void copy(rgbValue, rgbKey)}
            aria-label={
              copiedKey === rgbKey ? COPIED_LABEL : `RGB ${rgbValue} をコピー`
            }
          >
            {copiedKey === rgbKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>

        {/* HSL */}
        <div className={styles.colorCodeRow}>
          <span className={styles.colorCodeLabel}>HSL</span>
          <span className={styles.colorCodeValue}>{hslValue}</span>
          <Button
            variant="default"
            onClick={() => void copy(hslValue, hslKey)}
            aria-label={
              copiedKey === hslKey ? COPIED_LABEL : `HSL ${hslValue} をコピー`
            }
          >
            {copiedKey === hslKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Panel as={as} className={className}>
      <div className={styles.inner}>
        {/* 選んだ色の配色を読み上げに伝える。見える形は選んだ色の欄と下の配色の結果が持つ。 */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="visually-hidden"
        >
          {liveSummary}
        </div>

        <ListStack>
          <div className={styles.head}>
            <ListStatus
              ref={statusRef}
              total={PALETTE_ITEMS.length}
              matched={matched}
              filtering={filtering}
              unit="色"
              announcement={announcement}
              onClear={clear}
            />
            <ListControls
              searchLabel="色名・ローマ字で探す"
              searchRef={searchRef}
              query={state.query}
              onQueryChange={setQuery}
              kindGroup={{
                legend: "色の系統",
                options: PALETTE_SPEC.kinds,
                value: state.kind,
                onChange: setKind,
              }}
              sortGroup={{
                legend: "並び順",
                options: PALETTE_SPEC.sorts,
                value: state.sort,
                onChange: setSort,
              }}
            />
          </div>

          {hasItems ? (
            <fieldset
              role="radiogroup"
              aria-label="伝統色"
              className={styles.swatchGroup}
            >
              <div
                ref={gridRef}
                className={styles.swatchGrid}
                data-testid="swatch-grid"
              >
                {slice.items.map(({ color }, index) => {
                  const isSelected = selectedColor?.slug === color.slug;
                  const rowEnd =
                    columns > 0 &&
                    (index % columns === columns - 1 ||
                      index === slice.items.length - 1);
                  const opensHere =
                    selectedIndex >= 0 &&
                    rowEnd &&
                    Math.floor(selectedIndex / columns) ===
                      Math.floor(index / columns);
                  return (
                    <Fragment key={color.slug}>
                      <label
                        className={styles.swatch}
                        style={{ backgroundColor: color.hex }}
                      >
                        <input
                          type="radio"
                          name={radioName}
                          value={color.slug}
                          className={styles.swatchInput}
                          checked={isSelected}
                          onChange={(event) => handleColorSelect(color, event)}
                          aria-label={`${color.name} (${color.hex})`}
                          data-swatch-slug={color.slug}
                        />
                        <span className={styles.swatchMark} />
                      </label>
                      {opensHere && selectedColor ? (
                        <div
                          ref={pickedRef}
                          className={styles.pickedRow}
                          data-testid="picked-color"
                        >
                          <PickedColor color={selectedColor} />
                        </div>
                      ) : null}
                    </Fragment>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
        </ListStack>

        {/* 配色パターンの選択 */}
        <div className={styles.harmonySection}>
          <RadioGroup
            options={HARMONY_RADIO_OPTIONS}
            value={harmonyType}
            onChange={(v) => setHarmonyType(v as HarmonyType)}
            legend="配色パターン"
          />
          {currentHarmonyInfo && (
            <p className={styles.harmonyDescription}>
              {currentHarmonyInfo.description}
            </p>
          )}
        </div>

        {/* 未選択状態の案内 */}
        {!selectedColor && (
          <div className={styles.placeholderMessage}>
            上のパレットから伝統色を選んでください
          </div>
        )}

        {/* 無彩色の場合 */}
        {selectedColor && isAchromatic(selectedColor) && (
          <>
            <p className={styles.achromaticNotice}>
              この色は無彩色のため、色彩調和の計算ができません。代わりに明度の異なる無彩色の一覧を表示します。
            </p>
            {achromaticPalette && (
              <div
                className={styles.paletteResults}
                data-testid="palette-results"
              >
                {achromaticPalette.map((color, index) =>
                  renderColorCard(color, index),
                )}
              </div>
            )}
          </>
        )}

        {/* 有彩色の配色結果 */}
        {selectedColor && !isAchromatic(selectedColor) && harmonyResult && (
          <div className={styles.paletteResults} data-testid="palette-results">
            {harmonyResult.colors.map((color, index) =>
              renderColorCard(color, index),
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
