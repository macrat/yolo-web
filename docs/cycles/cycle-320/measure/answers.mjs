// 診断と知識クイズのそれぞれの結果に着く答えの組を、版のソースから求める（条件7 の最後の答えで、extra を持つ本の
// 全結果に着くため）。
//
//   npx tsx docs/cycles/cycle-320/measure/answers.mjs <書き出した版のディレクトリ> <slug> [<slug>…]
//
// 1行に1本、`{"slug", "questionCount", "plans": {<結果の id>: [<問ごとの選択肢の字>…]}, "names": {<結果の id>: <結果の名>}}`
// を出す。選択肢は並びが回ごとに変わる（`Math.random`）ので、id でなく画面に出る字で名指す。測りの道具は、問ごとに
// この字の行を押し、着いた結果の名前の字が `names` のどれかで、組の結果と同じかを確かめる。答えの組は、問ごとの
// 選択肢の組を決まった種の擬似乱数で引いて採点の関数に通し、結果ごとに最初に出た組を採る。引いても出ない結果は
// `missing` に挙げる。

import path from "node:path";
import { pathToFileURL } from "node:url";

const DRAWS = 200000;

/** 決まった種から同じ並びを返す擬似乱数（mulberry32）。 */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

async function loadModule(directory, relative) {
  return import(pathToFileURL(path.resolve(directory, relative)).href);
}

async function plansFor(directory, slug) {
  const quiz = (await loadModule(directory, `src/play/quiz/data/${slug}.ts`))
    .default;
  const scoring = await loadModule(directory, "src/play/quiz/scoring.ts");
  const dataModule = await loadModule(
    directory,
    `src/play/quiz/data/${slug}.ts`,
  );
  const decide = (answers) => {
    if (slug === "science-thinking") {
      return dataModule.determineScienceThinkingResult(
        quiz.questions,
        answers,
        quiz.results,
      );
    }
    if (slug === "character-personality") {
      return dataModule.determineCharacterPersonalityResult(
        quiz.questions,
        answers,
        quiz.results,
      );
    }
    return scoring.determineResult(quiz, answers);
  };
  const random = seededRandom(320);
  const plans = {};
  for (let draw = 0; draw < DRAWS; draw++) {
    const picks = quiz.questions.map((question) =>
      Math.floor(random() * question.choices.length),
    );
    const answers = quiz.questions.map((question, index) => ({
      questionId: question.id,
      choiceId: question.choices[picks[index]].id,
    }));
    const result = decide(answers);
    if (plans[result.id]) continue;
    plans[result.id] = quiz.questions.map(
      (question, index) => question.choices[picks[index]].text,
    );
    if (Object.keys(plans).length === quiz.results.length) break;
  }
  return {
    slug,
    questionCount: quiz.questions.length,
    plans,
    names: Object.fromEntries(
      quiz.results.map((result) => [result.id, result.title]),
    ),
    missing: quiz.results.map((result) => result.id).filter((id) => !plans[id]),
  };
}

const [directory, ...slugs] = process.argv.slice(2);
if (!directory || slugs.length === 0) {
  console.error("usage: answers.mjs <version-directory> <slug>…");
  process.exit(2);
}
for (const slug of slugs) {
  console.log(JSON.stringify(await plansFor(directory, slug)));
}
