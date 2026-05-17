"use client";

/**
 * KeigoReferenceTile — keigo-reference 用 1 軽量版タイル
 *
 * 案 17-A（tile-and-detail-design.md §4 / cycle-193.md）:
 * - 検索 input（動詞名フィルタリング）+ クリアボタン
 * - 3 カテゴリフィルタ（basic / business / service）
 * - 上位 N 件リスト（N = 8: T-D 実機計測で確定予定の暫定値）
 * - 各エントリの敬語三形（尊敬語/謙譲語/丁寧語）コピーボタン
 * - useToolStorage で前回状態を復元（M1b likes 3）
 *
 * M1a likes 1: 入力欄がファーストアクション
 * M1b likes 3: localStorage で前回検索文字列・カテゴリを復元
 * cycle-179 (b) 採用: 60 件全件ではなく上位 N 件のみ表示
 *
 * tile-loader.ts の dynamic({ ssr: false }) でロードされる前提。
 * TileVariant / variantId は一切参照しない。
 */

import { useCallback, useState, useEffect, useRef } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  filterEntries,
  getKeigoCategories,
  type KeigoCategory,
  type KeigoEntry,
} from "./logic";
import { useToolStorage } from "@/tools/_hooks/use-tool-storage";
import { STORAGE_KEY_SEARCH, STORAGE_KEY_CATEGORY } from "./storage-keys";
import styles from "./Tile.module.css";

/**
 * 上位 N 件の件数。
 * 暫定値 8: T-D 実機計測（/internal/tiles での Playwright 計測）で確定予定。
 * cycle-179 (b) 採用との整合: 60 件全件ではなく上位 N 件に絞る。
 */
const TOP_N = 8;

/** コピー通知の自動消去時間 (ms) */
const COPY_NOTICE_MS = 2000;

interface CopyButtonProps {
  value: string;
  label: string;
  /** aria-label（アクセシビリティ: 「尊敬語をコピー」等） */
  ariaLabel: string;
  onCopy: (value: string) => void;
}

/**
 * 各敬語形のコピーボタン。
 * - ラベルは常に固定テキストを維持（ボタン幅変動によるレイアウトシフト防止）
 * - コピー成否は sr-only の aria-live 領域でアナウンス（重要-1 対応）
 * - 記号アイコン類は不使用（CLAUDE.md 絵文字禁止 / ラベルは固定テキスト）
 */
function CopyButton({ value, label, ariaLabel, onCopy }: CopyButtonProps) {
  return (
    <Button
      variant="default"
      className={styles.copyButton}
      onClick={() => onCopy(value)}
      aria-label={ariaLabel}
    >
      {label}
    </Button>
  );
}

/** 敬語三形の 1 行（ラベル + 値 + コピーボタン） */
function KeigoRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (value: string) => void;
}) {
  return (
    <div className={styles.keigoRow}>
      <span className={styles.keigoLabel}>{label}</span>
      <span className={styles.keigoValue}>{value}</span>
      <CopyButton
        value={value}
        label={`${label}コピー`}
        ariaLabel={`${label}をコピー`}
        onCopy={onCopy}
      />
    </div>
  );
}

/** カテゴリフィルタボタン（重要-2: variant="primary" で !important なし） */
function CategoryButton({
  name,
  isActive,
  onClick,
}: {
  id: KeigoCategory | "all";
  name: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={isActive ? "primary" : "default"}
      aria-pressed={isActive}
      onClick={onClick}
    >
      {name}
    </Button>
  );
}

/**
 * KeigoReferenceTile — keigo-reference 用 1 軽量版タイルコンポーネント。
 *
 * props なし（tile-loader.ts の slug prop は型上存在するが本コンポーネントでは使用しない）。
 * dynamic({ ssr: false }) でロードされる前提のため、"use client" + localStorage アクセス可。
 */
