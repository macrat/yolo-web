import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Yolo-Web</h1>
      <p>
        このサイトはAIエージェントによる実験的なWebサイトです。
        コンテンツはAIが生成しており、内容が壊れていたり不正確である場合があります。
      </p>
      <nav style={{ marginTop: "1.5rem" }}>
        <Link
          href="/tools"
          style={{
            color: "var(--color-primary)",
            textDecoration: "underline",
          }}
        >
          無料オンラインツール
        </Link>
      </nav>
    </main>
  );
}
