"use client";

/**
 * TileMoveButtons — 編集モード時の移動操作 UI。
 *
 * medium / large サイズ: 4 ボタンを常時表示。
 * small サイズ: 展開トリガーを表示し、クリックで展開パネルを表示。
 *   ヘッダー行が狭いため折りたたみ UI を採用（品質要件: 視覚破綻なし、44px タップ）。
 *
 *   展開パネルは createPortal で document.body 直下に描画する（P1 修正）。
 *   これにより:
 *   - ToolboxShell の tilesContainer に付く inert 属性の影響を回避できる
 *   - タイルの overflow: hidden による視覚クリッピングを回避できる
 *   パネル位置は smallWrapper の getBoundingClientRect() で算出した
 *   position:fixed 座標にアンカーする。
 *
 * アイコンは Lucide スタイル線画 SVG（DESIGN.md §3 準拠）。
 * 絵文字・Unicode 記号は不使用。
 */

import { useState, useEffect, useId, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { TileSize } from "./types";
import styles from "./TileMoveButtons.module.css";

/**
 * 展開パネルの位置を画面内に収める補正関数（Q1 / q1 修正）。
 *
 * createPortal で document.body 直下に position:fixed で描画するため、
 * トリガー要素の getBoundingClientRect() をそのまま使うと
 * 画面右端・下端でパネルがはみ出してしまう。
 * この関数で left / top をクランプして画面内に収める。
 *
 * @param rect - トリガー要素の DOMRect
 * @param panelWidth - 展開パネルの推定幅（px）
 * @param panelHeight - 展開パネルの推定高さ（px）
 * @param margin - 画面端との余白（px、デフォルト 8）
 * @returns { top, left } — 補正後の fixed 座標
 */
function computeClampedPosition(
  rect: DOMRect,
  panelWidth: number,
  panelHeight: number,
  margin = 8,
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 左座標: rect.left を基点にしつつ、右端にはみ出さないようにクランプ
  const left = Math.min(rect.left, vw - panelWidth - margin);

  // 上座標: デフォルトはトリガー直下（rect.bottom + 4px）
  // 下端を超える場合はトリガーの上方向に flip する（q1）
  const belowTop = rect.bottom + 4;
  const aboveTop = rect.top - panelHeight - 4;
  const top =
    belowTop + panelHeight + margin > vh && aboveTop >= margin
      ? aboveTop
      : belowTop;

  return { top, left };
}

/**
 * 展開パネルの推定幅（px）。
 * パネルは 4 移動ボタン（各 44px = 20px + padding 12*2）+ 閉じるボタン（44px）+ gap + padding。
 * 実際の DOM 幅を測ることが最善だが、createPortal 直後は DOM がまだないため推定値を使う。
 * 将来的には panelRef.current.getBoundingClientRect() で実測に切り替えられる。
 */
const PANEL_ESTIMATED_WIDTH = 280;

/** 展開パネルの推定高さ（px） */
const PANEL_ESTIMATED_HEIGHT = 52;

export interface TileMoveButtonsProps {
  /** タイルのサイズ（small のみ折りたたみ展開 UI） */
  size: TileSize;
  /** このタイルがリスト先頭か（true のとき「先頭へ」「前へ」が disabled） */
  isFirst: boolean;
  /** このタイルがリスト末尾か（true のとき「後へ」「末尾へ」が disabled） */
  isLast: boolean;
  /** 先頭へ移動 */
  onMoveFirst: () => void;
  /** 1 つ前へ移動 */
  onMovePrev: () => void;
  /** 1 つ後へ移動 */
  onMoveNext: () => void;
  /** 末尾へ移動 */
  onMoveLast: () => void;
  /**
   * このコンポーネント自身の overlay ID（P1: 自爆防止）。
   * ToolboxShell の openOverlayId にこの値が設定されているときは
   * 「自分自身が開いている」と判断して展開を継続する。
   * 省略時は排他制御を行わない。
   */
  overlayId?: string;
  /**
   * 現在 open 中の overlay の ID（P1: 排他制御）。
   * ToolboxShell → TileGrid → Tile 経由で渡す。
   * - null: どの overlay も開いていない → 展開可能
   * - 自身の overlayId と一致: 自分が開いている → 展開継続
   * - 他の ID: 他の overlay が開いている → 展開不可
   * 省略時は排他制御を行わない（null 扱い）。
   */
  openOverlayId?: string | null;
  /**
   * small サイズ展開パネルの開閉状態変化コールバック（O1: 排他制御）。
   * 展開時に true、閉じるときに false を渡す。
   * 親（Tile → TileGrid）がこれを受け取り setOpenOverlay を呼ぶことで
   * 双方向の overlay 排他制御を実現する。
   */
  onExpandChange?: (expanded: boolean) => void;
}

/** isFirst / isLast のどちらの条件で disabled を判定するかを表す型 */
type DisableCondition = "isFirst" | "isLast";

/** 移動ボタン 4 種の定義 */
const MOVE_ACTIONS: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
  disableOn: DisableCondition;
  handlerKey: "onMoveFirst" | "onMovePrev" | "onMoveNext" | "onMoveLast";
}> = [
  {
    key: "first",
    label: "先頭へ移動",
    /** Lucide chevrons-up 相当の SVG パス */
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="17 11 12 6 7 11" />
        <polyline points="17 18 12 13 7 18" />
      </svg>
    ),
    disableOn: "isFirst" as DisableCondition,
    handlerKey: "onMoveFirst" as const,
  },
  {
    key: "prev",
    label: "前へ移動",
    /** Lucide chevron-up 相当の SVG パス */
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    ),
    disableOn: "isFirst" as DisableCondition,
    handlerKey: "onMovePrev" as const,
  },
  {
    key: "next",
    label: "後へ移動",
    /** Lucide chevron-down 相当の SVG パス */
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    disableOn: "isLast" as DisableCondition,
    handlerKey: "onMoveNext" as const,
  },
  {
    key: "last",
    label: "末尾へ移動",
    /** Lucide chevrons-down 相当の SVG パス */
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="7 6 12 11 17 6" />
        <polyline points="7 13 12 18 17 13" />
      </svg>
    ),
    disableOn: "isLast" as DisableCondition,
    handlerKey: "onMoveLast" as const,
  },
];

