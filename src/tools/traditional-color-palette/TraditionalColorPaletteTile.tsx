"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  computeHarmony,
  getAchromaticPalette,
  isAchromatic,
  filterByCategory,
  HARMONY_TYPE_INFO,
  type HarmonyType,
} from "./logic";
import { getAllColors } from "@/dictionary/_lib/colors";
import type { ColorEntry, ColorCategory } from "@/dictionary/_lib/types";
import { COLOR_CATEGORY_LABELS } from "@/dictionary/_lib/types";

/**
 * 伝統色カラーパレット タイル用 UI（kind=widget）。
 *
 * 色選択→配色生成型タイル初回（Phase 8.1 第 18 弾 / cycle-217 T-3 rev.2）:
 * - 「和の配色の HEX を今すぐ決めたい」最大需要に直接応答
 * - おまかせ初期表示: マウント後に有彩色 240 色からランダム 1 色を選択し配色生成済みで表示
 * - M1a「開いた瞬間に入力欄が見えてすぐ使える」に直撃
 *
 * AP-P21 役割分担（cycle-217 SSoT 新規確立 色選択→配色生成型 N=1）:
 * - 操作側（flexShrink: 0）= カテゴリタブ + スウォッチ列 + 基準色/別の色ボタン + 配色タイプタブ
 *   (C) 操作側 40px 下限（cycle-210 SSoT (i) 引用適用）
 * - 膨張側（flex: 1 + overflowY: auto）= 横ストリップ配色結果（MAJOR-1 対応）
 *
 * CRIT-1 hydration 修正（docs/knowledge/nextjs.md §4）:
 * - NG: useState(pickRandom) は SSR でも実行され、サーバとクライアントで異なる色になる
 * - OK: useState(INITIAL_COLOR) で決定論的な固定色を SSR 初期値に使い、
 *       useEffect でマウント後にランダム色へ差し替える
 *   → SSR と初回クライアント描画が一致してハイドレーション mismatch ゼロ
 *   → 初期表示フラッシュなし（最初から固定色の配色が見えている）
 *   → マウント後にランダム性も担保
 *
 * MAJOR-1 全配色を一目で見渡せるよう横ストリップ型に変更:
 * - 配色結果を縦積みカード（minHeight 44px × 最大4枚）から横ストリップ（1段）に変更
 * - 各色セルに色サンプル円+色名+HEX+コピーボタンをコンパクトに収め、
 *   補色2色・トライアド3色・テトラド4色すべてが400×400枠内で一目で見える
 *
 * AP-I11 setTimeout cleanup:
 * - コピーボタン文言復帰の 1 秒タイマーを useRef で保持
 * - useEffect cleanup で clearTimeout を呼び出す
 *
 * コピーボタン文言変化は AP-P21 適用外（cycle-211 (x) 引用適用）。
 *
 * CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存タイル同型）。
 */

/** 全色データ（モジュールレベルでキャッシュ） */
const ALL_COLORS = getAllColors();

/** 有彩色のみ（おまかせ候補 = achromatic 10色を除く 240色 / 実装値 = logic.ts:174） */
const CHROMATIC_COLORS = ALL_COLORS.filter((c) => !isAchromatic(c));

/**
 * SSR 固定初期色（CRIT-1 対応 / docs/knowledge/nextjs.md §4）。
 * サーバとクライアント初回レンダリングが一致する決定論的な値として、
 * 有彩色の先頭エントリを使用する。
 * useEffect でマウント後にランダム色に差し替えるため、
 * ユーザーには「開いた瞬間に色が決まっている」体験を提供できる。
 */
const INITIAL_COLOR: ColorEntry = CHROMATIC_COLORS[0];

/** コピー完了表示を元に戻すまでの時間 (ms): 1 秒 */
const COPY_FEEDBACK_DURATION_MS = 1000;

