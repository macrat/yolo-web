import { describe, expect, test, vi } from "vitest";

/**
 * tile-loader のテスト
 *
 * B-2（slug ベース lazy loader 方式）の完了基準を客観確認するテスト群。
 *
 * 【このテストの役割】
 * 1. slug → lazy loader（next/dynamic）の取得経路が機能することを確認する
 * 2. variant 拡張ポイント（variantId）が存在することを示す（Phase 7 の 1 対多サポートの代理指標）
 * 3. 異なる variantId が別キャッシュエントリを持ち、将来的に別コンポーネントを返せることを検証する
 *    （重要 2・3: _getCacheSize() ヘルパーを使ったキャッシュ観測）
 *
 * 【variant 拡張ポイントについて（Phase 2 完了基準「1 対多サポートの方針確定」の代理指標）】
 * design-migration-plan.md Phase 7 では、1 つの slug に複数の表示 variant（例:
 * "compact"/"expanded"、"light"/"rich" など）を対応させる予定がある。
 * Phase 2（本サイクル）では「variant 拡張ポイントの枠を確保」するのみで、
 * 実際の複数 variant の実装は Phase 7（B-314）で行う。
 * このテストでは「variantId を受け取れる型・API の枠が存在すること」を
 * 客観的に確認する fixture として機能する。
 *
 * 【_getCacheSize() によるキャッシュ内部観測（重要 2・3 対応）】
 * tile-loader はテスト専用ヘルパー _getCacheSize() をエクスポートする。
 * これを使って「異なる variantId で getTileComponent を呼ぶと別キャッシュエントリが
 * 積まれること」を検証する。Phase 7 で variant ごとに別コンポーネントを返すよう
 * 拡張した際、メモ化が正しく機能するかの基盤検証としても機能する。
 */

// next/dynamic をモック: テスト環境では実際の動的インポートはせず、
// 引数の loader 関数をラップしたスタブコンポーネントを返す
vi.mock("next/dynamic", () => ({
  default: (_loader: () => Promise<{ default: unknown }>) => {
    // テスト環境では loader 関数を受け取ってスタブを返す
    // （_loader はここでは使わない; Phase 7 で variant 別コンポーネントを
    //   返すよう拡張した際のキャッシュ動作を確認するために引数として受け取る）
    function Stub() {
      return null;
    }
    return Stub;
  },
}));

// モックセットアップ後にインポート
const { getTileComponent, DEFAULT_VARIANT_ID, _getCacheSize } =
  await import("../tile-loader");

describe("getTileComponent — slug ベース lazy loader", () => {
  test("slug に対して loader を返す（非 null）", () => {
    const loader = getTileComponent("json-formatter");
    expect(loader).not.toBeNull();
    expect(typeof loader).toBe("function");
  });

  test("未知の slug に対しても loader を返す（フォールバックコンポーネント）", () => {
    const loader = getTileComponent("unknown-slug-xyz");
    // 未知 slug でも null でなく fallback loader を返す
    expect(loader).not.toBeNull();
    expect(typeof loader).toBe("function");
  });

  test("同一 slug・同一 variantId の loader を複数回呼んでも同じ参照を返す（メモ化）", () => {
    const loaderA = getTileComponent("json-formatter");
    const loaderB = getTileComponent("json-formatter");
    // メモ化により同一参照が返る
    expect(loaderA).toBe(loaderB);
  });
});

/**
 * variant 拡張ポイントのテスト
 *
 * 【Phase 2 完了基準「1 対多サポートの方針確定」の客観確認】
 * TileLoaderOptions.variantId フィールドが存在し、
 * デフォルト variant（DEFAULT_VARIANT_ID）が定義されていることを確認する。
 * Phase 7 で複数 variant を追加する際、このフィールドを使って拡張できる。
 */