/** 4 つの移動ボタンを横並びで表示するサブコンポーネント */
function MoveButtonList({
  isFirst,
  isLast,
  onMoveFirst,
  onMovePrev,
  onMoveNext,
  onMoveLast,
  firstButtonRef,
}: Omit<TileMoveButtonsProps, "size"> & {
  /** 先頭ボタンへの ref（small サイズ展開時のフォーカス自動移動に使用） */
  firstButtonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const handlers = { onMoveFirst, onMovePrev, onMoveNext, onMoveLast };

  return (
    <div className={styles.buttonList} role="group" aria-label="タイルの移動">
      {MOVE_ACTIONS.map((action, index) => (
        <button
          key={action.key}
          ref={index === 0 ? firstButtonRef : undefined}
          type="button"
          className={styles.moveButton}
          aria-label={action.label}
          disabled={action.disableOn === "isFirst" ? isFirst : isLast}
          onClick={handlers[action.handlerKey]}
        >
          <span className={styles.icon}>{action.icon}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * TileMoveButtons — 編集モード移動操作 UI。
 * size="small" 時のみ展開トリガー経由の展開パネル表示、それ以外は常時表示。
 *
 * a11y 対応（small サイズ展開パネル）:
 * - 展開時に先頭ボタン（「先頭へ移動」）へ自動フォーカス
 * - ESC キーで展開パネルを閉じる（O3: expanded=true の時のみ listener 登録）
 * - 閉じた時、展開トリガーにフォーカスを戻す（O2: WAI-ARIA disclosure パターン）
 *
 * 排他制御（P1 修正済み）:
 * - openOverlayId と overlayId で「自分以外が開いているか」を判断（自爆防止）
 * - onExpandChange で親に開閉状態を通知し、双方向排他を実現する
 *
 * portal 化（P1 修正）:
 * - 展開パネルは createPortal で document.body 直下に描画する
 * - ToolboxShell の tilesContainer の inert 属性の影響を回避
 * - タイルの overflow:hidden によるクリッピングを回避
 * - パネル位置は smallWrapper の getBoundingClientRect() で算出した position:fixed
 */
export default function TileMoveButtons({
  size,
  isFirst,
  isLast,
  onMoveFirst,
  onMovePrev,
  onMoveNext,
  onMoveLast,
  overlayId,
  openOverlayId,
  onExpandChange,
}: TileMoveButtonsProps) {
  const [expanded, setExpanded] = useState(false);
  /** 展開パネル内の先頭ボタンへの ref（フォーカス自動移動に使用） */
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  /** 展開トリガーへの ref（閉じた後のフォーカス戻し + パネル位置計算に使用） */
  const triggerRef = useRef<HTMLButtonElement>(null);
  /** smallWrapper への ref（パネル位置計算に使用） */
  const wrapperRef = useRef<HTMLDivElement>(null);
  /** portal パネルの位置 state */
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  /**
   * q3: aria-controls 用の一意 ID（WAI-ARIA disclosure パターン）。
   * React 18+ の useId で SSR/CSR 両方で安定した ID を生成する。
   */
  const panelId = useId();

  /**
   * P1: 他の overlay が開いているかどうかの判定。
   * - openOverlayId が null → 何も開いていない → 自分は展開可能
   * - openOverlayId が overlayId と一致 → 自分が開いている → 展開継続
   * - openOverlayId が他の ID → 他が開いている → 展開不可
   */
  const otherOverlayOpen =
    openOverlayId != null && (overlayId == null || openOverlayId !== overlayId);

  /**
   * 展開状態を変更するヘルパー。
   * setExpanded + onExpandChange を一括して呼び出す。
   */
  const changeExpanded = useCallback(
    (next: boolean) => {
      setExpanded(next);
      onExpandChange?.(next);
    },
    [onExpandChange],
  );

  /**
   * 閉じる処理（O2: 閉じた後は展開トリガーにフォーカスを戻す）。
   * WAI-ARIA disclosure パターン: 閉じた時はトリガーに focus を戻す。
   * 同期的に focus() を呼ぶ（React の state 更新より先に DOM focus を確保）。
   * panelPos もここでリセットする（portal パネルの位置 state クリア）。
   */
  const closePanel = useCallback(() => {
    changeExpanded(false);
    setPanelPos(null);
    triggerRef.current?.focus();
  }, [changeExpanded]);

  /**
   * ESC キーで展開パネルを閉じる（O3: expanded=true の時のみ listener を登録）。
   */
  useEffect(() => {
    if (!expanded) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closePanel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded, closePanel]);

  /**
   * q2: clickoutside で展開パネルを閉じる。
   * expanded=true の時のみリスナーを登録し、
   * パネル自身（panelId）またはトリガー（triggerRef）の外でのクリックで閉じる。
   * mousedown で判定することで blur ベースの課題（スクロールバークリック等）を回避する。
   */
  useEffect(() => {
    if (!expanded) return;
    function handleMouseDown(e: MouseEvent) {
      // パネル要素（portal）の内側クリックは無視
      const panelEl = document.getElementById(panelId);
      if (panelEl && panelEl.contains(e.target as Node)) return;
      // トリガーボタンの内側クリックは無視（トリガー自身の onClick で toggle する）
      if (triggerRef.current && triggerRef.current.contains(e.target as Node))
        return;
      closePanel();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [expanded, closePanel, panelId]);

  /**
   * Q3: resize 時に展開パネルを閉じる（推奨対応）。
   * ToolboxShell の scrollLock 中も、モバイルの仮想キーボード表示などで
   * window.innerHeight が変わることがある。
   * resize イベントで位置再計算するより「閉じる」方が実装がシンプルで安全。
   * expanded=true の時のみリスナーを登録する。
   */
  useEffect(() => {
    if (!expanded) return;
    function handleResize() {
      closePanel();
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [expanded, closePanel]);

  /**
   * Q2: 他の overlay が開いたとき（otherOverlayOpen が true に変化したとき）に
   * expanded を false にリセットする。
   * これにより、AddTileModal が閉じて openOverlayId が null に戻っても
   * expanded=false のままとなり、popover が突然再表示されるバグを防ぐ。
   *
   * React の公式 "derived state" パターン:
   * 前回の otherOverlayOpen を useState で持ち、レンダー中に比較して setState する。
   * useEffect 内での setState（react-hooks/set-state-in-effect lint エラー）を回避できる。
   * また useRef をレンダー中に読み書きすることも避けられる（react-compiler のルール違反を回避）。
   * React のレンダー中 setState は同一レンダーを再実行するため、一時的な中間状態が
   * 画面に表示されることはない（React ドキュメント参照）。
   *
   * onExpandChange(false) は副作用のためレンダー中に呼べない。
   * ここでは state リセットのみ行い、onExpandChange 通知は closePanel() ルートを通る
   * 通常クローズ（ESC / 閉じるボタン）に任せる。
   */
  const [prevOtherOverlayOpen, setPrevOtherOverlayOpen] =
    useState(otherOverlayOpen);
  if (otherOverlayOpen !== prevOtherOverlayOpen) {
    setPrevOtherOverlayOpen(otherOverlayOpen);
    if (otherOverlayOpen && expanded) {
      // false → true の変化かつ展開中: expanded をリセット
      setExpanded(false);
      setPanelPos(null);
    }
  }

  /**
   * isVisible: 実際にパネルを表示するかの最終判定。
   * expanded が true かつ otherOverlayOpen が false のとき表示する。
   * Q2 修正後: otherOverlayOpen=true になるとレンダー中に expanded が false にリセットされるため、
   * isVisible は必ず false になる。otherOverlayOpen が false に戻っても
   * expanded がリセット済みのため、popover が突然再表示されることはない。
   */
  const isVisible = expanded && !otherOverlayOpen;

  /**
   * 展開時に先頭ボタンへフォーカスを移動する（N2）。
   * panelPos が確定（!= null）してから発火させる。
   * panelPos の計算は onClick イベントハンドラ内で行うため、
   * isVisible が true になるより panelPos が確定するのは同じレンダーサイクル後になる。
   */
  useEffect(() => {
    if (isVisible && panelPos && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [isVisible, panelPos]);

  if (size !== "small") {
    // medium / large: 4 ボタンを常時表示
    return (
      <MoveButtonList
        isFirst={isFirst}
        isLast={isLast}
        onMoveFirst={onMoveFirst}
        onMovePrev={onMovePrev}
        onMoveNext={onMoveNext}
        onMoveLast={onMoveLast}
      />
    );
  }

  // small: 展開トリガー + portal 展開パネル
  return (
    <div ref={wrapperRef} className={styles.smallWrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.expandButton}
        aria-label="移動操作を展開"
        aria-expanded={isVisible}
        aria-controls={panelId}
        onClick={() => {
          // P1: 他の overlay が開いている場合は展開しない
          if (otherOverlayOpen) return;
          if (expanded) {
            closePanel();
          } else {
            // 展開パネルの位置計算（portal 化対応）。
            // イベントハンドラ内で getBoundingClientRect() を呼ぶことで
            // useEffect/useLayoutEffect 内での setState（lint エラー）を回避する。
            // 画面端補正: computeClampedPosition で right/bottom はみ出しを防ぐ（Q1 / q1 修正）。
            if (wrapperRef.current) {
              const rect = wrapperRef.current.getBoundingClientRect();
              setPanelPos(
                computeClampedPosition(
                  rect,
                  PANEL_ESTIMATED_WIDTH,
                  PANEL_ESTIMATED_HEIGHT,
                ),
              );
            }
            changeExpanded(true);
          }
        }}
      >
        {/* Lucide more-horizontal 相当 */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
          className={styles.icon}
        >
          <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {/*
       * 展開パネル: createPortal で document.body 直下に描画（P1 修正）。
       * position:fixed で smallWrapper の直下に位置合わせする。
       * body 直下に出すことで:
       * - ToolboxShell の tilesContainer の inert 属性の影響を受けない
       * - タイルの overflow:hidden によるクリッピングを受けない
       * - z-index スタッキングが最前面になる（--z-tile-toolbar 変数を参照）
       *
       * SSR 時は document が存在しないため、portal は CSR でのみ表示される。
       * TileMoveButtons は編集モード時のみ描画されるため SSR 上では問題なし。
       */}
      {isVisible &&
        panelPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id={panelId}
            className={styles.expandedPanel}
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
            }}
          >
            <MoveButtonList
              isFirst={isFirst}
              isLast={isLast}
              onMoveFirst={onMoveFirst}
              onMovePrev={onMovePrev}
              onMoveNext={onMoveNext}
              onMoveLast={onMoveLast}
              firstButtonRef={firstButtonRef}
            />
            {/* 閉じるボタン（aria-label で区別） */}
            <button
              type="button"
              className={styles.closeButton}
              aria-label="移動操作を閉じる"
              onClick={closePanel}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
                className={styles.icon}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
