"use client";

import { useState } from "react";
import type { PublicMemo, RoleSlug } from "@/lib/memos";
import { ROLE_DISPLAY } from "@/lib/memos";
import MemoCard from "./MemoCard";
import styles from "./MemoFilter.module.css";

interface MemoFilterProps {
  memos: PublicMemo[];
  allTags: string[];
}

const ALL_ROLES: RoleSlug[] = [
  "owner",
  "project-manager",
  "researcher",
  "planner",
  "builder",
  "reviewer",
  "process-engineer",
];

export default function MemoFilter({ memos, allTags }: MemoFilterProps) {
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const filtered = memos.filter((m) => {
    if (selectedRole !== "all" && m.from !== selectedRole && m.to !== selectedRole) {
      return false;
    }
    if (selectedTag !== "all" && !m.tags.includes(selectedTag)) {
      return false;
    }
    return true;
  });

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
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">すべて</option>
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_DISPLAY[role].label}
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
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="all">すべて</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <span className={styles.count}>{filtered.length}件</span>
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>該当するメモがありません。</p>
        ) : (
          filtered.map((memo) => <MemoCard key={memo.id} memo={memo} />)
        )}
      </div>
    </div>
  );
}
