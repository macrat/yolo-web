import Panel from "@/components/Panel";
import IdentityHeader from "@/tools/_components/IdentityHeader";
import TrustSection from "@/tools/_components/TrustSection";
import LifecycleSection from "@/tools/_components/LifecycleSection";
import { categoryLabelMap } from "@/tools/_components/categoryLabels";
import type { ToolMeta } from "@/tools/types";
import styles from "./ToolDetailLayout.module.css";

interface ToolDetailLayoutProps {
  /**
   * ツールのメタ情報（SSoT）。
   * name / shortDescription / category を IdentityHeader へ、
   * howItWorks を TrustSection へ、
   * publishedAt / updatedAt を LifecycleSection へ渡す。
   */
  meta: ToolMeta;
  /**
   * ToolInputArea など入力・結果表示コンポーネントを差し込む slot。
   * ResultCopyArea / AccordionItem 等も children 経由で渡す（呼び出し側責任）。
   */
  children: React.ReactNode;
}

/**
 * ToolDetailLayout — 詳細ページの主体ラッパー。
 *
 * グリッド構造（Flex Column）:
 *   1. IdentityHeader（ファーストビュー上部）
 *   2. children slot（ToolInputArea など）
 *   3. TrustSection（入力・結果領域の下）
 *   4. LifecycleSection（below-the-fold）
 *
 * 責務範囲（tile-and-detail-design.md §3 #4 + §5 案 9 整合）:
 * - Panel を 1 枚使って全体を包む（DESIGN.md §1）
 * - 内部の子セクションは Panel で再包まない（DESIGN.md §4 Panel 入れ子禁止）
 * - LifecycleSection の below-the-fold 配置を CSS で制御
 * - isEmbedded 等のモード切替 prop は導入しない（案 9 確定）
 * - trustLevel は一切参照しない（cycle-193 全件撤去済）
 *
 * @see docs/tile-and-detail-design.md §3 #4
 * @see docs/cycles/cycle-193.md 案 9
 */
function ToolDetailLayout({ meta, children }: ToolDetailLayoutProps) {
  return (
    <Panel as="article">
      <div className={styles.layout}>
        {/* 1. ファーストビュー上部: ツール名・説明・カテゴリ */}
        {/* category は "text" 等の機械値から日本語ラベルに変換して渡す（軽微4 対応） */}
        <IdentityHeader
          name={meta.name}
          shortDescription={meta.shortDescription}
          category={
            meta.category
              ? (categoryLabelMap[
                  meta.category as keyof typeof categoryLabelMap
                ] ?? meta.category)
              : undefined
          }
        />

        {/* 2. 入力・結果表示スロット（ToolInputArea / ResultCopyArea / AccordionItem 等） */}
        {children}

        {/* 3. 信頼情報: ブラウザ内完結 + 動作原理 */}
        <TrustSection howItWorks={meta.howItWorks} />

        {/* 4. ライフサイクル情報（below-the-fold 配置） */}
        <div className={styles.lifecycle}>
          <LifecycleSection
            publishedAt={meta.publishedAt}
            updatedAt={meta.updatedAt}
          />
        </div>
      </div>
    </Panel>
  );
}

export default ToolDetailLayout;
