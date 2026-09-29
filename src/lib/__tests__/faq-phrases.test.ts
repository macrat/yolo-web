import { describe, expect, test } from "vitest";
import {
  COLOR_DICTIONARY_META,
  KANJI_DICTIONARY_META,
  YOJI_DICTIONARY_META,
} from "@/dictionary/_lib/dictionary-meta";
import { allGameMetas } from "@/play/games/registry";
import { allQuizMetas } from "@/play/quiz/registry";
import { allToolMetas } from "@/tools/registry";
import { phraseFaq } from "@/lib/faq-phrases";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import { phrasedNameText } from "@/lib/phrased-name";

describe("phraseFaq", () => {
  test("問いを文節で区切り、答えはそのまま渡す", () => {
    const faq = [
      {
        question: "基準日を変更すると何が変わりますか？",
        answer: "年齢を数える日が変わります。",
      },
    ];
    const [entry] = phraseFaq(faq);
    expect(entry.question.length).toBeGreaterThan(1);
    expect(followsPhraseRules(entry.question)).toBe(true);
    expect(phrasedNameText(entry.question)).toBe(faq[0].question);
    expect(entry.answer).toBe(faq[0].answer);
  });

  test("問いの終わりの「？」は前の文節に付き、「？」だけの文節を作らない", () => {
    const [entry] = phraseFaq([
      { question: "音楽の好みで性格が分かるの？", answer: "" },
    ]);
    expect(entry.question.at(-1)).toMatch(/.+？$/);
  });

  test("FAQ を持たないもの（undefined）は空の並びにする", () => {
    expect(phraseFaq(undefined)).toEqual([]);
    expect(phraseFaq([])).toEqual([]);
  });

  test("道具・ゲーム・クイズと診断・辞典のどの問いも、区切りをつなぐと元の問いに戻り、禁則を満たす", () => {
    const sources = [
      ...allToolMetas.map((meta) => ({
        id: `tools/${meta.slug}`,
        faq: meta.faq,
      })),
      ...allGameMetas.map((meta) => ({
        id: `games/${meta.slug}`,
        faq: meta.faq,
      })),
      ...allQuizMetas.map((meta) => ({
        id: `quiz/${meta.slug}`,
        faq: meta.faq,
      })),
      ...[
        KANJI_DICTIONARY_META,
        YOJI_DICTIONARY_META,
        COLOR_DICTIONARY_META,
      ].map((meta) => ({ id: `dictionary/${meta.slug}`, faq: meta.faq })),
    ];
    let count = 0;
    for (const { id, faq } of sources) {
      const phrased = phraseFaq(faq);
      (faq ?? []).forEach(({ question }, index) => {
        const phrases = phrased[index].question;
        expect(phrasedNameText(phrases), `${id} ${question}`).toBe(question);
        expect(followsPhraseRules(phrases), `${id} ${phrases.join("|")}`).toBe(
          true,
        );
        count++;
      });
    }
    expect(count).toBeGreaterThan(0);
  });
});
