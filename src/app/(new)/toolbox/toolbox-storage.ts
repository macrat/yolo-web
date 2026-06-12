/**
 * toolbox-storage — 道具箱構成（どのタイルが・どの順で並ぶか）の localStorage 永続化
 *
 * cycle-230 T-4: 来訪者が選んだ道具箱の構成をリロード・再訪問後も残すための
 * 永続化モジュール。先行パターン src/play/games/irodori/_lib/storage.ts に倣い、
 * isStorageAvailable ガード＋ try/catch ＋デフォルトフォールバックで構成する。
 *
 * ## スキーマ（バージョン付き）
 *
 * `{ version: 1, items: string[] }`
 * items はカタログエントリ id（`${slug}:${variant}`）の順序付き配列。
 *
 * ## フォールバック方針
 *
 * - localStorage 不可用（SSR・プライベートモード等）→ 保存なしでデフォルト構成
 * - 未保存・破損 JSON・スキーマ不一致・未知バージョン → デフォルト構成
 * - items 内の未知 id（カタログに無い id）→ 黙って除去（残りは維持）
 *   ※全件が未知 id の場合は空配列になり「意図的に全部外した状態」と区別できない。
 *   カタログ id の大規模改廃を行うときは TOOLBOX_SCHEMA_VERSION を上げて
 *   デフォルトへフォールバックさせる運用を前提とする
 * - items 内の重複 id → 最初の1件のみ採用（同一エントリは道具箱に1枚まで）
 * - 空配列（来訪者が全タイルを外した状態）→ 有効な構成として尊重する
 */

/** localStorage のキー */
export const TOOLBOX_STORAGE_KEY = "toolbox-config";

/** スキーマバージョン。構造を変えるときはインクリメントし、旧版はデフォルトに落とす */
export const TOOLBOX_SCHEMA_VERSION = 1;

/** localStorage に保存する構成データ */
interface StoredToolboxConfig {
  version: number;
  items: string[];
}

/**
 * localStorage が利用可能かを安全に確認する。
 * SSR（window 不在）・プライベートモード・容量超過などで false になる。
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** 保存データが StoredToolboxConfig の形をしているかを検証する型ガード */
function isStoredToolboxConfig(value: unknown): value is StoredToolboxConfig {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.items) &&
    candidate.items.every((item) => typeof item === "string")
  );
}

/**
 * 保存済みの道具箱構成を読み込む。
 *
 * @param defaultItems フォールバック先のデフォルト構成（コピーを返す）
 * @param validIds カタログに実在するエントリ id の集合（未知 id の除去に使う）
 * @returns カタログエントリ id の順序付き配列
 */
export function loadToolboxItems(
  defaultItems: readonly string[],
  validIds: ReadonlySet<string>,
): string[] {
  if (!isStorageAvailable()) return [...defaultItems];
  try {
    const raw = window.localStorage.getItem(TOOLBOX_STORAGE_KEY);
    if (raw === null) return [...defaultItems];

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredToolboxConfig(parsed)) return [...defaultItems];
    if (parsed.version !== TOOLBOX_SCHEMA_VERSION) return [...defaultItems];

    // 未知 id は黙って除去し、重複 id は最初の1件のみ採用する
    const seen = new Set<string>();
    const items: string[] = [];
    for (const id of parsed.items) {
      if (!validIds.has(id) || seen.has(id)) continue;
      seen.add(id);
      items.push(id);
    }
    return items;
  } catch {
    return [...defaultItems];
  }
}

/** 道具箱構成を保存する。保存失敗（容量超過等）は黙過し通常動作を続ける */
export function saveToolboxItems(items: readonly string[]): void {
  if (!isStorageAvailable()) return;
  try {
    const config: StoredToolboxConfig = {
      version: TOOLBOX_SCHEMA_VERSION,
      items: [...items],
    };
    window.localStorage.setItem(TOOLBOX_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // 保存できなくても道具箱はその場では通常動作する
  }
}

/**
 * 保存済み構成を削除する（リセット用）。
 * デフォルト構成を保存し直すのではなくキーごと消すのは、将来デフォルト構成
 * （Phase 10.2 のプリセット）が変わったとき、リセット済みの来訪者へ
 * 新しいデフォルトがそのまま届くようにするため。
 */
export function clearToolboxItems(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(TOOLBOX_STORAGE_KEY);
  } catch {
    // 削除できない環境でも通常動作を続ける
  }
}
