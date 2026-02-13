import type { Metadata } from "next";
import GameContainer from "@/components/games/kanji-kanaru/GameContainer";

export const metadata: Metadata = {
  title: "漢字カナール - 毎日の漢字パズル | Yolo-Web",
  description:
    "毎日1つの漢字を当てるパズルゲーム。6回以内に正解を見つけよう!部首・画数・読みなどのヒントを頼りに推理する、新感覚の漢字クイズです。",
  openGraph: {
    title: "漢字カナール - 毎日の漢字パズル",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "漢字カナール - 毎日の漢字パズル",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
  },
};

export default function KanjiKanaruPage() {
  return (
    <main>
      <GameContainer />
    </main>
  );
}
