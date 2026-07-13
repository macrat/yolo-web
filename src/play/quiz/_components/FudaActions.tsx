"use client";

/**
 * FudaActions — 「札（結果画像）」の保存/共有アクション（DESIGN.md §4「札」/§7「見せたくなる結果」）。
 *
 * character-personality の結果面（本人向け ResultCard の勲章=Tsutsumi 直下）に置く、
 * 「完走した本人が自分の札を持ち帰る」ための主アクション（cycle-280 設計 §3 / PM判断5）。
 * 適用は character-personality に限定する（他 personality 診断への展開は効果測定後）。
 *
 * 画像は固定 URL の Route Handler（タスクB）から取得する：
 *   GET /play/character-personality/result/<resultId>/fuda-image → image/png（SSGプリレンダ）
 * メタプレビュー（og:image）と保存画像は同一レンダラ＝単一の真実。
 *
 * 計測（B-551）: 実際に完了したアクションだけを計上する。
 * - 共有: canShare({files}) 対応なら navigator.share({files}) 成功時に trackShare("web_share",…,"fuda")。
 *   非対応/未定義なら URL を clipboard コピーし、成功時 trackShare("clipboard",…,"fuda")。
 *   共有シートのキャンセル/失敗では計上しない。
 * - 保存: 既定は Blob→createObjectURL→アンカー download で保存し trackSave(…,"download","fuda")。
 *   アンカー download 非対応環境（iOS Safari 等）は navigator.share({files}) 経由の保存に寄せ、
 *   成功時 trackSave(…,"web_share_files","fuda")（ADR002 に指標解釈の注記あり）。
 */

import { useCallback, useState } from "react";
import { trackSave, trackShare } from "@/lib/analytics";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import styles from "./FudaActions.module.css";

interface FudaActionsProps {
  /** 結果タイプの ID（札画像の固定 URL とファイル名に使う）。 */
  resultId: string;
  /** 結果タイプ名（共有テキストに使う）。 */
  resultTitle: string;
  /** 診断のタイトル（共有タイトル/テキストに使う）。 */
  quizTitle: string;
  /** 診断の slug（content_id と共有 URL の生成に使う。character-personality を想定）。 */
  quizSlug: string;
}

/** 札画像を共有/保存の対象とする診断の contentType（GA4）。 */
const CONTENT_TYPE = "diagnosis";

/** 見出し（この結果を札として持ち帰る）の id。ボタン群が aria-describedby で参照する。 */
const LABEL_ID = "fuda-actions-label";

/**
 * アンカーの download 属性が使えるか（＝Blob をファイルとして保存できるか）。
 * iOS Safari 等の非対応環境は false になり、navigator.share({files}) 経由へ寄せる。
 */
function isAnchorDownloadSupported(): boolean {
  if (typeof document === "undefined") return false;
  return "download" in document.createElement("a");
}

export default function FudaActions({
  resultId,
  resultTitle,
  quizTitle,
  quizSlug,
}: FudaActionsProps) {
  // busy: 取得〜アクション完了までの間ボタンを無効化して多重押下を防ぐ。
  const [busy, setBusy] = useState(false);
  // status: aria-live で読み上げる一時メッセージ（コピー完了/エラー）。
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const contentId = contentIdForQuiz(quizSlug);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/${quizSlug}/result/${resultId}`
      : `/play/${quizSlug}/result/${resultId}`;
  const shareText = `${quizTitle}の結果は「${resultTitle}」でした!`;

  /**
   * 固定 URL から札 PNG を取得して File 化する。
   * 取得失敗（!res.ok / ネットワーク）は例外を投げ、呼び出し側でエラー表示にする
   * （握りつぶさない・UI は壊さない）。
   */
  const fetchFudaFile = useCallback(async (): Promise<File> => {
    // 画像は character-personality 固有の Route Handler にのみ存在する（本コンポーネントは
    // character-personality 限定）。slug ではなく固定パスで取得する。
    const res = await fetch(
      `/play/character-personality/result/${resultId}/fuda-image`,
    );
    if (!res.ok) {
      throw new Error(`fuda-image fetch failed: ${res.status}`);
    }
    const blob = await res.blob();
    return new File([blob], `yolos-character-personality-${resultId}.png`, {
      type: "image/png",
    });
  }, [resultId]);

  const handleSave = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setStatus("idle");
    try {
      const file = await fetchFudaFile();

      if (isAnchorDownloadSupported()) {
        // 既定：Blob をアンカー download で保存（irodori downloadImage と同型）。
        const objectUrl = URL.createObjectURL(file);
        try {
          const a = document.createElement("a");
          a.href = objectUrl;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
        trackSave(contentId, CONTENT_TYPE, "download", "fuda");
        return;
      }

      // download 非対応（iOS Safari 等）：共有シート経由の保存に寄せる。
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: quizTitle,
            text: shareText,
            url: shareUrl,
          });
          // 成功（キャンセルは reject）時のみ計上する。
          trackSave(contentId, CONTENT_TYPE, "web_share_files", "fuda");
        } catch {
          // ユーザーがキャンセル/失敗：計上しない。
        }
        return;
      }

      // 保存手段が無い環境：正直にエラー表示（握りつぶさない）。
      setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }, [busy, fetchFudaFile, contentId, quizTitle, shareText, shareUrl]);

  const handleShare = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setStatus("idle");
    try {
      const file = await fetchFudaFile();

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: quizTitle,
            text: shareText,
            url: shareUrl,
          });
          // 成功（キャンセルは reject）時のみ計上する。
          trackShare("web_share", CONTENT_TYPE, contentId, "fuda");
        } catch {
          // ユーザーがキャンセル/失敗：計上しない。
        }
        return;
      }

      // ファイル共有 非対応/未定義：URL を clipboard にコピーしてフォールバック。
      try {
        await navigator.clipboard.writeText(shareUrl);
        setStatus("copied");
        trackShare("clipboard", CONTENT_TYPE, contentId, "fuda");
      } catch {
        // コピーも失敗：計上しない。UI は壊さずエラー表示に留める。
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }, [busy, fetchFudaFile, contentId, quizTitle, shareText, shareUrl]);

  const statusMessage =
    status === "copied"
      ? "リンクをコピーしました!"
      : status === "error"
        ? "画像を用意できませんでした。時間をおいて再度お試しください。"
        : "";

  return (
    <div className={styles.wrapper}>
      {/* 見出しをボタン群と aria-describedby で結びつけ、支援技術で「何をする札か」を伝える。 */}
      <p id={LABEL_ID} className={styles.label}>
        この結果を札として持ち帰る
      </p>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={busy}
          aria-busy={busy}
          aria-describedby={LABEL_ID}
        >
          保存
        </button>
        <button
          type="button"
          className={styles.shareButton}
          onClick={handleShare}
          disabled={busy}
          aria-busy={busy}
          aria-describedby={LABEL_ID}
        >
          共有
        </button>
      </div>
      {/* role="status" は暗黙で aria-live="polite" を持つため冗長指定はしない（ライブ領域は残す）。 */}
      <div className={styles.status} role="status">
        {statusMessage}
      </div>
    </div>
  );
}
