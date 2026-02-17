import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import AiDisclaimer from "@/components/common/AiDisclaimer";

export default function DictionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          padding: "2rem 1rem",
          width: "100%",
        }}
      >
        {children}
        <AiDisclaimer />
      </main>
      <Footer />
    </div>
  );
}