describe("variant 拡張ポイント（Phase 7 の 1 対多サポート準備）", () => {
  test("DEFAULT_VARIANT_ID がエクスポートされている", () => {
    // デフォルト variant は Phase 7 以前に使われる単一 variant
    expect(DEFAULT_VARIANT_ID).toBeDefined();
    expect(typeof DEFAULT_VARIANT_ID).toBe("string");
  });

  test("variantId なしで呼び出すと DEFAULT_VARIANT_ID が使われる", () => {
    const loaderDefault = getTileComponent("json-formatter");
    const loaderExplicit = getTileComponent("json-formatter", {
      variantId: DEFAULT_VARIANT_ID,
    });
    // DEFAULT_VARIANT_ID 明示 = variantId 省略の挙動が同一であること（メモ化キー一致）
    expect(loaderDefault).toBe(loaderExplicit);
  });

  test("TileLoaderOptions 型は variantId フィールドを持つ（型テスト）", () => {
    // TileLoaderOptions 型に variantId フィールドが存在することを確認する。
    // 型そのものは実行時に存在しないため、インスタンスを作って動作確認する。
    const options: import("../tile-loader").TileLoaderOptions = {
      variantId: "default",
    };
    expect(options.variantId).toBe("default");
  });

  test("variantId オプションを指定できる（API の枠が機能する）", () => {
    const loaderVariantA = getTileComponent("json-formatter", {
      variantId: "compact",
    });
    // Phase 2 では "compact" が未実装なため "default" と同じ loader を返すことが許容される
    // → この段階では「拡張ポイントの API の枠が存在すること」を確認する
    expect(typeof loaderVariantA).toBe("function");
  });

  test("TileComponentLoader 型が表すものは React コンポーネント（関数）である", () => {
    // 型の存在を実行時でも確認するために型アノテーションを使う
    const loader: import("../tile-loader").TileComponentLoader =
      getTileComponent("json-formatter");
    expect(typeof loader).toBe("function");
  });
});

/**
 * キャッシュ内部観測テスト（重要 2・3 対応）
 *
 * 【検証内容】
 * _getCacheSize() テスト専用ヘルパーを使って、異なる variantId で
 * getTileComponent を呼ぶと別キャッシュエントリが積まれることを確認する。
 *
 * これにより以下の 2 点を実質検証する:
 * - 重要 2: 異なる variantId が独立したキャッシュキー（"slug:variantId"）を持つ
 *   → Phase 7 で variant 別に異なる loader を返す拡張が可能であること
 * - 重要 3: 同一 slug + variantId の 2 回目呼び出しでキャッシュエントリが増えない
 *   → メモ化が機能していること（dynamic() を 2 回呼んでいない）
 *
 * 注意: このテストは別モジュールスコープで実行されるため、上記 describe ブロックで
 * 積まれたキャッシュがすでに存在する状態でカウントする。
 * 比較は絶対値ではなく「呼び出し前後の差分」で行う。
 */
describe("キャッシュ内部観測（_getCacheSize による重要 2・3 検証）", () => {
  test("異なる variantId で呼ぶとキャッシュエントリが増える（slug:variant 単位でメモ化）", () => {
    const slug = "cache-observation-test-slug";

    // 新規 slug・default variant → エントリが 1 増える
    const before = _getCacheSize();
    getTileComponent(slug, { variantId: "default" });
    const afterDefault = _getCacheSize();
    expect(afterDefault).toBe(before + 1);

    // 同じ slug・別 variant（"compact"）→ さらに 1 増える
    getTileComponent(slug, { variantId: "compact" });
    const afterCompact = _getCacheSize();
    expect(afterCompact).toBe(afterDefault + 1);
  });

  test("同一 slug + 同一 variantId の 2 回目呼び出しではキャッシュエントリが増えない（メモ化）", () => {
    const slug = "memoize-verification-test-slug";

    // 1 回目: キャッシュに追加
    getTileComponent(slug, { variantId: "default" });
    const afterFirst = _getCacheSize();

    // 2 回目: 同一キー → キャッシュヒット、エントリ数は変わらない
    getTileComponent(slug, { variantId: "default" });
    const afterSecond = _getCacheSize();
    expect(afterSecond).toBe(afterFirst);
  });

  test("異なる slug でも variantId ごとに独立したキャッシュエントリを持つ", () => {
    const slugA = "independent-slug-a-test";
    const slugB = "independent-slug-b-test";

    const before = _getCacheSize();
    getTileComponent(slugA, { variantId: "default" });
    getTileComponent(slugB, { variantId: "default" });
    const after = _getCacheSize();

    // 2 エントリ追加されているはず
    expect(after).toBe(before + 2);
  });
});
