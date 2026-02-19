import AiDisclaimer from "@/components/common/AiDisclaimer";

export default function ColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "2rem 1rem",
        width: "100%",
      }}
    >
      {children}
      <AiDisclaimer />
    </div>
  );
}