export default function KeigoReferenceTile() {
  // --- localStorage 永続化（M1b likes 3） ---
  // key 命名規約: yolos-tool-<slug>-<purpose>（storage-keys.ts 共有定数を使用）
  const [search, setSearch] = useToolStorage<string>(STORAGE_KEY_SEARCH, "");
  const [category, setCategory] = useToolStorage<KeigoCategory | "all">(
    STORAGE_KEY_CATEGORY,
    "all",
  );

  // コピー通知（SR アナウンス用）: ResultCopyArea と同パターン（重要-1 対応）
  const [srAnnounce, setSrAnnounce] = useState<string>("");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // カテゴリ一覧（logic.ts から取得）
  const categories = getKeigoCategories();

  // フィルタ済みエントリ（stable sort: logic.ts の filterEntries は配列順を維持する）
  const filtered = filterEntries(search, category);
  // 上位 N 件に絞る（cycle-179 (b) 採用: 60 件全件ではなく軽量版は N 件）
  const displayed: KeigoEntry[] = filtered.slice(0, TOP_N);

  // アンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  /** クリップボードにコピーし SR アナウンスを更新する（重要-1 対応） */
  const handleCopy = useCallback(async (value: string) => {
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current);
    }

    if (!navigator.clipboard) {
      setSrAnnounce("コピーに失敗しました");
      copyTimerRef.current = setTimeout(() => {
        setSrAnnounce("");
        copyTimerRef.current = null;
      }, COPY_NOTICE_MS);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setSrAnnounce("コピーしました");
    } catch {
      setSrAnnounce("コピーに失敗しました");
    }

    copyTimerRef.current = setTimeout(() => {
      setSrAnnounce("");
      copyTimerRef.current = null;
    }, COPY_NOTICE_MS);
  }, []);

  return (
    <Panel as="div" className={styles.container}>
      {/*
       * SR アナウンス領域（重要-1 対応）:
       * ResultCopyArea と同パターンで role="status" + aria-live="polite" を使用。
       * 視覚的には非表示（sr-only）、スクリーンリーダーのみに読み上げられる。
       */}
      <span role="status" aria-live="polite" className={styles.srOnly}>
        {srAnnounce}
      </span>

      {/* 検索・フィルタエリア（M1a likes 1: ファーストビューに入力欄） */}
      <div className={styles.searchArea}>
        <div className={styles.searchRow}>
          <Input
            type="search"
            placeholder="動詞を検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="動詞を検索"
          />
          {/* 軽微-2: 明示的なクリアボタン（ブラウザ依存の × に頼らない） */}
          {search !== "" && (
            <Button
              variant="default"
              onClick={() => setSearch("")}
              aria-label="検索をクリア"
            >
              クリア
            </Button>
          )}
        </div>

        {/* 3 カテゴリフィルタ（basic / business / service） */}
        <div
          className={styles.categoryFilters}
          role="group"
          aria-label="カテゴリフィルタ"
        >
          <CategoryButton
            id="all"
            name="すべて"
            isActive={category === "all"}
            onClick={() => setCategory("all")}
          />
          {categories.map((cat) => (
            <CategoryButton
              key={cat.id}
              id={cat.id}
              name={cat.name}
              isActive={category === cat.id}
              onClick={() => setCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* 件数表示 */}
      <p className={styles.resultCount}>
        {filtered.length > TOP_N
          ? `${filtered.length} 件中 上位 ${TOP_N} 件を表示`
          : `${filtered.length} 件`}
      </p>

      {/* エントリリスト（上位 N 件） */}
      {displayed.length === 0 ? (
        <p className={styles.emptyMessage}>
          該当する動詞が見つかりませんでした
        </p>
      ) : (
        <ul className={styles.entryList}>
          {displayed.map((entry) => (
            <li key={entry.id} className={styles.entryItem}>
              <div className={styles.entryVerb}>{entry.casual}</div>
              <div className={styles.keigoParts}>
                {/* 敬語三形: sonkeigo / kenjogo / teineigo */}
                <KeigoRow
                  label="尊敬語"
                  value={entry.sonkeigo}
                  onCopy={handleCopy}
                />
                <KeigoRow
                  label="謙譲語"
                  value={entry.kenjogo}
                  onCopy={handleCopy}
                />
                <KeigoRow
                  label="丁寧語"
                  value={entry.teineigo}
                  onCopy={handleCopy}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
