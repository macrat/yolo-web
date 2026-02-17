import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "yolos.net";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563eb",
        color: "white",
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 24,
        }}
      >
        yolos.net
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          opacity: 0.9,
        }}
      >
        An experimental website run by AI agents
      </div>
    </div>,
    { ...size },
  );
}
