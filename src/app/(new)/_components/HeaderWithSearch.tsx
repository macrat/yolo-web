"use client";

/**
 * HeaderWithSearch — (new)/layout.tsx 用の Header + 検索機能 Client Component ラッパー。
 *
 * Phase 4.4 暫定対処（cycle-185 / B-334-4-5 reviewer 指摘の致命的 UI 退行への対応 v2）。
 * Phase 4.4 移行で (legacy)/layout.tsx → (new)/layout.tsx の切替えに伴い、
 * ヘッダーから検索ボタンが消失していた（M1b dislikes「慣れた操作手順が突然変わる」に直撃）。
 *
 * 設計:
 * - (new)/layout.tsx は Server Component のまま保つ（<html>/<body> を Server で出す）
 * - 本 Client Component が SearchModal の open/close 状態を useState で管理し、
 *   onSearchOpen を Header に渡す → Header の mobileSearchButton も自動生成される
 * - これにより desktop + mobile 両対応の検索ボタンが復活する
 *
 * Phase 5 (B-331) で新検索コンポーネントに置き換える際は本ファイルを削除すること。
 */

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import SearchModal from "@/components/search/SearchModal";
import styles from "./HeaderWithSearch.module.css";

interface HeaderWithSearchProps {
  /** Header の actions スロット（テーマトグル・StreakBadge 等） */
  actions?: React.ReactNode;
}

export default function HeaderWithSearch({ actions }: HeaderWithSearchProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  // CloseReason は SearchModal の API 上必須だが、暫定対処では理由によらず閉じるだけでよい
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // searchAliasScope: (new) 配下で SearchModal が旧トークン (--color-bg 等) を参照するため、
  // CSS 変数のカスケード継承を利用して新トークンにエイリアスする wrapper。
  // <dialog> は top-layer に昇格するが CSS 変数は inherited property のため DOM 親から継承される。
  // Phase 5 (B-331) で新検索コンポーネントに置き換える際は wrapper と module.css ごと削除すること。
  return (
    <div className={styles.searchAliasScope}>
      <Header actions={actions} onSearchOpen={openSearch} />
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  );
}