/** カテゴリタブ定義 */
const CATEGORY_TAB_OPTIONS: { value: ColorCategory | "all"; label: string }[] =
  [
    { value: "all", label: "すべて" },
    { value: "red", label: COLOR_CATEGORY_LABELS.red },
    { value: "orange", label: COLOR_CATEGORY_LABELS.orange },
    { value: "yellow", label: COLOR_CATEGORY_LABELS.yellow },
    { value: "green", label: COLOR_CATEGORY_LABELS.green },
    { value: "blue", label: COLOR_CATEGORY_LABELS.blue },
    { value: "purple", label: COLOR_CATEGORY_LABELS.purple },
    { value: "achromatic", label: COLOR_CATEGORY_LABELS.achromatic },
  ];

/** 配色タイプの短縮ラベルと一行補足 */
const HARMONY_TAB_LABELS: Record<HarmonyType, { short: string; hint: string }> =
  {
    complementary: { short: "補色", hint: "真向かいの色。コントラスト強め" },
    analogous: { short: "類似色", hint: "隣り合う色。まとまりある印象" },
    triadic: { short: "トライアド", hint: "3等分。バランスよく賑やか" },
    tetradic: { short: "テトラド", hint: "4等分。豊かな色数" },
    split_complementary: {
      short: "分裂補色",
      hint: "補色の両隣。コントラスト穏やか",
    },
  };

/**
 * HEX → コントラストの高いフォントカラー（白 or 黒）を返す。
 * Rec.601 luma（0.299R+0.587G+0.114B、ガンマ展開なし）で輝度を近似する。
 * WCAG linear sRGB 計算ではなく知覚輝度近似式（NIT-1 訂正）。
 */
function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.5 ? "#1a1a1a" : "#f0f0f0";
}

