"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  RegexResult,
  RegexWorkerRequest,
  RegexWorkerResponse,
} from "./logic";

/** タイムアウト時間（ミリ秒）。ReDoSパターンの実行をこの時間で打ち切る */
const WORKER_TIMEOUT_MS = 500;

/** 入力変更後にWorker起動を遅延させるデバウンス時間（ミリ秒） */
const DEBOUNCE_MS = 300;

/** タイムアウト時にユーザーに表示するエラーメッセージ */
const TIMEOUT_ERROR_MESSAGE =
  "処理がタイムアウトしました（0.5秒）。パターンが複雑すぎる可能性があります。パターンを見直してください。";

/**
 * Inline Worker のソースコード。
 *
 * バンドラー（Turbopack）に依存しないよう、Worker処理を文字列として定義し
 * Blob URL 経由で Worker を生成する。logic.ts の testRegex / replaceWithRegex
 * のロジックをインライン展開している。
 *
 * 重要: logic.ts のロジックを変更した場合、このコードも同期を保つこと。
 */
const WORKER_CODE = `
'use strict';

var MAX_INPUT_LENGTH = 10000;
var MAX_MATCHES = 1000;

function testRegex(pattern, flags, testString) {
  if (!pattern) {
    return { success: true, matches: [] };
  }
  if (testString.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      matches: [],
      error: '入力テキストが長すぎます（最大' + MAX_INPUT_LENGTH.toLocaleString() + '文字）'
    };
  }
  try {
    var regex = new RegExp(pattern, flags);
    var matches = [];
    if (flags.indexOf('g') !== -1) {
      var match;
      var count = 0;
      while ((match = regex.exec(testString)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: Array.prototype.slice.call(match, 1)
        });
        count++;
        if (count >= MAX_MATCHES) break;
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      var match = regex.exec(testString);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: Array.prototype.slice.call(match, 1)
        });
      }
    }
    return { success: true, matches: matches };
  } catch (e) {
    return {
      success: false,
      matches: [],
      error: e instanceof Error ? e.message : 'Invalid regex pattern'
    };
  }
}

function replaceWithRegex(pattern, flags, testString, replacement) {
  if (!pattern) {
    return { success: true, output: testString };
  }
  if (testString.length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      output: '',
      error: '入力テキストが長すぎます（最大' + MAX_INPUT_LENGTH.toLocaleString() + '文字）'
    };
  }
  try {
    var regex = new RegExp(pattern, flags);
    var output = testString.replace(regex, replacement);
    return { success: true, output: output };
  } catch (e) {
    return {
      success: false,
      output: '',
      error: e instanceof Error ? e.message : 'Invalid regex pattern'
    };
  }
}

self.addEventListener('message', function(e) {
  var data = e.data;
  if (data.type === 'match') {
    var result = testRegex(data.pattern, data.flags, data.testString);
    self.postMessage({ type: 'match', matchResult: result });
  } else if (data.type === 'replace') {
    var result = replaceWithRegex(data.pattern, data.flags, data.testString, data.replacement || '');
    self.postMessage({ type: 'replace', replaceResult: result });
  }
});
`;

/**
 * Blob URL から Inline Worker を生成するヘルパー。
 * バンドラーに依存しないため、Turbopack / webpack どちらでも動作する。
 */
