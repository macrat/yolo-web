/**
 * useToolboxConfig — ツールボックスレイアウト設定の React フック。
 *
 * localStorage からタイルレイアウトを読み込み、変更を永続化する。
 * useSyncExternalStore ベースで SSR 対応 + 複数インスタンス同期を実現する。
 *
 * 同期経路:
 * - 別タブ: window.addEventListener("storage", ...) による storage イベント
 * - 同一タブ複数インスタンス: 独自 EventTarget による内部イベント通知
 *
 * 設計原則:
 * - fallback 責務はこのフックに集約。呼び出し元コンポーネントは fallback を意識しない。
 * - getServerSnapshot は INITIAL_DEFAULT_LAYOUT.tiles 固定（hydration mismatch 回避）
 * - suppressHydrationWarning は使用しない
 * - cachedSnapshot はクロージャ内に閉じ込めてモジュールスコープのグローバル変数を避ける
 */

"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { TileLayoutEntry } from "./storage";
import { loadConfig, saveConfig, TOOLBOX_CONFIG_STORAGE_KEY } from "./storage";
import { INITIAL_DEFAULT_LAYOUT } from "./initial-default-layout";

// ---------------------------------------------------------------------------
// 内部バス（同一タブ複数インスタンス同期用）
// ---------------------------------------------------------------------------

/**
 * internalBus — 同一タブ内での複数フックインスタンス間同期に使用する EventTarget。
 *
 * BroadcastChannel ではなく独自 EventTarget を採用する理由:
 * - 同一タブ完結で設計がシンプル
 * - BroadcastChannel は別タブ通信用途（storage イベントで既にカバー）
 * - テスト環境での扱いが容易
 *
 * このバスは setTiles/resetToDefault 後に "toolbox-config-change" イベントを発火して
 * すべてのフックインスタンスに再レンダリングを促す。
 *
 * フック外部（B-313 base64 シェア URL 復元など）から saveConfig を呼んだ後、
 * 同一タブのフックに通知したい場合は notifyChange() を使用する。
 * internalBus / INTERNAL_CHANGE_EVENT は外部には公開しない（予期せぬ再レンダリング防止）。
 * 外部利用は notifyChange() のみ。
 */
const internalBus = typeof window !== "undefined" ? new EventTarget() : null;

const INTERNAL_CHANGE_EVENT = "toolbox-config-change";

/**
 * notifyChange — internalBus に変更イベントを発火する。
 *
 * フック外部から saveConfig を呼んだ後に同一タブのフックインスタンスへ通知するときに使用する。
 * （B-313 base64 シェア URL 復元、将来のプリセット切替 UI など）
 *
 * 使用例:
 * ```ts
 * saveConfig(restoredTiles);
 * notifyChange();
 * ```
 */
export function notifyChange(): void {
  internalBus?.dispatchEvent(new Event(INTERNAL_CHANGE_EVENT));
}

// ---------------------------------------------------------------------------
// ストア（クロージャ化 — モジュールスコープのグローバル変数を避ける）
// ---------------------------------------------------------------------------

/**
 * createToolboxStore — subscribe / getSnapshot / invalidateCache を
 * クロージャで束ねたストアオブジェクトを生成する。
 *
 * cachedSnapshot をクロージャ内に閉じ込めることで:
 * - モジュールスコープのミュータブルグローバルを排除
 * - テストでは vi.resetModules() でモジュールを再ロードするだけでキャッシュがリセットされる
 * - プロダクションコードに invalidateCache を export する必要がない
 */
function createToolboxStore() {
  /** スナップショットキャッシュ（クロージャスコープ） */
  let cachedSnapshot: TileLayoutEntry[] | null = null;

  /**
   * invalidateCache — キャッシュを破棄する（クロージャ内部専用）。
   *
   * setTiles/resetToDefault 後および storage イベント受信時に呼ぶ。
   * 次回 getSnapshot 呼び出しで localStorage を再読み込みする。
   * プロダクションコードから直接呼ぶ必要はない（フック外部には公開しない）。
   */
  function invalidateCache(): void {
    cachedSnapshot = null;
  }

  /**
   * subscribe — useSyncExternalStore の購読関数。
   *
   * 購読する伝播経路（両方は購読しない — 計画書の指示通り）:
   * - 別タブ: window "storage" イベント（TOOLBOX_CONFIG_STORAGE_KEY 絞り込み）
   * - 同一タブ: internalBus の "toolbox-config-change" イベント
   */
  function subscribe(callback: () => void): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }

    // 別タブ同期: storage イベント（他タブが localStorage を変更したとき発火）
    // MDN 仕様: 別タブの setItem が完了した後にイベントが届くため、
    // イベント受信時点で localStorage は既に新しい値になっている
    const onStorageEvent = (event: StorageEvent) => {
      if (event.key === TOOLBOX_CONFIG_STORAGE_KEY) {
        invalidateCache();
        callback();
      }
    };
    window.addEventListener("storage", onStorageEvent);

    // 同一タブ同期: 独自 EventTarget
    // invalidateCache はすでに setTiles/resetToDefault/notifyChange 側で呼び済み
    internalBus!.addEventListener(INTERNAL_CHANGE_EVENT, callback);

    return () => {
      window.removeEventListener("storage", onStorageEvent);
      internalBus!.removeEventListener(INTERNAL_CHANGE_EVENT, callback);
    };
  }

  /**
   * getSnapshot — クライアント側で現在の tiles を返す。
   *
   * SSR 環境では getServerSnapshot が使われるため、このパスは CSR 専用。
   * キャッシュが有効な間は同一参照を返す（useSyncExternalStore の無限ループ防止）。
   * invalidateCache() が呼ばれた後の初回呼び出しで localStorage を再読み込みする。
   */
  function getSnapshot(): TileLayoutEntry[] {
    // SSR 環境では getServerSnapshot が使われるが、念のためガードを追加する
    if (typeof window === "undefined") {
      return INITIAL_DEFAULT_LAYOUT.tiles;
    }
    if (cachedSnapshot === null) {
      cachedSnapshot = loadConfig();
    }
    return cachedSnapshot;
  }

  return { subscribe, getSnapshot, invalidateCache };
}

