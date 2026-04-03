/**
 * CharacterPersonalityContent - character-personality variant の共通コンテンツコンポーネント。
 *
 * ResultCard.tsx（受検者向け）と page.tsx（第三者向け）の両方から使用される。
 * ResultCard.tsx からは next/dynamic で遅延ロードされるため、クライアントバンドルへの
 * character-personality データの混入を防ぐ。
 *
 * 共通化対象:
 * - archetypeBreakdown / behaviors / characterMessage / 全タイプ一覧 の4セクション
 * - CSS変数 --type-color をインラインスタイルで注入（YojiPersonalityContent と同じパターン）
 * - referrerTypeId による相性セクション / 招待ボタン（ResultCard向け）
 *
 * 共通化しないもの（呼び出し側の責務）:
 * - catchphrase の表示（ResultCard/page.tsx でスタイル・配置が異なる）
 * - ShareButtons / もう一度挑戦するボタン
 */

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { CharacterPersonalityDetailedContent } from "@/play/quiz/types";
import type { CompatibilityEntry } from "@/play/quiz/types";
import characterPersonalityQuiz, {
  CHARACTER_PERSONALITY_TYPE_IDS,
} from "@/play/quiz/data/character-personality";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";
import styles from "./CharacterPersonalityContent.module.css";

const QUIZ_SLUG = "character-personality";
const QUIZ_TITLE = "あなたに似たキャラ診断";
const INVITE_TEXT = "似たキャラ診断で相性を調べよう!";

interface CompatibilityApiResponse {
  label: string;
  description: string;
  myType: { title: string; icon?: string };
  friendType: { title: string; icon?: string };
}

interface CharacterPersonalityContentProps {
  /** detailedContent（archetypeBreakdown, behaviors, characterMessage を含む） */
  content: CharacterPersonalityDetailedContent;
  /** 結果ID（全タイプ一覧で現在のタイプをハイライトするため） */
  resultId: string;
  /** 結果タイプのテーマカラー（--type-color CSS変数に注入） */
  resultColor: string;
  /** 見出しタグのレベル。page.tsxではh2（h1の次）、ResultCard内ではh3（h2の次） */
  headingLevel: 2 | 3;
  /**
   * 全タイプ一覧のレイアウト。
   * "list": ResultCard内で使用する縦並びリスト形式
   * "grid": 結果ページで使用する2-3列グリッド形式（アイコン+タイトル）
   */
  allTypesLayout: "list" | "grid";
  /**
   * 相性診断用の referrer タイプID。
   * ResultCard から渡される場合、内部で相性セクション・招待ボタンを生成する。
   * page.tsx（結果ページ）から使用する場合は afterCharacterMessage スロットを使用する。
   */
  referrerTypeId?: string;
  /**
   * characterMessage後・全タイプ一覧前にページ固有要素（相性セクション・CTA等）を挿入するスロット。
   * 渡された場合は referrerTypeId によるAPI呼び出しは行わず、このスロットを優先する。
   */
  afterCharacterMessage?: React.ReactNode;
}

/**
 * 相性エリアのレンダリングを管理するコンポーネント。
 * referrerTypeId がある場合はAPIから相性データをフェッチする。
 * afterCharacterMessage が渡された場合はそちらを優先する。
 */