/** RGB タプルを "rgb(R, G, B)" 文字列に変換 */
function rgbToString(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/** HSL タプルを "hsl(H, S%, L%)" 文字列に変換 */
function hslToString(hsl: [number, number, number]): string {
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}

/** 有彩色からランダムに 1 色を選択（useEffect でのみ呼ぶ） */
function pickRandomChromaticColor(pool: ColorEntry[]): ColorEntry {
  return pool[Math.floor(Math.random() * pool.length)];
}

/** コピー形式 */
type CopyFormat = "hex" | "rgb" | "hsl";

export default function TraditionalColorPaletteTile() {
  /**
   * 選択中の基準色
   *
   * CRIT-1 修正（docs/knowledge/nextjs.md §4）:
   * - NG だった実装: useState(pickRandomChromaticColor)
   *   → SSR でも initializer が実行されサーバとクライアントで別の色 = hydration mismatch
   * - OK な修正実装:
   *   1. useState(INITIAL_COLOR) で決定論的な固定色を初期値にする（SSR/クライアント共通）
   *   2. useEffect 内でランダム色に差し替える（クライアントのみ実行）
   */
  const [selectedColor, setSelectedColor] = useState<ColorEntry>(INITIAL_COLOR);

  /** 選択中の配色タイプ */
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("complementary");

  /** 選択中のカテゴリ（スウォッチ絞り込み用） */
  const [categoryFilter, setCategoryFilter] = useState<ColorCategory | "all">(
    "all",
  );

  /** コピー完了状態: key は `${slug}-${format}` */
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  /** コピー形式（HEX/RGB/HSL 切替） */
  const [copyFormat, setCopyFormat] = useState<CopyFormat>("hex");

  /** コピー完了表示を元に戻す setTimeout ID（AP-I11 SSoT） */
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * マウント後にランダム色へ差し替える（CRIT-1 / おまかせ初期表示）。
   * クライアントのみで実行される useEffect 内で Math.random() を呼ぶ。
   * これにより SSR: INITIAL_COLOR / クライアント初回: INITIAL_COLOR（一致）→
   * マウント後: ランダム有彩色（おまかせ表示）となりハイドレーション mismatch なし。
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedColor(pickRandomChromaticColor(CHROMATIC_COLORS));
  }, []); // 空依存 = マウント時1回のみ（意図的: docs/knowledge/nextjs.md §4 OK パターン）

  /** AP-I11 cleanup: unmount 時に走行中の setTimeout をキャンセルする */
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  /** フィルタ済みスウォッチ一覧 */
  const filteredColors = useMemo(
    () => filterByCategory(categoryFilter, ALL_COLORS),
    [categoryFilter],
  );

  /**
   * 配色結果の計算
   * - 有彩色: computeHarmony で配色生成
   * - 無彩色: getAchromaticPalette で明度順無彩色リスト
   */
  const harmonyResult = useMemo(() => {
    if (isAchromatic(selectedColor)) {
      return {
        baseColor: selectedColor,
        harmonyType,
        colors: getAchromaticPalette(selectedColor, ALL_COLORS),
        isAchromatic: true,
      };
    }
    return {
      ...computeHarmony(selectedColor, harmonyType, ALL_COLORS),
      isAchromatic: false,
    };
  }, [selectedColor, harmonyType]);

  /** 別の色: 現在のカテゴリ絞り込みに合わせた有彩色からランダム選択 */
  const handlePickRandom = useCallback(() => {
    const candidates =
      categoryFilter === "achromatic" || categoryFilter === "all"
        ? CHROMATIC_COLORS
        : CHROMATIC_COLORS.filter((c) => c.category === categoryFilter);
    const pool = candidates.length > 0 ? candidates : CHROMATIC_COLORS;
    setSelectedColor(pickRandomChromaticColor(pool));
    setCopiedKey(null);
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
  }, [categoryFilter]);

  /** コピーハンドラ（AP-I11 SSoT） */
  const handleCopy = useCallback(
    async (slug: string, value: string, format: CopyFormat) => {
      try {
        await navigator.clipboard.writeText(value);
        const key = `${slug}-${format}`;
        setCopiedKey(key);
        if (copyTimerRef.current !== null) {
          clearTimeout(copyTimerRef.current);
        }
        copyTimerRef.current = setTimeout(() => {
          setCopiedKey(null);
          copyTimerRef.current = null;
        }, COPY_FEEDBACK_DURATION_MS);
      } catch {
        // Clipboard API not available — silent fail
      }
    },
    [],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "10px",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* === 操作側（flexShrink: 0）=== */}

      {/* カテゴリ絞り込みタブ（操作側 / AP-P21 (C): minHeight 40px）*/}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: "3px",
          flexWrap: "nowrap",
          overflowX: "auto",
          minHeight: 40,
          alignItems: "center",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORY_TAB_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategoryFilter(value)}
            aria-pressed={categoryFilter === value}
            style={{
              flexShrink: 0,
              minHeight: 40,
              padding: "2px 6px",
              fontSize: "0.62rem",
              borderRadius: "4px",
              border: `1px solid ${categoryFilter === value ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
              backgroundColor:
                categoryFilter === value ? "var(--accent)" : "transparent",
              color:
                categoryFilter === value
                  ? "var(--fg-invert, var(--bg))"
                  : "var(--fg-soft)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: categoryFilter === value ? 600 : 400,
              whiteSpace: "nowrap",
              transition: "background-color 0.15s, color 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* スウォッチ列（操作側 / 横スクロール / AP-P21 (C): minHeight 40px）*/}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: "3px",
          overflowX: "auto",
          minHeight: 40,
          alignItems: "center",
          scrollbarWidth: "none",
        }}
      >
        {filteredColors.map((color) => {
          const isSelected = color.slug === selectedColor.slug;
          return (
            <button
              key={color.slug}
              type="button"
              aria-label={`${color.name}を選択`}
              data-swatch-slug={color.slug}
              onClick={() => {
                setSelectedColor(color);
                setCopiedKey(null);
              }}
              style={{
                flexShrink: 0,
                width: 28,
                minHeight: 40, // AP-P21 (C): タップ領域 40px
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: color.hex,
                  border: isSelected
                    ? "2px solid var(--accent)"
                    : "1.5px solid var(--border, rgba(0,0,0,0.15))",
                  boxSizing: "border-box",
                  boxShadow: isSelected
                    ? "0 0 0 2px var(--bg), 0 0 0 4px var(--accent)"
                    : "none",
                  transition: "box-shadow 0.15s",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* 基準色 + 別の色ボタン（操作側 / AP-P21 (C): minHeight 40px）*/}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minHeight: 40,
        }}
        data-selected-color={selectedColor.slug}
        data-color-category={selectedColor.category}
      >
        {/* 基準色サンプル */}
        <span
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "4px",
            backgroundColor: selectedColor.hex,
            border: "1px solid var(--border, rgba(0,0,0,0.15))",
            display: "block",
          }}
        />
        {/* 色名 + HEX */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--fg)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedColor.name}
          </div>
          <div
            style={{
              fontSize: "0.6rem",
              color: "var(--fg-soft)",
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
            }}
          >
            {selectedColor.hex}
          </div>
        </div>
        {/* 「別の色」ボタン（AP-P21 (C): minHeight 40px）*/}
        <button
          type="button"
          onClick={handlePickRandom}
          aria-label="別の色を選択（おまかせ再生成）"
          style={{
            flexShrink: 0,
            minHeight: 40,
            padding: "0 10px",
            fontSize: "0.68rem",
            borderRadius: "4px",
            border: "1px solid var(--border, var(--fg-soft))",
            backgroundColor: "transparent",
            color: "var(--fg-soft)",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          別の色
        </button>
      </div>

      {/* 配色タイプタブ（5タブ常時表示 / 論点 C 採択 / AP-P21 (C): minHeight 40px）*/}
      {!isAchromatic(selectedColor) && (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            gap: "3px",
            minHeight: 40,
            alignItems: "stretch",
          }}
        >
          {HARMONY_TYPE_INFO.map(({ type }) => {
            const { short } = HARMONY_TAB_LABELS[type];
            const isActive = harmonyType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setHarmonyType(type)}
                aria-pressed={isActive}
                title={HARMONY_TAB_LABELS[type].hint}
                style={{
                  flex: "1 1 0",
                  minHeight: 40,
                  padding: "2px 1px",
                  fontSize: "0.6rem",
                  borderRadius: "4px",
                  border: `1px solid ${isActive ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
                  backgroundColor: isActive ? "var(--accent)" : "transparent",
                  color: isActive
                    ? "var(--fg-invert, var(--bg))"
                    : "var(--fg-soft)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  transition: "background-color 0.15s, color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {short}
              </button>
            );
          })}
        </div>
      )}

      {/* === 膨張側（flex: 1 + overflowY: auto）===
           MAJOR-1 対応: 横ストリップ型配色表示
           - 各色を横に等分割で並べ、全配色（補色2色・トライアド3色・テトラド4色）を一目で見渡せる
           - 縦方向: 膨張側の余裕（~120px以上）に横ストリップ高 + 詳細・コピー行を収める */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          minHeight: 0,
        }}
      >
        {/* 無彩色の場合の注釈 */}
        {harmonyResult.isAchromatic && (
          <div
            style={{
              flexShrink: 0,
              padding: "3px 0",
              fontSize: "0.58rem",
              color: "var(--fg-soft)",
            }}
          >
            無彩色は色相を持たないため、明度別の無彩色一覧を表示します
          </div>
        )}

        {/* 横ストリップ（MAJOR-1 / 全色を一目で見渡せる）*/}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            gap: "3px",
            borderRadius: "6px",
            overflow: "hidden",
            height: "72px",
          }}
        >
          {harmonyResult.colors.map((color) => {
            const isBase = color.slug === selectedColor.slug;
            const contrastFg = getContrastColor(color.hex);
            return (
              <div
                key={color.slug}
                data-strip-color={color.slug}
                style={{
                  flex: 1,
                  backgroundColor: color.hex,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: "4px 2px",
                  boxSizing: "border-box",
                  position: "relative",
                  cursor: "default",
                  outline: isBase ? "2px solid var(--accent)" : "none",
                  outlineOffset: "-2px",
                }}
              >
                {/* 基準ラベル
                     MINOR-1 修正: idx === 0 条件を除去し color.slug === selectedColor.slug のみで判定。
                     無彩色分岐では getAchromaticPalette の返り値の中に基準色 slug が含まれるため
                     正しく基準ラベルが付く。 */}
                {isBase && (
                  <span
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.5rem",
                      color: contrastFg,
                      backgroundColor: "rgba(0,0,0,0.25)",
                      borderRadius: "2px",
                      padding: "0 3px",
                      whiteSpace: "nowrap",
                      lineHeight: 1.4,
                    }}
                  >
                    基準
                  </span>
                )}
                {/* 色名（短縮：3文字まで + 省略） */}
                <span
                  style={{
                    fontSize: "0.52rem",
                    color: contrastFg,
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingLeft: "2px",
                    paddingRight: "2px",
                  }}
                >
                  {color.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* 配色カード詳細（コピー + HEX/RGB/HSL / 膨張側内部）*/}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          {harmonyResult.colors.map((color) => {
            const isBase = color.slug === selectedColor.slug;
            const copyValue =
              copyFormat === "hex"
                ? color.hex
                : copyFormat === "rgb"
                  ? rgbToString(color.rgb)
                  : hslToString(color.hsl);
            const copyKey = `${color.slug}-${copyFormat}`;
            const isCopied = copiedKey === copyKey;

            return (
              <div
                key={color.slug}
                data-harmony-card={color.slug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 6px",
                  minHeight: 36,
                  borderRadius: "4px",
                  border: `1px solid ${isBase ? "var(--accent)" : "var(--border, rgba(0,0,0,0.08))"}`,
                  boxSizing: "border-box",
                  backgroundColor: "var(--bg)",
                }}
              >
                {/* 色サンプル */}
                <span
                  style={{
                    flexShrink: 0,
                    width: 18,
                    height: 18,
                    borderRadius: "3px",
                    backgroundColor: color.hex,
                    border: "1px solid var(--border, rgba(0,0,0,0.12))",
                    display: "block",
                  }}
                />
                {/* 色名 + コード値 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: isBase ? 700 : 400,
                      color: "var(--fg)",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isBase && (
                      <span
                        style={{
                          fontSize: "0.52rem",
                          color: "var(--accent)",
                          marginRight: "3px",
                        }}
                      >
                        基準
                      </span>
                    )}
                    {color.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "var(--fg-soft)",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                      display: "block",
                    }}
                  >
                    {copyValue}
                  </span>
                </div>
                {/* コピーボタン（インプレース FB / AP-I11 / cycle-211 (x) 適用外） */}
                <button
                  type="button"
                  aria-label={`${color.name}の${copyFormat.toUpperCase()}をコピー`}
                  data-copied={isCopied || undefined}
                  onClick={() => handleCopy(color.slug, copyValue, copyFormat)}
                  style={{
                    flexShrink: 0,
                    padding: "2px 7px",
                    fontSize: "0.62rem",
                    borderRadius: "3px",
                    border: `1px solid ${isCopied ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
                    backgroundColor: isCopied ? "var(--accent)" : "transparent",
                    color: isCopied
                      ? "var(--fg-invert, var(--bg))"
                      : "var(--fg-soft)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: isCopied ? 600 : 400,
                    whiteSpace: "nowrap",
                    transition: "background-color 0.15s, color 0.15s",
                    minHeight: 28,
                  }}
                >
                  {isCopied ? "コピー済み" : "コピー"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* === フッター行（操作側 = flexShrink: 0）===
           コピー形式切替 + 詳細リンクを1行に統合（MAJOR-1 操作側高さ削減）*/}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minHeight: 40,
        }}
      >
        {/* コピー形式切替（HEX/RGB/HSL）*/}
        <div
          style={{
            display: "flex",
            gap: "3px",
            alignItems: "center",
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.58rem",
              color: "var(--fg-soft)",
              flexShrink: 0,
            }}
          >
            形式:
          </span>
          {(["hex", "rgb", "hsl"] as CopyFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setCopyFormat(fmt)}
              aria-pressed={copyFormat === fmt}
              style={{
                flexShrink: 0,
                padding: "2px 7px",
                fontSize: "0.6rem",
                borderRadius: "3px",
                border: `1px solid ${copyFormat === fmt ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
                backgroundColor:
                  copyFormat === fmt ? "var(--accent)" : "transparent",
                color:
                  copyFormat === fmt
                    ? "var(--fg-invert, var(--bg))"
                    : "var(--fg-soft)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: copyFormat === fmt ? 600 : 400,
                whiteSpace: "nowrap",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 詳細リンク */}
        <Link
          href="/tools/traditional-color-palette"
          style={{
            flexShrink: 0,
            fontSize: "0.7rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            minHeight: 40,
          }}
        >
          詳細 →
        </Link>
      </div>
    </div>
  );
}
