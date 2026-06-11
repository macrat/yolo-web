"use client";

/**
 * PasswordGeneratorTile — パスワード生成の単一正典タイル
 *
 * cycle-228 T-11 で PasswordGeneratorPage.tsx をタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>（DESIGN.md §1 準拠）。
 * - **1ツール 1 タイル = variant="full" のみ**: password-generator はロジックに
 *   独立モード（encode/decode 等）がないため full のみ。variant を無理に増やさない。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（[A-6] 準拠）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（[A-2] 準拠）。
 * - **logic.ts 共有エンジン**: generatePassword / evaluateStrength が唯一のロジック源。
 *   再実装・改変禁止。
 *
 * ## hydration 安全性
 *
 * crypto.getRandomValues() は SSR とクライアントで異なる値を返すため、
 * useState の初期値を "" にし、useEffect（クライアントのみ）でマウント後に生成する。
 * これにより SSR と CSR の初期 HTML が一致し hydration エラーが防がれる。
 * 道具箱で複数インスタンスが同居する場合も、各インスタンスが独立した useEffect を持つ
 * ためそれぞれ独立に生成される。
 *
 * ## 秘密情報配慮の ARIA 設計
 *
 * - パスワード <code> 要素に aria-live を付与しない（盗み聞きリスク回避）
 * - 強度ラベル側にのみ role="status" aria-live="polite" を付与
 *   （「強い」「弱い」等は秘密情報ではない）
 */

import { useState, useEffect, useCallback, useRef, useId } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";
import ToggleSwitch from "@/components/ToggleSwitch";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  generatePassword,
  evaluateStrength,
  DEFAULT_OPTIONS,
  type PasswordOptions,
  type PasswordStrength,
} from "./logic";
import styles from "./PasswordGeneratorTile.module.css";

/** 強度ラベル日本語表記 */
const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: "弱い",
  fair: "普通",
  good: "良い",
  strong: "強い",
};

/** 強度バー幅（%）: 4 段階均等分割 */
const STRENGTH_BAR_WIDTH: Record<PasswordStrength, string> = {
  weak: "25%",
  fair: "50%",
  good: "75%",
  strong: "100%",
};

/** 文字種が1種類も選択されていないかどうかを判定する */
function isNoCharsetSelected(options: PasswordOptions): boolean {
  return (
    !options.uppercase &&
    !options.lowercase &&
    !options.digits &&
    !options.symbols
  );
}

/** 強度ラベルの CSS クラス名マッピング */
const strengthLabelClassMap: Record<PasswordStrength, string> = {
  weak: styles.strengthValueWeak,
  fair: styles.strengthValueFair,
  good: styles.strengthValueGood,
  strong: styles.strengthValueStrong,
};

/** 強度バーフィルの CSS クラス名マッピング */
const strengthFillClassMap: Record<PasswordStrength, string> = {
  weak: styles.strengthMeterFillWeak,
  fair: styles.strengthMeterFillFair,
  good: styles.strengthMeterFillGood,
  strong: styles.strengthMeterFillStrong,
};

/** variant prop: 表示バリエーション（全機能を持つ full のみ）*/
export type PasswordGeneratorTileVariant = "full";

