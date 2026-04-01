/**
 * variant別Layoutコンポーネント用の共通props型定義。
 * B-258: 結果ページコンポーネントのアーキテクチャ改善で導入。
 * page.tsx のvariant別レンダリングロジックを専用Server Componentに分離するために使用する。
 */

import type {
  QuizMeta,
  QuizResult,
  QuizResultDetailedContent,
  ContrarianFortuneDetailedContent,
  CharacterFortuneDetailedContent,
} from "@/play/quiz/types";

/**
 * 全Layout共通props。
 * 全てのvariantに共通して必要なフィールドを定義する。
 */
export interface ResultLayoutCommonProps {
  /** クイズのスラッグ */
  slug: string;
  /** 結果ID */
  resultId: string;
  /** クイズのメタ情報 */
  quizMeta: QuizMeta;
  /** 表示する結果データ */
  result: QuizResult;
  /** SNSシェア用テキスト */
  shareText: string;
  /** SNSシェア用URL */
  shareUrl: string;
  /** CTAボタンテキスト（例: 「もう一度やる」） */
  ctaText: string;
}

/**
 * 標準形式の結果LayoutコンポーネントのProps。
 * personality系クイズの標準結果表示（traits/behaviors/advice 構造）に使用する。
 */
export interface StandardResultLayoutProps extends ResultLayoutCommonProps {
  /** 追加コンテンツ（未設定の場合はundefined） */
  detailedContent: QuizResultDetailedContent | undefined;
  /** descriptionが長文かどうか（表示切り替えに使用） */
  isDescriptionLong: boolean;
  /** 「特徴」セクションの見出しテキスト */
  traitsHeading: string;
  /** 「あるある」セクションの見出しテキスト */
  behaviorsHeading: string;
  /** 「アドバイス」セクションの見出しテキスト */
  adviceHeading: string;
}

/**
 * contrarian-fortune クイズ専用の結果LayoutコンポーネントのProps。
 * 逆張り占い系クイズの笑えるトーンのタイプ解説結果ページに使用する。
 */
export interface ContrarianFortuneLayoutProps extends ResultLayoutCommonProps {
  /** contrarian-fortune 専用の追加コンテンツ */
  detailedContent: ContrarianFortuneDetailedContent;
  /** クイズの全結果リスト（関連タイプへのリンク表示に使用） */
  allResults: QuizResult[];
}

/**
 * character-fortune クイズ専用の結果LayoutコンポーネントのProps。
 * キャラクターが固有の口調で語りかけるスタイルの結果ページに使用する。
 */
export interface CharacterFortuneLayoutProps extends ResultLayoutCommonProps {
  /** character-fortune 専用の追加コンテンツ */
  detailedContent: CharacterFortuneDetailedContent;
  /** クイズの全結果リスト（関連タイプへのリンク表示に使用） */
  allResults: QuizResult[];
}
