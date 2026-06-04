"use client";

/**
 * PasswordGeneratorPage — password-generator ツールのフル機能単一実装
 *
 * 収束チェックリスト適合:
 * - A-6: useCopyToClipboard + COPIED_LABEL 使用
 * - A-8: ToolPageLayout は page.tsx 側で使用（本コンポーネントは children 相当）
 * - B-1〜B-8: DESIGN トークン準拠（PasswordGeneratorPage.module.css 参照）
 * - C-3: role="status" aria-live="polite" に実テキストノードのサマリを配置
 *         パスワード <code> 要素への aria-live は秘密情報配慮のため不付与
 * - D-4: AP-I11 — useCopyToClipboard フック内で setTimeout cleanup 済み
 *
 * 個別論点の解消:
 * - ①-6: 強度バーが options 変更に応じて動的に更新される（evaluateStrength(options) を呼ぶ）
 * - ①-15/B-469: hydration 不整合の是正
 *   useState の初期値を空文字列にし、useEffect でクライアントのみ generatePassword を呼ぶ。
 *   これにより SSR と CSR の初期 HTML が一致し hydration エラーが発生しない。
 * - ②-11: チェックボックス → ToggleSwitch コンポーネントへ切り替え
 *   DESIGN.md §5「ON/OFF を切り替えるフォーム要素は原則としてトグルスイッチを使う」に準拠
 *
 * コピーボタン方針:
 * T-4b 確定: password-generator はコピー「あり」（持ち帰り対象）
 * 出力が空のときは disabled、非空のときは有効。
 *
 * 秘密情報配慮の ARIA 設計:
 * - パスワード <code> 要素に aria-live を付与しない（盗み聞きリスク回避）
 * - 強度ラベル側にのみ role="status" aria-live="polite" を付与
 *   （「強い」「弱い」等は秘密情報ではない）
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Button from "@/components/Button";
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
import styles from "./PasswordGeneratorPage.module.css";

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

export default function PasswordGeneratorPage() {
  /**
   * ①-15/B-469 hydration 不整合の是正:
   * useState の初期値を空文字列にする。
   * generatePassword は crypto.getRandomValues を使うため SSR と CSR で異なる値を返す。
   * useEffect（クライアントのみで実行）でマウント後に自動生成することで
   * SSR の初期 HTML と CSR の初期 HTML が一致し hydration エラーが防がれる。
   */
  const [password, setPassword] = useState<string>("");
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);

  /**
   * AP-I11: タイマー ID を useRef で保持し unmount 時に clearTimeout する。
   * ただし useCopyToClipboard フックが内部で AP-I11 を実装済みのため、
   * コピータイマーの管理はフックに委譲する。
   * ここでは「マウント後自動生成」の実装には useEffect のみ使用。
   */

  // ①-15 クライアントのみ: マウント後に初回パスワードを自動生成
  // useEffect内でのsetStateは通常避けるべきだが、
  // crypto.getRandomValues()はSSRとCSRで異なる値を返すため
  // 初期値をuseStateの遅延初期化で設定するとhydration不整合が発生する。
  // useEffect内での初期化（クライアントのみで実行）が唯一の安全な方法。
  // 参考: docs/knowledge/nextjs.md §4 OK パターン（空依存 = マウント時1回）
  const initialGenRef = useRef(false);
  useEffect(() => {
    if (!initialGenRef.current) {
      initialGenRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(generatePassword(DEFAULT_OPTIONS));
    }
  }, []);

  // A-6: useCopyToClipboard フック使用
  const { copy, copiedKey } = useCopyToClipboard();
  const isCopied = Boolean(copiedKey);

  /**
   * ①-6 強度バーの動的更新:
   * evaluateStrength(options) を呼ぶことで、オプション変更のたびに強度が動的に再計算される。
   * Component.tsx では `evaluateStrength(options)` を使っており、これを継承する。
   */
  const strength = evaluateStrength(options);

  /** パスワード生成ハンドラ */
  const handleGenerate = useCallback(() => {
    const pw = generatePassword(options);
    setPassword(pw);
  }, [options]);

  /** コピーハンドラ (A-6) */
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

  return (
    <div className={styles.container}>
      {/* オプション群 */}
      <div className={styles.optionsSection}>
        {/* 文字数スライダー */}
        <div className={styles.lengthControl}>
          <label htmlFor="pg-length" className={styles.lengthLabel}>
            文字数: {options.length}
          </label>
          <input
            id="pg-length"
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

        {/* ②-11: チェックボックス → ToggleSwitch
         * DESIGN.md §5「ON/OFF を切り替えるフォーム要素は原則としてトグルスイッチを使う」 */}
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

      {/* 強度バー
       * C-3: role="status" aria-live="polite" に実テキストノードのサマリを配置
       * ①-6: evaluateStrength(options) により options 変更で動的に更新される
       * 秘密情報配慮: パスワード <code> ではなく強度ラベル側のみに role="status" を付与 */}
      <div role="status" aria-live="polite" className={styles.strengthSection}>
        <div className={styles.strengthLabelRow}>
          <span>強度:</span>
          <span className={strengthLabelClassMap[strength]}>
            {STRENGTH_LABELS[strength]}
          </span>
        </div>
        <div className={styles.strengthMeterTrack}>
          <div
            className={`${styles.strengthMeterFill} ${strengthFillClassMap[strength]}`}
            style={{ width: STRENGTH_BAR_WIDTH[strength] }}
          />
        </div>
      </div>

      {/* 生成ボタン (B-489 Button コンポーネント使用) */}
      <div className={styles.generateButton}>
        <Button variant="primary" onClick={handleGenerate}>
          パスワード生成
        </Button>
      </div>

      {/* 結果表示
       * T-4b: コピーボタンあり（持ち帰り対象）
       * E-7: password が空のとき コピーボタンを disabled にする */}
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
    </div>
  );
}
