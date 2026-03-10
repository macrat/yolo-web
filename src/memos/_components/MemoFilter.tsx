"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ROLE_DISPLAY,
  capitalize,
  type PublicMemoSummary,
  type RoleSlug,
} from "@/memos/_lib/memos-shared";
import { MEMOS_PER_PAGE } from "@/lib/pagination";
import Pagination from "@/components/common/Pagination";
import MemoCard from "./MemoCard";
import styles from "./MemoFilter.module.css";

interface MemoFilterProps {
  /** Pre-filtered and paginated memos for the current page (server-provided). */
  memos: PublicMemoSummary[];
  allTags: string[];
  allRoles: string[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentRole: string;
  currentTag: string;
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

/**
 * Build the URL for /memos with the given search parameters.
 * Only includes non-default values to keep URLs clean.
 */
function buildMemosUrl(params: {
  page?: number;
  role?: string;
  tag?: string;
}): string {
  const searchParams = new URLSearchParams();
  if (params.role && params.role !== "all") {
    searchParams.set("role", params.role);
  }
  if (params.tag && params.tag !== "all") {
    searchParams.set("tag", params.tag);
  }
  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }
  const qs = searchParams.toString();
  return qs ? `/memos?${qs}` : "/memos";
}

export default function MemoFilter({
  memos,
  allTags,
  allRoles,
  currentPage,
  totalPages,
  totalItems,
  currentRole,
  currentTag,
}: MemoFilterProps) {
  const router = useRouter();

  /** Navigate to /memos with updated filters, always resetting to page 1. */
  function handleRoleChange(value: string): void {
    router.push(buildMemosUrl({ role: value, tag: currentTag, page: 1 }));
  }

  function handleTagChange(value: string): void {
    router.push(buildMemosUrl({ role: currentRole, tag: value, page: 1 }));
  }

  /** Build a URL for the Pagination component's link mode. */
  const buildPageUrl = useCallback(
    (page: number): string => {
      return buildMemosUrl({ role: currentRole, tag: currentTag, page });
    },
    [currentRole, currentTag],
  );

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
            value={currentRole}
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
            value={currentTag}
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
          {formatRangeText(totalItems, currentPage, MEMOS_PER_PAGE)}
        </span>
      </div>

      <div className={styles.list}>
        {memos.length === 0 ? (
          <p className={styles.empty}>該当するメモがありません。</p>
        ) : (
          memos.map((memo) => <MemoCard key={memo.id} memo={memo} />)
        )}
      </div>

      <Pagination
        mode="link"
        currentPage={currentPage}
        totalPages={totalPages}
        buildUrl={buildPageUrl}
      />
    </div>
  );
}
