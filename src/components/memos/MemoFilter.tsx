"use client";

import { useState, useMemo } from "react";
import {
  ROLE_DISPLAY,
  capitalize,
  type PublicMemo,
  type RoleSlug,
} from "@/lib/memos-shared";
import { paginate, MEMOS_PER_PAGE } from "@/lib/pagination";
import Pagination from "@/components/common/Pagination";
import MemoCard from "./MemoCard";
import styles from "./MemoFilter.module.css";

interface MemoFilterProps {
  memos: PublicMemo[];
  allTags: string[];
  allRoles: string[];
}

function getRoleLabel(role: string): string {
  const knownDisplay = ROLE_DISPLAY[role as RoleSlug];
  if (knownDisplay) return knownDisplay.label;
  return capitalize(role);
}

/**
 * Format a range description like "N件中 X-Y件を表示".
 * When there are no items, returns only "0件".
 */
function formatRangeText(
  totalItems: number,
  currentPage: number,
  perPage: number,
): string {
  if (totalItems === 0) return "0件";

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  // When all items fit on a single page, show just the total count
  if (start === 1 && end === totalItems) {
    return `${totalItems}件`;
  }

  return `${totalItems}件中 ${start}-${end}件を表示`;
}

export default function MemoFilter({
  memos,
  allTags,
  allRoles,
}: MemoFilterProps) {
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filtered = useMemo(
    () =>
      memos.filter((m) => {
        if (
          selectedRole !== "all" &&
          m.from !== selectedRole &&
          m.to !== selectedRole
        ) {
          return false;
        }
        if (selectedTag !== "all" && !m.tags.includes(selectedTag)) {
          return false;
        }
        return true;
      }),
    [memos, selectedRole, selectedTag],
  );

  const paginationResult = useMemo(
    () => paginate(filtered, currentPage, MEMOS_PER_PAGE),
    [filtered, currentPage],
  );

  /** Reset page to 1 when a filter changes */
  function handleRoleChange(value: string): void {
    setSelectedRole(value);
    setCurrentPage(1);
  }

  function handleTagChange(value: string): void {
    setSelectedTag(value);
    setCurrentPage(1);
  }

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label htmlFor="role-filter" className={styles.label}>
            ロール
          </label>
          <select
            id="role-filter"
            className={styles.select}
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="all">すべて</option>
            {allRoles.map((role) => (
              <option key={role} value={role}>
                {getRoleLabel(role)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="tag-filter" className={styles.label}>
            タグ
          </label>
          <select
            id="tag-filter"
            className={styles.select}
            value={selectedTag}
            onChange={(e) => handleTagChange(e.target.value)}
          >
            <option value="all">すべて</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <span className={styles.count}>
          {formatRangeText(
            paginationResult.totalItems,
            paginationResult.currentPage,
            MEMOS_PER_PAGE,
          )}
        </span>
      </div>

      <div className={styles.list}>
        {paginationResult.items.length === 0 ? (
          <p className={styles.empty}>該当するメモがありません。</p>
        ) : (
          paginationResult.items.map((memo) => (
            <MemoCard key={memo.id} memo={memo} />
          ))
        )}
      </div>

      <Pagination
        mode="button"
        currentPage={paginationResult.currentPage}
        totalPages={paginationResult.totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