function CompatibilityArea({
  resultId,
  referrerTypeId,
}: {
  resultId: string;
  referrerTypeId?: string;
}) {
  const [compatibilityData, setCompatibilityData] =
    useState<CompatibilityApiResponse | null>(null);
  const [loading, setLoading] = useState(!!referrerTypeId);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    // referrerTypeId がない場合はフェッチしない
    if (!referrerTypeId) return;

    let cancelled = false;

    const url = `/api/quiz/compatibility?slug=${QUIZ_SLUG}&typeA=${encodeURIComponent(resultId)}&typeB=${encodeURIComponent(referrerTypeId)}`;

    fetch(url)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setFetchFailed(true);
          return;
        }
        const data: CompatibilityApiResponse = await res.json();
        setCompatibilityData(data);
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resultId, referrerTypeId]);

  // referrerTypeId がない場合は招待ボタンのみ
  if (!referrerTypeId) {
    return (
      <InviteFriendButton
        quizSlug={QUIZ_SLUG}
        resultTypeId={resultId}
        inviteText={INVITE_TEXT}
      />
    );
  }

  // フェッチ中はローディング表示
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "1rem", opacity: 0.6 }}>
        相性データを読み込み中...
      </div>
    );
  }

  // フェッチ失敗またはデータなしの場合は招待ボタンのみ
  if (fetchFailed || !compatibilityData) {
    return (
      <InviteFriendButton
        quizSlug={QUIZ_SLUG}
        resultTypeId={resultId}
        inviteText={INVITE_TEXT}
      />
    );
  }

  // フェッチ成功: 相性セクションと招待ボタンを表示
  const compatibility: CompatibilityEntry = {
    label: compatibilityData.label,
    description: compatibilityData.description,
  };

  return (
    <>
      <CompatibilitySection
        myType={{
          id: resultId,
          title: compatibilityData.myType.title,
          icon: compatibilityData.myType.icon,
        }}
        friendType={{
          id: referrerTypeId,
          title: compatibilityData.friendType.title,
          icon: compatibilityData.friendType.icon,
        }}
        compatibility={compatibility}
        quizTitle={QUIZ_TITLE}
        quizSlug={QUIZ_SLUG}
      />
      <InviteFriendButton
        quizSlug={QUIZ_SLUG}
        resultTypeId={resultId}
        inviteText={INVITE_TEXT}
      />
    </>
  );
}

export default function CharacterPersonalityContent({
  content,
  resultId,
  resultColor,
  headingLevel,
  allTypesLayout,
  referrerTypeId,
  afterCharacterMessage,
}: CharacterPersonalityContentProps) {
  const quiz = characterPersonalityQuiz;
  // headingLevel に応じて h2 または h3 タグを動的に切り替える
  const Heading = `h${headingLevel}` as "h2" | "h3";

  const allTypesListClass =
    allTypesLayout === "grid"
      ? styles.allTypesGrid
      : styles.allTypesListVertical;

  // afterCharacterMessage が外部から渡された場合はそちらを優先する。
  // 渡されない場合（ResultCard からの呼び出し）は referrerTypeId を使って内部で生成する。
  const resolvedAfterCharacterMessage =
    afterCharacterMessage !== undefined ? (
      afterCharacterMessage
    ) : (
      <CompatibilityArea resultId={resultId} referrerTypeId={referrerTypeId} />
    );

  return (
    // wrapperクラスで --type-color をインラインスタイルで注入。
    // タイプごとに固有の色があるため、CSS変数ファイルではなくpropsから渡す。
    // ダークモード時のコントラスト調整はCSSファイル側で行う。
    <div
      className={styles.wrapper}
      style={{ "--type-color": resultColor } as React.CSSProperties}
    >
      {/* archetypeBreakdown セクション: 2つのアーキタイプの融合解説 */}
      <Heading className={styles.sectionHeading}>このキャラの成り立ち</Heading>
      <div className={styles.archetypeBreakdownCard}>
        {content.archetypeBreakdown}
      </div>

      {/* behaviors セクション: あるある4項目 */}
      <Heading className={styles.sectionHeading}>このキャラの日常</Heading>
      <ul className={styles.behaviorsList}>
        {content.behaviors.map((b, i) => (
          <li key={i} className={styles.behaviorsItem}>
            {b}
          </li>
        ))}
      </ul>

      {/* characterMessage セクション: キャラからのメッセージ */}
      <Heading className={styles.sectionHeading}>
        キャラからのメッセージ
      </Heading>
      <div className={styles.characterMessageCard}>
        {content.characterMessage}
      </div>

      {/* afterCharacterMessage スロット: 相性セクション・CTA等のページ固有要素 */}
      {resolvedAfterCharacterMessage}

      {/* 全タイプ一覧セクション */}
      <div className={styles.allTypesSection}>
        <Heading className={styles.allTypesCta}>他のキャラも見てみよう</Heading>
        <ul className={allTypesListClass}>
          {CHARACTER_PERSONALITY_TYPE_IDS.map((typeId) => {
            const result = quiz.results.find((r) => r.id === typeId);
            if (!result) return null;
            return (
              <li
                key={result.id}
                className={
                  result.id === resultId
                    ? styles.allTypesItemCurrent
                    : styles.allTypesItem
                }
              >
                <Link
                  href={`/play/${QUIZ_SLUG}/result/${result.id}`}
                  aria-current={result.id === resultId ? "page" : undefined}
                >
                  {result.icon && <span>{result.icon}</span>}
                  <span>{result.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