export interface PasswordGeneratorTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 長さスライダー・4文字種ToggleSwitch・強度メーター・生成・コピーの全機能
   * logic に独立モードがないため full のみ（variant を無理にひねり出さない）
   */
  variant?: PasswordGeneratorTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function PasswordGeneratorTile({
  // variant は現状 "full" のみ。将来バリエーションを追加する際に利用。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = "full",
  as = "section",
  className,
}: PasswordGeneratorTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止）[A-6] ----------
  const uid = useId();
  const lengthSliderId = `${uid}-length`;

  // ---------- State ----------
  /**
   * hydration 安全性:
   * useState の初期値を空文字列にする。
   * generatePassword は crypto.getRandomValues を使うため SSR と CSR で異なる値を返す。
   * useEffect（クライアントのみで実行）でマウント後に自動生成することで
   * SSR の初期 HTML と CSR の初期 HTML が一致し hydration エラーが防がれる。
   */
  const [password, setPassword] = useState<string>("");
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);

  // クライアントのみ: マウント後に初回パスワードを自動生成
  // useEffect 内での setState は通常避けるべきだが、
  // crypto.getRandomValues() は SSR と CSR で異なる値を返すため
  // 初期値を useState の遅延初期化で設定すると hydration 不整合が発生する。
  // useEffect 内での初期化（クライアントのみで実行）が唯一の安全な方法。
  const initialGenRef = useRef(false);
  useEffect(() => {
    if (!initialGenRef.current) {
      initialGenRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(generatePassword(DEFAULT_OPTIONS));
    }
  }, []);

  // useCopyToClipboard フック（AP-I11: タイマー cleanup はフック内で実装済み）
  const { copy, copiedKey } = useCopyToClipboard();
  const isCopied = Boolean(copiedKey);

  // 強度: options 変更のたびに動的に再計算（全文字種 OFF 時も正しく weak を返す）
  const strength = evaluateStrength(options);

  // 全文字種 OFF の判定（UX是正: charset=空の生成を防ぐ・エラー表示）
  const noCharset = isNoCharsetSelected(options);

  /** パスワード生成ハンドラ */
  const handleGenerate = useCallback(() => {
    const pw = generatePassword(options);
    setPassword(pw);
  }, [options]);

  /** コピーハンドラ */
  const handleCopy = useCallback(async () => {
    if (!password) return;
    await copy(password);
  }, [copy, password]);

  /** オプション更新ヘルパー */
  const updateOption = useCallback(
    <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）[A-1]
  return (
    <Panel as={as} className={className}>
      {/* オプション群 */}
      <div className={styles.optionsSection}>
        {/* 文字数スライダー */}
        <div className={styles.lengthControl}>
          <label htmlFor={lengthSliderId} className={styles.lengthLabel}>
            文字数: {options.length}
          </label>
          <input
            id={lengthSliderId}
            type="range"
            min={8}
            max={128}
            value={options.length}
            onChange={(e) =>
              updateOption("length", parseInt(e.target.value, 10))
            }
            className={styles.slider}
          />
        </div>

        {/* DESIGN.md §5: ON/OFF を切り替えるフォーム要素は原則としてトグルスイッチを使う */}
        <div className={styles.toggleGroup}>
          <ToggleSwitch
            label="大文字 (A-Z)"
            checked={options.uppercase}
            onChange={(e) => updateOption("uppercase", e.target.checked)}
          />
          <ToggleSwitch
            label="小文字 (a-z)"
            checked={options.lowercase}
            onChange={(e) => updateOption("lowercase", e.target.checked)}
          />
          <ToggleSwitch
            label="数字 (0-9)"
            checked={options.digits}
            onChange={(e) => updateOption("digits", e.target.checked)}
          />
          <ToggleSwitch
            label="記号 (!@#$...)"
            checked={options.symbols}
            onChange={(e) => updateOption("symbols", e.target.checked)}
          />
          <ToggleSwitch
            label="紛らわしい文字を除外 (O/0, I/l/1)"
            checked={options.excludeAmbiguous}
            onChange={(e) => updateOption("excludeAmbiguous", e.target.checked)}
          />
        </div>
      </div>

      {/* UX是正: 全文字種OFFのエラーフィードバック */}
      {noCharset && (
        <ErrorMessage message="使用する文字の種類を 1 つ以上選んでください" />
      )}

      {/* 強度バー
       * [C-3]: role="status" aria-live="polite" に実テキストノードのサマリを配置
       * evaluateStrength(options) により options 変更で動的に更新される
       * 秘密情報配慮: パスワード <code> ではなく強度ラベル側のみに role="status" を付与
       * UX是正: 全文字種OFFのとき「—」を表示し「弱い」誤表示を防ぐ */}
      <div role="status" aria-live="polite" className={styles.strengthSection}>
        <div className={styles.strengthLabelRow}>
          <span>強度:</span>
          {noCharset ? (
            <span className={styles.strengthValueDisabled}>—</span>
          ) : (
            <span className={strengthLabelClassMap[strength]}>
              {STRENGTH_LABELS[strength]}
            </span>
          )}
        </div>
        {!noCharset && (
          <div className={styles.strengthMeterTrack}>
            <div
              className={`${styles.strengthMeterFill} ${strengthFillClassMap[strength]}`}
              style={{ width: STRENGTH_BAR_WIDTH[strength] }}
            />
          </div>
        )}
      </div>

      {/* 生成ボタン
       * UX是正: 全文字種OFFのとき無効化（charset=空の生成を防ぐ） */}
      <div className={styles.generateButton}>
        <Button variant="primary" onClick={handleGenerate} disabled={noCharset}>
          パスワード生成
        </Button>
      </div>

      {/* 結果表示
       * コピーボタンあり（持ち帰り対象）
       * password が空のとき コピーボタンを disabled にする */}
      <div className={styles.resultSection}>
        <div className={styles.resultDisplay}>
          {/* 秘密情報配慮: aria-live は付与しない */}
          <code className={styles.passwordCode}>{password}</code>

          <div className={styles.copyButtonWrap}>
            <Button
              variant="default"
              size="small"
              disabled={!password}
              onClick={handleCopy}
            >
              {isCopied ? COPIED_LABEL : "コピー"}
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
