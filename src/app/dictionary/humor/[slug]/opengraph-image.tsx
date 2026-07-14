import {
  createOgpImageResponse,
  ogpSize,
  ogpContentType,
} from "@/lib/ogp-image";
import { getAllSlugs, getEntryBySlug } from "@/humor-dict/data";

export const alt = "ユーモア辞典";
export const size = ogpSize;
export const contentType = ogpContentType;

/** 全エントリの slug を静的パラメータとして生成する */
export function generateStaticParams(): Array<{ slug: string }> {
  return getAllSlugs().map((slug) => ({ slug }));
}

/**
 * 副題（ユーモア定義）が長い場合に末尾を省略する最大文字数。
 * 器面の副題は 1〜2 行に収めたいので札/看板の他面と同程度に切り詰める。
 */
const DEFINITION_MAX_LENGTH = 80;

/**
 * 定義文を OGP の副題に収まるよう切り詰める。
 * 文字数が超過した場合は末尾に「…」を付加する。
 */
function truncateDefinition(definition: string): string {
  if (definition.length <= DEFINITION_MAX_LENGTH) {
    return definition;
  }
  return definition.slice(0, DEFINITION_MAX_LENGTH) + "…";
}

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * ユーモア辞典エントリの OGP。共通の店構えレンダラ {@link createOgpImageResponse} で組む
 * （紙地・墨・明朝の品名・朱の印）。品名＝見出し語（読みがあれば添える）、副題＝ユーモア定義。
 * cycle-282: 旧デザイン（スレート地 #1e293b＋琥珀 #f59e0b の帯・8px 装飾・all-caps）の
 * 独自 ImageResponse を廃し、他の全 OGP 面と同じ共通レンダラへ統一した（フェーズR移行漏れの是正）。
 */
export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);

  // エントリが見つからない場合はデフォルト表示にフォールバックする
  const word = entry?.word ?? "ユーモア辞典";
  const reading = entry?.reading ?? "";
  const title = reading ? `${word}（${reading}）` : word;
  const subtitle = entry
    ? truncateDefinition(entry.definition)
    : "日常語をユーモアで再定義する辞典";

  return createOgpImageResponse({ title, subtitle });
}
