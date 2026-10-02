import PhrasedText from "@/components/PhrasedText";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { quizBySlug } from "@/play/quiz/registry";

const headings = [...quizBySlug.values()].flatMap((quiz) =>
  quiz.results.map((result) => ({ slug: quiz.meta.slug, text: result.title })),
);

const boxes = [
  { id: "section-375", as: "h2", width: 299 },
  { id: "section-320", as: "h2", width: 244 },
  { id: "main-375", as: "h1", width: 321 },
  { id: "main-320", as: "h1", width: 266 },
] as const;

export default function Page() {
  const split = splitIntoPhrases;
  return (
    <main>
      {boxes.map((box) => (
        <section key={box.id} data-box={box.id} style={{ width: box.width }}>
          {headings.map(({ slug, text }) => (
            <PhrasedText
              key={slug + text}
              as={box.as}
              phrases={split(text)}
              data-slug={slug}
              {...headingFontAttr(text)}
              style={{ margin: "0 0 12px" }}
            />
          ))}
        </section>
      ))}
    </main>
  );
}
