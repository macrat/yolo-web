import { ImageResponse } from "next/og";

export const alt = "今日のユーモア運勢";
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
        backgroundColor: "#7c3aed",
        color: "white",
      }}
    >
      <div
        style={{
          fontSize: 100,
          marginBottom: 24,
        }}
      >
        🔮
      </div>
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        今日のユーモア運勢
      </div>
      <div
        style={{
          fontSize: 28,
          opacity: 0.9,
          marginBottom: 24,
        }}
      >
        毎日変わる斜め上の運勢占い
      </div>
      <div
        style={{
          fontSize: 24,
          opacity: 0.7,
        }}
      >
        yolos.net
      </div>
    </div>,
    { ...size },
  );
}