/** モジュール単位で 1 つのストアを保持する */
const store = createToolboxStore();

// ---------------------------------------------------------------------------
// getServerSnapshot（ストア外で定義 — 純粋な固定値返しのため）
// ---------------------------------------------------------------------------

/**
 * getServerSnapshot — SSR 時の固定値。
 *
 * INITIAL_DEFAULT_LAYOUT.tiles を固定値として返すことで hydration mismatch を回避する。
 * （docs/knowledge/dnd-kit.md 参照）
 */
function getServerSnapshot(): TileLayoutEntry[] {
  return INITIAL_DEFAULT_LAYOUT.tiles;
}

// ---------------------------------------------------------------------------
// フック本体
// ---------------------------------------------------------------------------

/**
 * フックの戻り値の型定義
 */
export interface UseToolboxConfigReturn {
  /** 現在のタイルレイアウト配列 */
  tiles: TileLayoutEntry[];
  /**
   * タイルレイアウトを更新して localStorage に保存する。
   * 渡された配列順に order を自動正規化（0 始まり連番）してから保存する。
   * 同一タブの全インスタンスに即時反映される。
   */
  setTiles: (tiles: TileLayoutEntry[]) => void;
  /**
   * レイアウトを INITIAL_DEFAULT_LAYOUT にリセットして localStorage に保存する。
   * 同一タブの全インスタンスに即時反映される。
   */
  resetToDefault: () => void;
}

/**
 * useToolboxConfig — ツールボックスレイアウト設定フック。
 *
 * ⚠️ **SSR 禁止 / dynamic ssr:false 必須**
 *
 * このフックは `useSyncExternalStore` の `getServerSnapshot` で
 * `INITIAL_DEFAULT_LAYOUT.tiles` を固定値で返す。
 * そのため、呼び出し側コンポーネントを `dynamic({ ssr: false })` で
 * 動的インポートしない場合、CLS / hydration mismatch が発生する。
 *
 * 正しい使用例:
 * ```tsx
 * // page.tsx または親コンポーネント
 * const ToolboxClient = dynamic(() => import("./ToolboxClient"), {
 *   ssr: false,
 * });
 * // ToolboxClient.tsx 内で useToolboxConfig() を呼び出す
 * ```
 *
 * SSR 環境（`typeof window === "undefined"` の環境）でこのフックが
 * 直接呼ばれた場合は（開発時・本番ともに）エラーを throw して誤用を早期に検出する。
 *
 * refs: docs/knowledge/dnd-kit.md（hydration mismatch + dynamic ssr:false の知見）
 *
 * @example
 * ```tsx
 * const { tiles, setTiles, resetToDefault } = useToolboxConfig();
 * ```
 */
export function useToolboxConfig(): UseToolboxConfigReturn {
  // SSR 環境での誤用を早期に検出する。
  // このフックは getServerSnapshot で固定値を返すため、ssr:false なしで
  // 使用すると CLS / hydration mismatch が発生する（暗黙契約の明示化）。
  // refs: docs/knowledge/dnd-kit.md
  if (typeof window === "undefined") {
    throw new Error(
      "[useToolboxConfig] このフックは SSR 環境では使用できません。\n" +
        "呼び出し側コンポーネントを `dynamic({ ssr: false })` で動的インポートしてください。\n" +
        "詳細: docs/knowledge/dnd-kit.md",
    );
  }

  const tiles = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
  );

  const setTiles = useCallback((newTiles: TileLayoutEntry[]) => {
    // order を配列順に再採番して連番性を保証する（フック責務境界の徹底）。
    // 呼び出し側に order 連番性の維持を求めない設計。
    const normalized = newTiles.map((tile, index) => ({
      ...tile,
      order: index,
    }));
    saveConfig(normalized);
    // キャッシュを破棄してから同一タブの他インスタンスに変更を通知する。
    // invalidateCache() を先に呼ぶことで、callback → getSnapshot の順に
    // 実行されたとき必ず再読み込みが走ることを保証する。
    store.invalidateCache();
    notifyChange();
  }, []);

  const resetToDefault = useCallback(() => {
    // setTiles 経由で実装することで order 正規化を必ず通す設計の一貫性を保つ。
    // INITIAL_DEFAULT_LAYOUT.tiles は元々 order 連番なので余計な処理にはならない。
    setTiles([...INITIAL_DEFAULT_LAYOUT.tiles]);
  }, [setTiles]);

  return { tiles, setTiles, resetToDefault };
}
