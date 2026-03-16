import { ImageResponse } from "next/og";
import { getAllSlugs, getEntryBySlug } from "@/humor-dict/data";

export const alt = "ユーモア辞典";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 全エントリの slug を静的パラメータとして生成する */
export function generateStaticParams(): Array<{ slug: string }> {
  return getAllSlugs().map((slug) => ({ slug }));
}

/** 定義文が長い場合に末尾を省略する最大文字数 */
const DEFINITION_MAX_LENGTH = 80;

/**
 * 定義文をOGP画像に収まるように切り詰める。
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

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);

  // エントリが見つからない場合はデフォルト表示にフォールバックする
  const word = entry?.word ?? "ユーモア辞典";
  const reading = entry?.reading ?? "";
  const definition = entry
    ? truncateDefinition(entry.definition)
    : "日常語をユーモアで再定義する辞典";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#1e293b",
        color: "white",
        padding: "64px 72px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* 辞書カード風の装飾ライン */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "8px",
          height: "100%",
          backgroundColor: "#f59e0b",
        }}
      />

      {/* ラベル */}
      <div
        style={{
          display: "flex",
          fontSize: 20,
          color: "#f59e0b",
          fontWeight: 700,
          letterSpacing: "0.1em",
          marginBottom: 24,
          textTransform: "uppercase",
        }}
      >
        ユーモア辞典
      </div>

      {/* 見出し語とよみがな */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#f8fafc",
          }}
        >
          {word}
        </div>
        {reading && (
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#94a3b8",
              fontWeight: 400,
            }}
          >
            【{reading}】
          </div>
        )}
      </div>

      {/* 定義文: 左ボーダー付きブロック引用風 */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 48,
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 4,
            minHeight: 48,
            backgroundColor: "#f59e0b",
            borderRadius: 2,
            flexShrink: 0,
            alignSelf: "stretch",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 30,
            lineHeight: 1.7,
            color: "#cbd5e1",
            fontWeight: 400,
          }}
        >
          {definition}
        </div>
      </div>

      {/* サイト名 */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: 48,
          right: 72,
          fontSize: 22,
          color: "#475569",
          fontWeight: 400,
        }}
      >
        yolos.net
      </div>
    </div>,
    { ...size },
  );
}