function createInlineWorker(): Worker {
  const blob = new Blob([WORKER_CODE], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  // Worker 生成後は Blob URL を解放しても Worker は動作し続ける
  URL.revokeObjectURL(url);
  return worker;
}

interface UseRegexWorkerOptions {
  pattern: string;
  flags: string;
  testString: string;
  replacement: string;
  showReplace: boolean;
}

interface UseRegexWorkerResult {
  matchResult: RegexResult | null;
  replaceResult: { success: boolean; output: string; error?: string } | null;
  isProcessing: boolean;
}

/** パターンが空のときに返すデフォルトの match 結果 */
const EMPTY_MATCH_RESULT: RegexResult = { success: true, matches: [] };

/**
 * 正規表現のテスト処理を Web Worker で非同期実行するカスタムフック。
 *
 * - ReDoS パターンによるブラウザフリーズを防止するため、Worker をタイムアウト付きで実行する
 * - 入力変更時はデバウンスを適用し、Worker の起動頻度を抑える
 * - 前回のリクエストが進行中の場合はキャンセルしてから新しい Worker を起動する
 * - パターンが空の場合は Worker を起動せず即座にデフォルト結果を返す
 */
export function useRegexWorker({
  pattern,
  flags,
  testString,
  replacement,
  showReplace,
}: UseRegexWorkerOptions): UseRegexWorkerResult {
  // Worker から返された結果を保持する state（パターンが空でない場合に使用）
  const [workerMatchResult, setWorkerMatchResult] =
    useState<RegexResult | null>(null);
  const [workerReplaceResult, setWorkerReplaceResult] = useState<{
    success: boolean;
    output: string;
    error?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 進行中の Worker とタイマーを追跡するための ref
  const activeWorkerRef = useRef<Worker | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 進行中のWorkerとタイマーをすべてクリーンアップする */
  const cleanup = useCallback(() => {
    if (activeWorkerRef.current) {
      activeWorkerRef.current.terminate();
      activeWorkerRef.current = null;
    }
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    // パターンが空の場合は Worker を起動しない。
    // 結果はレンダー時に直接計算するため、ここではクリーンアップのみ行う。
    if (!pattern) {
      cleanup();
      return;
    }

    // デバウンス: 前回のデバウンスタイマーをクリアして新しいタイマーを設定
    if (debounceIdRef.current !== null) {
      clearTimeout(debounceIdRef.current);
    }

    debounceIdRef.current = setTimeout(() => {
      // 前回の Worker が進行中ならキャンセル
      cleanup();

      setIsProcessing(true);

      // match リクエスト用の結果追跡
      let matchDone = false;
      let replaceDone = !showReplace; // replace が不要なら完了扱い
      let localMatchResult: RegexResult | null = null;
      let localReplaceResult: {
        success: boolean;
        output: string;
        error?: string;
      } | null = null;
      let timedOut = false;

      const worker = createInlineWorker();
      activeWorkerRef.current = worker;

      /** 両方の結果が揃ったら（またはタイムアウトしたら）完了処理を行う */
      const tryFinalize = () => {
        if (timedOut) return;
        if (!matchDone || !replaceDone) return;

        // Worker はもう不要なので終了
        worker.terminate();
        activeWorkerRef.current = null;
        if (timeoutIdRef.current !== null) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        setWorkerMatchResult(localMatchResult);
        setWorkerReplaceResult(localReplaceResult);
        setIsProcessing(false);
      };

      worker.onmessage = (e: MessageEvent<RegexWorkerResponse>) => {
        if (timedOut) return;

        const data = e.data;
        if (data.type === "match" && data.matchResult) {
          localMatchResult = data.matchResult;
          matchDone = true;
        } else if (data.type === "replace" && data.replaceResult) {
          localReplaceResult = data.replaceResult;
          replaceDone = true;
        }
        tryFinalize();
      };

      worker.onerror = () => {
        if (timedOut) return;
        timedOut = true;
        worker.terminate();
        activeWorkerRef.current = null;
        if (timeoutIdRef.current !== null) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setWorkerMatchResult({
          success: false,
          matches: [],
          error: "Worker でエラーが発生しました。",
        });
        setWorkerReplaceResult(null);
        setIsProcessing(false);
      };

      // タイムアウトタイマー設定
      timeoutIdRef.current = setTimeout(() => {
        timedOut = true;
        worker.terminate();
        activeWorkerRef.current = null;
        timeoutIdRef.current = null;

        setWorkerMatchResult({
          success: false,
          matches: [],
          error: TIMEOUT_ERROR_MESSAGE,
        });
        setWorkerReplaceResult(
          showReplace
            ? { success: false, output: "", error: TIMEOUT_ERROR_MESSAGE }
            : null,
        );
        setIsProcessing(false);
      }, WORKER_TIMEOUT_MS);

      // match リクエスト送信
      const matchRequest: RegexWorkerRequest = {
        type: "match",
        pattern,
        flags,
        testString,
      };
      worker.postMessage(matchRequest);

      // replace リクエスト送信（showReplace が有効な場合のみ）
      if (showReplace) {
        const replaceRequest: RegexWorkerRequest = {
          type: "replace",
          pattern,
          flags,
          testString,
          replacement,
        };
        worker.postMessage(replaceRequest);
      }
    }, DEBOUNCE_MS);

    // クリーンアップ: デバウンスタイマー + Worker + タイムアウトタイマー
    return () => {
      if (debounceIdRef.current !== null) {
        clearTimeout(debounceIdRef.current);
        debounceIdRef.current = null;
      }
      cleanup();
    };
  }, [pattern, flags, testString, replacement, showReplace, cleanup]);

  // アンマウント時の最終クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceIdRef.current !== null) {
        clearTimeout(debounceIdRef.current);
      }
      cleanup();
    };
  }, [cleanup]);

  // パターンが空の場合は Worker を介さずデフォルト結果を直接返す
  if (!pattern) {
    return {
      matchResult: EMPTY_MATCH_RESULT,
      replaceResult: showReplace ? { success: true, output: testString } : null,
      isProcessing: false,
    };
  }

  return {
    matchResult: workerMatchResult,
    replaceResult: workerReplaceResult,
    isProcessing,
  };
}
