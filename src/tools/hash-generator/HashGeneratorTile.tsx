"use client";

/**
 * HashGeneratorTile — ハッシュ生成ツールの単一正典タイル
 *
 * cycle-228 T-17 で HashGeneratorPage.tsx を Panel ルートのタイルへ統合したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / sha256 は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（A-6）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（A-2）。
 * - **logic.ts 共有エンジン**: generateHash が唯一のロジック源。再実装・改変禁止。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): テキスト入力 + 出力形式 Select + SHA-1/256/384/512 の4出力カード + コピー
 * - `"sha256"`: SHA-256 のみ表示。出力形式 Select・他アルゴリズムカードは非表示。
 *
 * ## 非同期 race condition 対策
 *
 * 入力変更→ハッシュ生成ボタン→Promise.all（4アルゴリズム）の流れで、
 * 古い入力の Promise が新しい入力の Promise より後に resolve することがある。
 * これを防ぐため「リクエスト世代番号（generation）」をインクリメントし、
 * resolve 時点で世代が一致する場合のみ setState する。
 * また、アンマウント後の setState を避けるため useEffect の cleanup で
 * isMounted フラグを false にする。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力ハッシュ値は <code> 要素で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （<code> 要素は値変化をスクリーンリーダーが読み上げないため）
 *
 * ## 使い方
 *
 * ```tsx
 * // 道具箱や詳細ページから同一エクスポートを描画する（同一性の構造的保証）
 * <HashGeneratorTile variant="full" />
 * <HashGeneratorTile variant="sha256" />
 * ```
 */

import {
  useId,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import ErrorMessage from "@/components/ErrorMessage";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  generateHash,
  HASH_ALGORITHMS,
  type HashAlgorithm,
  type OutputFormat,
} from "./logic";
import styles from "./HashGeneratorTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type HashGeneratorTileVariant = "full" | "sha256";

export interface HashGeneratorTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": テキスト入力 + 出力形式 Select + SHA-1/256/384/512 の4出力カード + コピー
   * - "sha256": SHA-256 のみ表示。出力形式 Select・他アルゴリズムは非表示。
   */
  variant?: HashGeneratorTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
}

export default function HashGeneratorTile({
  variant = "full",
  as = "section",
  className,
}: HashGeneratorTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止）[A-6] ----------
  const uid = useId();
  const inputId = `${uid}-input`;
  const formatId = `${uid}-format`;

  // ---------- variant から表示するアルゴリズムを決定 ----------
  // "sha256": SHA-256 のみ。"full": 全アルゴリズム。
  // useMemo でラップし、useCallback（handleGenerate）の依存配列が安定するようにする。
  const displayAlgorithms = useMemo<HashAlgorithm[]>(
    () => (variant === "sha256" ? ["SHA-256"] : HASH_ALGORITHMS),
    [variant],
  );

  // ---------- State ----------
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("hex");
  const [results, setResults] = useState<HashResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // C-3: ライブリージョン用サマリテキスト（実テキストノード）
  const [statusSummary, setStatusSummary] = useState("");

  // useCopyToClipboard（AP-I11: タイマー cleanup はフック内で実装済み）
  const { copy, copiedKey } = useCopyToClipboard();

  // ---------- race condition ガード ----------
  // 各 handleGenerate 呼び出しに世代番号を付与し、
  // resolve 時点で世代が最新でなければ setState をスキップする。
  // これにより「古い入力の結果が新しい入力の結果を上書きする」競合を防ぐ。
  const generationRef = useRef(0);

  // ---------- アンマウント後 setState 防止 ----------
  // useEffect の cleanup で isMounted を false に設定する（D-4 準拠）。
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ---------- ハッシュ生成ハンドラ ----------
  const handleGenerate = useCallback(async () => {
    // 世代番号をインクリメントし、このリクエストの世代を記録する
    const currentGen = ++generationRef.current;

    setErrorMessage(null);
    if (!input) {
      setResults([]);
      setStatusSummary("");
      return;
    }

    try {
      // 表示するアルゴリズムのみ並行ハッシュ計算
      const hashes = await Promise.all(
        displayAlgorithms.map(async (algo) => ({
          algorithm: algo,
          hash: await generateHash(input, algo, format),
        })),
      );

      // race condition ガード: 世代が変わっていたら（後発リクエストが先に完了していたら）
      // この結果を無視する。アンマウント済みでも無視する（D-4）。
      if (currentGen !== generationRef.current) return;
      if (!isMountedRef.current) return;

      setResults(hashes);
      // C-3: 実テキストノードのサマリを live region に設定する
      setStatusSummary(`${hashes.length}件のハッシュ値を生成しました`);
    } catch {
      // race condition ガード: 世代が変わっていたら無視する
      if (currentGen !== generationRef.current) return;
      if (!isMountedRef.current) return;

      // Web Crypto API エラーを日本語メッセージに変換する（A-4 準拠）
      setResults([]);
      setStatusSummary("");
      setErrorMessage(
        "ハッシュの計算中にエラーが発生しました。お使いの環境ではこの機能が使用できない可能性があります。",
      );
    }
  }, [input, format, displayAlgorithms]);

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）[A-1]
  return (
    <Panel as={as} className={className}>
      {/* テキスト入力欄 */}
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          テキスト入力
        </label>
        <Textarea
          id={inputId}
          variant="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ハッシュ化するテキストを入力..."
          rows={4}
          spellCheck={false}
        />
      </div>

      {/* コントロール行: 出力形式 Select（full のみ）+ 生成ボタン */}
      <div className={styles.controls}>
        {/* variant="sha256" では出力形式 Select を非表示（SHA-256 hex のみ提示） */}
        {variant !== "sha256" && (
          <div className={styles.formatControl}>
            <label htmlFor={formatId} className={styles.formatLabel}>
              出力形式:
            </label>
            <Select
              id={formatId}
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
            >
              <option value="hex">16進数 (Hex)</option>
              <option value="base64">Base64</option>
            </Select>
          </div>
        )}
        <Button variant="primary" onClick={handleGenerate}>
          ハッシュ生成
        </Button>
      </div>

      {/* エラー表示（A-4: 共通部品 ErrorMessage を使用・日本語メッセージ） */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      {/* C-3: ライブリージョン - 実テキストノードのサマリを持つ */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.statusSummary}
      >
        {statusSummary}
      </div>

      {/* ハッシュ結果一覧（displayAlgorithms でフィルタ済み） */}
      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((result) => (
            <div key={result.algorithm} className={styles.resultRow}>
              <span className={styles.algoLabel}>{result.algorithm}</span>
              <code className={styles.hashValue}>{result.hash}</code>
              <Button
                size="small"
                onClick={() => void copy(result.hash, result.algorithm)}
                disabled={!result.hash}
                aria-label={
                  copiedKey === result.algorithm
                    ? `${result.algorithm}のハッシュ値: ${COPIED_LABEL}`
                    : `${result.algorithm}のハッシュ値をコピー`
                }
              >
                {copiedKey === result.algorithm ? COPIED_LABEL : "コピー"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
