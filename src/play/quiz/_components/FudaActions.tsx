"use client";

/**
 * 結果の札の画像を保存・共有するボタン。解き終えた画面の「この結果を共有」の区画に、文の共有のボタンと並べて置く。
 * 札の画像の固定 URL を持つのが character-personality だけなので、この診断に限って置く。知らせの文は自分では
 * 出さず、onNoticeChange で区画に渡し、区画の知らせの行（ShareButtons）に1つにまとめて出す。
 *
 * 画像は固定 URL の Route Handler から取る:
 *   GET /play/character-personality/result/<resultId>/fuda-image → image/png（ビルド時に描く）
 * 結果のページの og:image と保存する画像は、同じ描き方の同じ画像である。
 *
 * 計測: 来訪者が終えた操作だけを数える。
 * - 共有: canShare({files}) が真なら navigator.share({files}) を終えたときに trackShare("web_share",…,"fuda")。
 *   できない端末では URL をコピーし、写せたときに trackShare("clipboard",…,"fuda")。
 *   共有シートを閉じただけのときと失敗したときは数えない。
 * - 保存: アンカーの download 属性を持つブラウザ（iOS の Safari は 13 から持つ）では、Blob を createObjectURL
 *   にしてダウンロードし trackSave(…,"download","fuda")。持たないブラウザでは navigator.share({files}) で
 *   共有シートの保存へ進み、終えたときに trackSave(…,"web_share_files","fuda")（数の読み方は ADR002）。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { trackSave, trackShare } from "@/lib/analytics";
import { copyText } from "@/lib/clipboard";
import { SHARE_LABELS } from "@/lib/share-labels";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import Button from "@/components/Button";
import styles from "./FudaActions.module.css";

interface FudaActionsProps {
  /** 結果タイプの ID（札画像の固定 URL とファイル名に使う）。 */
  resultId: string;
  /** 結果タイプ名（共有テキストに使う）。 */
  resultTitle: string;
  /** 診断の名前（短い名前があればそれ）。共有シートの題と共有の文で言う。 */
  quizName: string;
  /** 診断の slug（content_id と共有 URL の生成に使う。character-personality を想定）。 */
  quizSlug: string;
  /** 知らせの文（文ごとに分けたもの）が変わったときに呼ぶ。知らせが無いときは空の並びを渡す。 */
  onNoticeChange: (sentences: string[]) => void;
}

/** 札の画像を保存・共有する診断の contentType（GA4）。 */
const CONTENT_TYPE = "diagnosis";

/** アンカーの download 属性で、Blob をファイルとして保存できるか。 */
function isAnchorDownloadSupported(): boolean {
  if (typeof document === "undefined") return false;
  return "download" in document.createElement("a");
}

export default function FudaActions({
  resultId,
  resultTitle,
  quizName,
  quizSlug,
  onNoticeChange,
}: FudaActionsProps) {
  // 画像を用意しているあいだ。二度押しで画像を2回取らないよう、押したボタンの処理を先に進めない。ボタンは
  // 無効にしない。無効のボタンはフォーカスを受けないので、キーボードで押したときにフォーカスがページの頭に落ちる。
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  // 知らせの文（コピーした・写せなかった・画像を用意できなかった）。
  const [status, setStatus] = useState<
    "idle" | "copied" | "copyFailed" | "error"
  >("idle");

  const contentId = contentIdForQuiz(quizSlug);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/${quizSlug}/result/${resultId}`
      : `/play/${quizSlug}/result/${resultId}`;
  const shareText = `${quizName}の結果は「${resultTitle}」でした！`;

  /**
   * 固定 URL から札の PNG を取って File にする。取れなかったとき（!res.ok・通信の失敗）は例外を投げ、
   * 呼び出し側が知らせの文で伝える。
   */
  const fetchFudaFile = useCallback(async (): Promise<File> => {
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

  /** 画像を用意するあいだを busy にして action を走らせる。用意しているあいだに押されたら何もしない。 */
  const runExclusively = useCallback(
    async (action: () => Promise<void>): Promise<void> => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setStatus("idle");
      try {
        await action();
      } catch {
        setStatus("error");
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [],
  );

  const handleSave = useCallback(
    () =>
      runExclusively(async () => {
        const file = await fetchFudaFile();

        if (isAnchorDownloadSupported()) {
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

        // アンカーの download 属性を持たないブラウザは、共有シートの保存へ進む。
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: quizName,
              text: shareText,
              url: shareUrl,
            });
            trackSave(contentId, CONTENT_TYPE, "web_share_files", "fuda");
          } catch {
            // 共有シートを閉じただけのときは数えない。
          }
          return;
        }

        setStatus("error");
      }),
    [runExclusively, fetchFudaFile, contentId, quizName, shareText, shareUrl],
  );

  const handleShare = useCallback(
    () =>
      runExclusively(async () => {
        const file = await fetchFudaFile();

        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: quizName,
              text: shareText,
              url: shareUrl,
            });
            trackShare("web_share", CONTENT_TYPE, contentId, "fuda");
          } catch {
            // 共有シートを閉じただけのときは数えない。
          }
          return;
        }

        // 画像を共有できない端末では、結果のページの URL をコピーする。
        if (await copyText(shareUrl)) {
          setStatus("copied");
          trackShare("clipboard", CONTENT_TYPE, contentId, "fuda");
        } else {
          setStatus("copyFailed");
        }
      }),
    [runExclusively, fetchFudaFile, contentId, quizName, shareText, shareUrl],
  );

  // 知らせの文。1行に収まらないとき文のあいだで折るよう、文ごとに分けて持つ。
  const noticeKey = busy ? "busy" : status;
  useEffect(() => {
    const sentences: Record<typeof noticeKey, string[]> = {
      busy: ["画像を用意しています。"],
      idle: [],
      copied: ["リンクをコピーしました"],
      copyFailed: [
        "リンクをコピーできませんでした。",
        "ほかの共有先をお使いください",
      ],
      error: [
        "画像を用意できませんでした。",
        "時間をおいて再度お試しください。",
      ],
    };
    onNoticeChange(sentences[noticeKey]);
  }, [noticeKey, onNoticeChange]);

  return (
    <div className={styles.buttons}>
      <Button
        variant="primary"
        onClick={handleSave}
        phrases={SHARE_LABELS.saveImage.phrases}
      />
      <Button onClick={handleShare} phrases={SHARE_LABELS.shareImage.phrases} />
    </div>
  );
}
