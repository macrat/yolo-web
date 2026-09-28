import type {
  QuizDefinition,
  QuizAnswer,
  QuizQuestion,
  QuizResult,
} from "../types";
import { calculatePersonalityPoints } from "../scoring";

/**
 * Science Thinking Type Quiz (理系思考タイプ診断)
 *
 * 5-axis personality model based on scientific thinking styles:
 *   theory       -- 理論志向
 *   empirical    -- 実験・検証志向
 *   quantitative -- 数値化・定量志向
 *   observational -- 観察・記録志向
 *   creative     -- 創造・発明志向
 *
 * 10 result types determined by (highest axis, second-highest axis).
 */

/** Point value for the main axis of each choice */
const MAIN_AXIS_POINTS = 3;

/** Point value for the sub axis of each choice */
const SUB_AXIS_POINTS = 1;

/** All axis IDs used in this quiz */
export const AXIS_IDS = [
  "theory",
  "empirical",
  "quantitative",
  "observational",
  "creative",
] as const;

export type AxisId = (typeof AXIS_IDS)[number];

/** All result type IDs */
export const SCIENCE_TYPE_IDS = [
  "einstein",
  "curie",
  "turing",
  "davinci",
  "darwin",
  "edison",
  "newton",
  "nightingale",
  "faraday",
  "fabre",
] as const;

export type ScienceTypeId = (typeof SCIENCE_TYPE_IDS)[number];

/**
 * Mapping from (highestAxis, secondAxis) to result type ID.
 * Only the 10 covered combinations are listed here.
 */
const AXIS_PAIR_TO_TYPE: Record<string, ScienceTypeId> = {
  "theory--creative": "einstein",
  "empirical--observational": "curie",
  "quantitative--theory": "turing",
  "creative--observational": "davinci",
  "observational--theory": "darwin",
  "creative--empirical": "edison",
  "theory--quantitative": "newton",
  "quantitative--observational": "nightingale",
  "empirical--creative": "faraday",
  "observational--empirical": "fabre",
};

/**
 * For fallback: each primary axis maps to two result types and
 * the sub-axis that distinguishes them.
 */
const FALLBACK_MAP: Record<
  string,
  [
    { typeId: ScienceTypeId; subAxis: AxisId },
    { typeId: ScienceTypeId; subAxis: AxisId },
  ]
> = {
  theory: [
    { typeId: "einstein", subAxis: "creative" },
    { typeId: "newton", subAxis: "quantitative" },
  ],
  empirical: [
    { typeId: "curie", subAxis: "observational" },
    { typeId: "faraday", subAxis: "creative" },
  ],
  quantitative: [
    { typeId: "turing", subAxis: "theory" },
    { typeId: "nightingale", subAxis: "observational" },
  ],
  observational: [
    { typeId: "darwin", subAxis: "theory" },
    { typeId: "fabre", subAxis: "empirical" },
  ],
  creative: [
    { typeId: "davinci", subAxis: "observational" },
    { typeId: "edison", subAxis: "empirical" },
  ],
};

/**
 * Calculate axis scores from answers. Used for RadarChart display.
 */
export function getAxisScores(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
): Record<AxisId, number> {
  const points = calculatePersonalityPoints(questions, answers);
  return {
    theory: points["theory"] ?? 0,
    empirical: points["empirical"] ?? 0,
    quantitative: points["quantitative"] ?? 0,
    observational: points["observational"] ?? 0,
    creative: points["creative"] ?? 0,
  };
}

/**
 * Calculate the maximum possible score for each axis.
 * For each question, we take the highest point value available for each axis
 * across all choices. Summing these gives the theoretical maximum if every
 * question's best choice for that axis were selected.
 */
export function getMaxAxisScores(
  questions: QuizQuestion[],
): Record<AxisId, number> {
  const maxScores: Record<AxisId, number> = {
    theory: 0,
    empirical: 0,
    quantitative: 0,
    observational: 0,
    creative: 0,
  };

  for (const question of questions) {
    for (const axisId of AXIS_IDS) {
      let best = 0;
      for (const choice of question.choices) {
        const pts = choice.points?.[axisId] ?? 0;
        if (pts > best) best = pts;
      }
      maxScores[axisId] += best;
    }
  }

  return maxScores;
}

/**
 * Determine the science thinking result type from quiz answers.
 *
 * Logic:
 * 1. Calculate scores for all 5 axes
 * 2. Find the highest-scoring axis
 * 3. Find the second-highest axis (excluding the highest)
 * 4. Look up (highest, second) in the mapping table
 * 5. If no direct match, use fallback: compare sub-axis scores
 *    of the two types that share the highest axis
 */
export function determineScienceThinkingResult(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  results: QuizResult[],
): QuizResult {
  const scores = getAxisScores(questions, answers);

  // Sort axes by score descending, then alphabetically for ties
  const sorted = ([...AXIS_IDS] as AxisId[]).sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  });

  const highestAxis = sorted[0];
  const secondAxis = sorted[1];
  const key = `${highestAxis}--${secondAxis}`;

  // Direct match
  const directTypeId = AXIS_PAIR_TO_TYPE[key];
  if (directTypeId) {
    return results.find((r) => r.id === directTypeId) ?? results[0];
  }

  // Fallback: compare sub-axis scores of the two candidate types
  const candidates = FALLBACK_MAP[highestAxis];
  if (candidates) {
    const [candidateA, candidateB] = candidates;
    const scoreA = scores[candidateA.subAxis];
    const scoreB = scores[candidateB.subAxis];

    let selectedTypeId: ScienceTypeId;
    if (scoreA > scoreB) {
      selectedTypeId = candidateA.typeId;
    } else if (scoreB > scoreA) {
      selectedTypeId = candidateB.typeId;
    } else {
      // Tie-break: alphabetical order of type ID
      selectedTypeId =
        candidateA.typeId.localeCompare(candidateB.typeId) <= 0
          ? candidateA.typeId
          : candidateB.typeId;
    }
    return results.find((r) => r.id === selectedTypeId) ?? results[0];
  }

  // Ultimate fallback (should never happen)
  return results[0];
}

const scienceThinkingQuiz: QuizDefinition = {
  meta: {
    slug: "science-thinking",
    title: "理系思考タイプ診断 — あなたはどの科学者型？",
    // タイトルが全角15文字を超えるためカード表示用の短縮タイトルを設定
    shortTitle: "理系思考タイプ診断",
    description:
      "あなたの「理系脳の形」を5つの軸で可視化！理論・実験・数値・観察・創造の5つの思考スタイルから、あなたに最も近い科学者タイプを診断します。アインシュタイン、キュリー、チューリング、ダ・ヴィンチなど10タイプ。理系の知識は一切不要、日常の行動や好みに答えるだけ。レーダーチャートであなただけの思考プロフィールが見えてきます。",
    shortDescription:
      "5つの思考軸であなたの理系脳の形を可視化！全10タイプの科学者から診断",
    type: "personality",
    category: "personality",
    questionCount: 20,
    resultPageLabels: {
      traitsHeading: "この思考タイプの持ち味",
      behaviorsHeading: "理系脳あるある",
      adviceHeading: "この思考をもっと活かすには",
    },
    keywords: [
      "理系脳 診断",
      "理系 思考タイプ",
      "理系 文系 診断",
      "思考スタイル 診断",
      "理系脳 テスト",
      "科学者タイプ",
      "理系診断 無料",
    ],
    publishedAt: "2026-03-09T18:00:00+09:00",
    relatedLinks: [
      {
        label: "音楽性格診断を受ける",
        href: "/play/music-personality",
      },
      {
        label: "日本にしかいない動物で性格診断",
        href: "/play/animal-personality",
      },
      {
        label: "守護キャラ診断を受ける",
        href: "/play/character-fortune",
      },
    ],
    faq: [
      {
        question: "科学者思考診断は何問あって、どのくらい時間がかかりますか？",
        answer:
          "全20問です。1問あたり30秒程度で答えられるため、約10分で完了します。理系の知識は一切不要で、日常の行動や好みに答えるだけです。",
      },
      {
        question: "10タイプのどれになるかは何で決まりますか？",
        answer:
          "理論・実験・数値・観察・創造の5つの思考軸それぞれのスコアを集計し、最も高い軸と2番目に高い軸の組み合わせで結果が決まります。レーダーチャートでご自身の思考プロファイルを確認できます。",
      },
      {
        question: "理系じゃない人でも楽しめますか？",
        answer:
          "はい、楽しめます。この診断は科学の知識を問うものではなく、「新しいことを試す前にじっくり考える方か、まず行動する方か」といった日常の行動パターンから思考スタイルを診断します。",
      },
      {
        question: "やり直すと結果が変わることはありますか？",
        answer:
          "選ぶ選択肢が変われば結果も変わります。ただし同じように答えた場合は同じ結果になります。気分や状況によって答えが変わることもあるため、複数回試してみると自分の傾向がより明確になります。",
      },
      {
        question:
          "アインシュタインやキュリーなど実在の科学者が出てきますが、どういう意味ですか？",
        answer:
          "各タイプの思考スタイルを分かりやすく伝えるために、近いスタイルを持つ科学者の名前をつけています。実際の人物の正確な評価ではなく、エンターテインメントとして楽しんでください。",
      },
    ],
  },
  questions: [
    {
      id: "q1",
      text: "友達と旅行の計画を立てるとき、あなたが最初にやることは？",
      choices: [
        {
          id: "q1-a",
          text: "まず「なぜその場所に行きたいのか」を深く考える",
          points: { theory: MAIN_AXIS_POINTS, observational: SUB_AXIS_POINTS },
        },
        {
          id: "q1-b",
          text: "過去の旅行データ（費用・満足度）を比較する",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q1-c",
          text: "とりあえず候補地に日帰りで下見に行く",
          points: { empirical: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
        {
          id: "q1-d",
          text: "ガイドブックにない穴場スポットを独自にリサーチする",
          points: {
            observational: MAIN_AXIS_POINTS,
            creative: SUB_AXIS_POINTS,
          },
        },
      ],
    },
    {
      id: "q2",
      text: "料理をするとき、あなたのスタイルは？",
      choices: [
        {
          id: "q2-a",
          text: "レシピの分量を正確に計量する。1g単位で",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q2-b",
          text: "「なぜこの調味料を入れるのか」を理解してから作る",
          points: { theory: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
        {
          id: "q2-c",
          text: "レシピを見ないで、味見しながら感覚で調整する",
          points: {
            empirical: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q2-d",
          text: "全く新しい組み合わせを試して創作料理を作る",
          points: { creative: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q3",
      text: "道に迷ったとき、あなたはどうする？",
      choices: [
        {
          id: "q3-a",
          text: "地図アプリのルート検索で最短距離を計算する",
          points: { quantitative: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q3-b",
          text: "周囲の建物や太陽の位置から方角を推理する",
          points: { observational: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q3-c",
          text: "適当に歩いてみる。迷った先に面白いものがあるかも",
          points: {
            creative: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q3-d",
          text: "「この道を行ったらどうなるか」仮説を立てて進む",
          points: { theory: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q4",
      text: "ニュースで「新発見」の記事を見たとき、最初に気になることは？",
      choices: [
        {
          id: "q4-a",
          text: "その発見の理論的な意味や法則性",
          points: { theory: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
        {
          id: "q4-b",
          text: "実験や検証はどのように行われたのか",
          points: { empirical: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q4-c",
          text: "データの信頼性（サンプル数や統計手法）",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q4-d",
          text: "それが日常生活にどう応用できるか",
          points: { creative: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q5",
      text: "友達と議論になったとき、あなたの強みは？",
      choices: [
        {
          id: "q5-a",
          text: "具体的なデータや数字を示して説得する",
          points: { quantitative: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q5-b",
          text: "相手の話の矛盾点を論理的に指摘する",
          points: { theory: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
        {
          id: "q5-c",
          text: "実際の事例を挙げて「こういうケースもある」と示す",
          points: {
            empirical: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q5-d",
          text: "相手の表情や声のトーンから本音を読み取る",
          points: {
            observational: MAIN_AXIS_POINTS,
            creative: SUB_AXIS_POINTS,
          },
        },
      ],
    },
    {
      id: "q6",
      text: "新しいガジェットを買ったとき、最初にすることは？",
      choices: [
        {
          id: "q6-a",
          text: "説明書は読まずに、とりあえず触って使い方を探る",
          points: { empirical: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
        {
          id: "q6-b",
          text: "スペック表を隠々まで読んで性能を数値で把握する",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q6-c",
          text: "本来の用途以外の使い方がないか考える",
          points: { creative: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
        {
          id: "q6-d",
          text: "どういう技術原理で動いているのか調べる",
          points: { theory: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q7",
      text: "カフェで注文を決めるとき、あなたのタイプは？",
      choices: [
        {
          id: "q7-a",
          text: "いつもと違うメニューを頼んで味を検証する",
          points: {
            empirical: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q7-b",
          text: "「このコーヒーの産地はどこ？」と豆の背景が気になる",
          points: { observational: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q7-c",
          text: "口コミサイトの評価点を比較して高得点のものを選ぶ",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q7-d",
          text: "2つのメニューを組み合わせたオリジナル注文を考える",
          points: { creative: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q8",
      text: "部屋の模様替えをするとき、あなたのアプローチは？",
      choices: [
        {
          id: "q8-a",
          text: "家具の寸法を測り、配置を図面で計画する",
          points: { quantitative: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q8-b",
          text: "「なぜこの配置が落ち着くのか」を心理学的に考える",
          points: { theory: MAIN_AXIS_POINTS, observational: SUB_AXIS_POINTS },
        },
        {
          id: "q8-c",
          text: "とりあえず家具を動かしてみて、しっくりくる配置を探す",
          points: { empirical: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
        {
          id: "q8-d",
          text: "今まで誰もやったことのない斬新な配置に挑戦する",
          points: { creative: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q9",
      text: "植物を育てるなら、あなたはどうする？",
      choices: [
        {
          id: "q9-a",
          text: "水やりの量と頻度を記録して最適な条件を見つける",
          points: {
            empirical: MAIN_AXIS_POINTS,
            quantitative: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q9-b",
          text: "葉の色や形の変化を毎日細かく観察する",
          points: {
            observational: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q9-c",
          text: "土壌のpH値や日照時間をデータ管理する",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q9-d",
          text: "光合成や成長ホルモンの仕組みを調べて理解する",
          points: { theory: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q10",
      text: "映画を観た後、友達と話すとき何を語る？",
      choices: [
        {
          id: "q10-a",
          text: "ストーリーの伏線や構造を分析する",
          points: { theory: MAIN_AXIS_POINTS, observational: SUB_AXIS_POINTS },
        },
        {
          id: "q10-b",
          text: "「あのシーンの照明の使い方」など演出の細部",
          points: {
            observational: MAIN_AXIS_POINTS,
            creative: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q10-c",
          text: "似たジャンルの映画と比べて、どこが良かったか検証する",
          points: { empirical: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q10-d",
          text: "「自分ならこう撮る」と独自のアイデアを語る",
          points: { creative: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q11",
      text: "パズルやクイズに取り組むとき、あなたのスタイルは？",
      choices: [
        {
          id: "q11-a",
          text: "パターンや法則を見つけて一気に解く",
          points: { theory: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
        {
          id: "q11-b",
          text: "一つずつ試して、消去法で正解に迫る",
          points: { empirical: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q11-c",
          text: "解くスピードやスコアを記録して自己ベストを狙う",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q11-d",
          text: "出題者の意図を読み取って裏をかく",
          points: {
            observational: MAIN_AXIS_POINTS,
            creative: SUB_AXIS_POINTS,
          },
        },
      ],
    },
    {
      id: "q12",
      text: "天気予報を見るとき、あなたが気になるのは？",
      choices: [
        {
          id: "q12-a",
          text: "降水確率の数値と気温の推移グラフ",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q12-b",
          text: "高気圧・低気圧の動きと天気のメカニズム",
          points: { theory: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
        {
          id: "q12-c",
          text: "空の雲の形を見て自分なりに天気を予測する",
          points: {
            observational: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q12-d",
          text: "天気に合わせた斬新な過ごし方を考える",
          points: { creative: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q13",
      text: "グループワークで、あなたが自然と担当するのは？",
      choices: [
        {
          id: "q13-a",
          text: "データ収集と分析。数字で根拠を示す役",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q13-b",
          text: "アイデア出し。「こんな方法もあるよ」と発想する役",
          points: {
            creative: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q13-c",
          text: "計画の論理チェック。矛盾がないか検証する役",
          points: { theory: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
        {
          id: "q13-d",
          text: "現場の声を集める。ユーザーの反応を観察する役",
          points: {
            observational: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
      ],
    },
    {
      id: "q14",
      text: "スマホの使い方で、あなたに当てはまるのは？",
      choices: [
        {
          id: "q14-a",
          text: "バッテリーの減り方のパターンを把握している",
          points: {
            observational: MAIN_AXIS_POINTS,
            quantitative: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q14-b",
          text: "面白いアプリの組み合わせで新しい使い方を発明する",
          points: { creative: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
        {
          id: "q14-c",
          text: "スクリーンタイムのデータを分析して使用時間を管理する",
          points: { quantitative: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q14-d",
          text: "新しいアプリは片っ端から試して良し悪しを判断する",
          points: { empirical: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q15",
      text: "歴史の授業で一番面白かったのは？",
      choices: [
        {
          id: "q15-a",
          text: "歴史の「なぜ」を考えること。なぜ戦争が起きたか、なぜ文明が滅んだか",
          points: { theory: MAIN_AXIS_POINTS, observational: SUB_AXIS_POINTS },
        },
        {
          id: "q15-b",
          text: "歴史上の出来事を現地で再現・追体験する企画",
          points: {
            empirical: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q15-c",
          text: "遺跡や文化財の細部から当時の暮らしを想像すること",
          points: {
            observational: MAIN_AXIS_POINTS,
            creative: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q15-d",
          text: "「もし自分があの時代にいたら何を発明するか」を考えること",
          points: { creative: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q16",
      text: "友達が悩み相談をしてきたとき、あなたのアプローチは？",
      choices: [
        {
          id: "q16-a",
          text: "問題を構造化して、根本原因を論理的に分析する",
          points: { theory: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
        {
          id: "q16-b",
          text: "似たような事例を調べて、解決パターンを探す",
          points: {
            empirical: MAIN_AXIS_POINTS,
            quantitative: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q16-c",
          text: "相手の言葉の裏にある本当の気持ちを汲み取る",
          points: { observational: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q16-d",
          text: "常識にとらわれない解決策を提案する",
          points: {
            creative: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
      ],
    },
    {
      id: "q17",
      text: "自分の健康管理、どうしてる？",
      choices: [
        {
          id: "q17-a",
          text: "いろいろな健康法を実際に試して、効果を自分の体で検証する",
          points: {
            empirical: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q17-b",
          text: "体調の変化と食事・天気の関係を観察する",
          points: {
            observational: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q17-c",
          text: "「なぜ運動すると気分が良くなるのか」を科学的に理解する",
          points: { theory: MAIN_AXIS_POINTS, quantitative: SUB_AXIS_POINTS },
        },
        {
          id: "q17-d",
          text: "従来の健康法にとらわれず、自分流の健康法を開発する",
          points: { creative: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q18",
      text: "DIYや工作をするとき、あなたは？",
      choices: [
        {
          id: "q18-a",
          text: "設計図を描いて、材料の寸法を計算してから始める",
          points: { quantitative: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q18-b",
          text: "まず手を動かして、作りながら形を決めていく",
          points: { empirical: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
        {
          id: "q18-c",
          text: "既存のものを分解して構造を理解してから、改良版を作る",
          points: {
            observational: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q18-d",
          text: "誰も作ったことのないものを作ろうとする",
          points: { creative: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
      ],
    },
    {
      id: "q19",
      text: "SNSの投稿で「いいね」したくなるのは？",
      choices: [
        {
          id: "q19-a",
          text: "身近なものを使った意外な発明やライフハック",
          points: { creative: MAIN_AXIS_POINTS, empirical: SUB_AXIS_POINTS },
        },
        {
          id: "q19-b",
          text: "実験してみた系の動画",
          points: {
            empirical: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q19-c",
          text: "データをわかりやすく可視化したインフォグラフィック",
          points: { quantitative: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
        {
          id: "q19-d",
          text: "日常の中の小さな発見を切り取った写真",
          points: {
            observational: MAIN_AXIS_POINTS,
            quantitative: SUB_AXIS_POINTS,
          },
        },
      ],
    },
    {
      id: "q20",
      text: "もし1日だけ科学者になれるなら、何をしたい？",
      choices: [
        {
          id: "q20-a",
          text: "宇宙の起源や時間の本質など、究極の問いに挑む",
          points: { theory: MAIN_AXIS_POINTS, creative: SUB_AXIS_POINTS },
        },
        {
          id: "q20-b",
          text: "世界中の未踏の地を探索して新種を発見する",
          points: {
            observational: MAIN_AXIS_POINTS,
            empirical: SUB_AXIS_POINTS,
          },
        },
        {
          id: "q20-c",
          text: "世界を変えるような新しい発明を完成させる",
          points: { creative: MAIN_AXIS_POINTS, theory: SUB_AXIS_POINTS },
        },
        {
          id: "q20-d",
          text: "大量のデータを分析して誰も気づかなかった法則を見つける",
          points: {
            quantitative: MAIN_AXIS_POINTS,
            observational: SUB_AXIS_POINTS,
          },
        },
      ],
    },
  ],
  results: [
    {
      id: "einstein",
      title: "アインシュタイン型思考者",
      description:
        "あなたはアインシュタイン型思考者。抽象的な理論と創造的な直感を融合させ、「もし～だったら？」という思考実験で世界の本質に迫るタイプです。日常でも「なぜ空は青いのか」「時間とは何か」と根本的な疑問を追いかけてしまうことはありませんか？ アインシュタイン自身、特許庁で働きながら通勤電車の中で相対性理論の着想を得たと言われています。彼は「想像力は知識より重要だ」と語りましたが、あなたにもその精神が宿っているようです。弱点は、壮大な思考に没頭するあまり、目の前の現実的な問題を後回しにしがちなこと。靴下の左右が違うまま出かけても気づかないタイプかもしれません。アドバイス：たまには思考実験を中断して、靴下を確認してください。",
      detailedContent: {
        traits: [
          "頭の中に「もしも」の小さな世界をいくつも飼っていて、ぼーっとしているように見える時ほど、実はその中で壮大なシミュレーションが動いています。",
          "細かい手順や数式を一つずつ積み上げるより、全体のイメージが先にふわっと浮かんで、後から「なぜそう感じたか」を言葉にしていくタイプです。",
          "目の前のものを見ても、つい「これって要するに何なんだろう」と一段抽象化したくなり、本質をつかめた瞬間にいちばんスッキリします。",
          "常識として片付けられている前提を「でも、本当にそうなの？」と素朴に疑えるのが持ち味で、その問いがときどき周りの視点をまるごと裏返します。",
        ],
        behaviors: [
          "シャワーを浴びている時や歩いている時に限って、悩んでいた問題の答えがふっと降ってきて、慌てて引き返したことがあります。",
          "人の話を聞いている途中で「それってつまり…」と頭が勝手に脱線し、気づいたら数分ぶん聞き逃していて話を戻してもらうことがあります。",
          "鍵やスマホをどこに置いたか思い出せないのに、昨日ぼんやり考えていたアイデアの筋道は驚くほど鮮明に覚えています。",
          "ベッドに入って電気を消した瞬間にいちばん思考が冴えてしまい、頭の中の「もしも」が止まらず寝つけない夜があります。",
        ],
        advice:
          "あなたの「ぼんやり」は、誰も見ていない景色を組み立てている時間です。すぐに役立たなくても、その回り道の思索こそが、いつか誰も思いつかなかった答えを連れてきてくれます。",
      },
    },
    {
      id: "curie",
      title: "キュリー型思考者",
      description:
        "あなたはキュリー型思考者。粘り強い実験と鋭い観察眼で真実に迫る、筋金入りの実証主義者です。料理のレシピも自分で改良しないと気が済まず、「本当にこの分量がベストなのか」と検証を繰り返すタイプではありませんか？ マリー・キュリーはノーベル賞を2度受賞した唯一の女性科学者ですが、ラジウムの研究では何トンもの鉱石を自らの手で処理し続けました。「好奇心が止まらない」を体現した人物です。弱点は、検証が終わるまで結論を出したくないため、周囲から「で、結局どうなの？」と急かされがちなこと。でも焦って出した答えより、あなたの検証済みの答えの方がずっと信頼できます。アドバイス：実験ノートは宝物です。でもたまには結果を人に見せてあげてください。",
      detailedContent: {
        traits: [
          "「たぶん大丈夫」が苦手で、自分の目で確かめて初めて納得します。一度確かめたことには、誰に何と言われても揺るがない静かな自信を持っています。",
          "同じ作業の地道な繰り返しを苦に感じません。むしろ条件を少しずつ変えながら試すうちに、退屈どころかどんどん面白くなってきます。",
          "「なんとなく良い」では満足できず、何が・どれくらい・なぜ効いたのかを切り分けてからでないと、自分の中で結論を置きにいけません。",
          "派手な閃きより、コツコツ積み上げた事実のほうを信じます。地味でも崩れない土台を一段ずつ築いていくのが、あなたの強さです。",
        ],
        behaviors: [
          "気になる商品は、人の評価を見ても「結局は自分で使ってみないと分からない」と納得しきれず、まず一つ手に入れて自分の手で試し、確かめてから本当に良いか結論を出します。",
          "感想を聞かれて「うーん、もう何回か試してみないと何とも言えない」と答え、相手に「とりあえずの印象でいいんだけど」と苦笑いされたことがあります。",
          "気に入ったレシピでも一度ではそのまま信じず、火加減や分量を少し変えて二度三度作り、自分の中の「正解」を確定させてからレパートリー入りさせます。",
          "周りがもう次の話に進んでいるのに、一人だけ「さっきの、本当にそれで合ってた？」と引っかかり続け、あとで黙って確かめ直しています。",
        ],
        advice:
          "焦らず確かめ続けるあなたの答えには、近道では決して手に入らない確かさが宿ります。あなたが「これでいい」と言える時、それはもう誰よりも信頼できる答えになっています。",
      },
    },
    {
      id: "turing",
      title: "チューリング型思考者",
      description:
        "あなたはチューリング型思考者。論理と数値で世界を解読する、生まれながらのシステム思考家です。「それって本当にデータで証明できる？」が口癖で、感覚的な議論よりもロジックで物事を整理したいタイプではありませんか？ アラン・チューリングはコンピュータ科学の父と呼ばれますが、第二次世界大戦中にはドイツの暗号エニグマを解読し、戦争の行方を変えました。複雑な暗号も、彼にとっては「解くべきパズル」だったのです。弱点は、論理で割り切れない人間の感情に戸惑うことがあること。「なんで泣いてるの？ データ上は最適解なのに」と思ったことがあるなら、まさにチューリング型です。アドバイス：世界には論理で解けない問題もあります。それもまた面白いパズルです。",
      detailedContent: {
        traits: [
          "物事をいったん要素に分解し、「条件A ならB、そうでなければC」という分岐の形に整理してから動き出します。曖昧なまま進めるより、ルールが見えた瞬間にいちばん安心するタイプです。",
          "例外やイレギュラーを見つけるのが得意です。「この場合はどうなるの？」と、みんなが見落としているレアケースを真っ先に指摘できます。",
          "同じ作業を二度手でやらされると、頭の中で自動化できないか考え始めます。手順そのものを設計し直すことに楽しさを感じるタイプです。",
          "感想を求められても、つい「件数」や「割合」で答えてしまいます。「良かった」より「9割は満足、残り1割はここが課題」と言うほうがしっくりきます。",
        ],
        behaviors: [
          "ネットで何かを買うとき、レビューの星の数より「件数が何件あるか」を先に確認して、母数が少ないと評価を信用しきれません。",
          "友人の「占い当たってた！」に、つい「当たる確率もともと高くない？」と返してしまい、空気を読んで飲み込むこともあります。",
          "スマホの歩数記録やアプリの利用時間のグラフを眺めて、数字がきれいに積み上がっていく様子に、自分でも理由のわからない満足感にひたっている夜があります。",
          "「だいたいでいいよ」と言われても、何をもって正解とするかの基準が決まっていないと、かえって手が止まってしまいます。",
        ],
        advice:
          "あなたの整理された頭の中は、混乱した状況をすっと見通せる地図になります。割り切れないものに出会ったときも、その曖昧さごと面白がれたなら、あなたの論理はもっと遠くまで届きます。",
      },
    },
    {
      id: "davinci",
      title: "ダ・ヴィンチ型思考者",
      description:
        "あなたはダ・ヴィンチ型思考者。鋭い観察力と無限の創造力で、分野の壁を軽々と越えていく万能人です。絵画も科学も工学も、気になったら全部やってみたいタイプではありませんか？ レオナルド・ダ・ヴィンチは「モナ・リザ」の画家として有名ですが、ヘリコプターや戦車の設計図を500年前に描き、人体解剖まで行った究極のマルチタレントでした。彼のノートには鏡文字で書かれた発明のアイデアが8,000ページ以上残っています。弱点は、興味の幅が広すぎて、どれも中途半端になりがちなこと。「やりたいことリスト」が永遠に終わらないのがダ・ヴィンチ型の宿命です。アドバイス：全部やろうとして大丈夫。ダ・ヴィンチもモナ・リザの完成に16年かけましたから。",
      detailedContent: {
        traits: [
          "まったく別ジャンルの知識を、ひょいと結びつけるのが得意です。料理の手順と仕事の段取り、音楽のリズムと文章の流れ——他の人が「関係ない」と思うものの間に橋を架けてしまいます。",
          "「これ、どういう仕組みなんだろう」と思うと、分解したり調べたりせずにいられません。完成品より、その裏側のからくりのほうにワクワクするタイプです。",
          "一つの肩書きに自分を収めるのが少し苦手です。「何をやっている人？」と聞かれると、答えが毎年のように増えていきます。",
          "スケッチや図、メモの落書きで考えるのが好きです。言葉だけより、絵にしたほうが頭の中のアイデアが立体的に見えてきます。",
        ],
        behaviors: [
          "新しい趣味の道具を一式そろえたのに、別の気になることが現れて、棚に未使用のまま並んでいるものがいくつかあります。",
          "調べ物で検索を始めたはずが、リンクからリンクへ飛んでいって、気づけば最初と全然違うことを夢中で読んでいます。",
          "動画を見ていて「自分でも作れそう」と思った瞬間、半分はもう作った気になって満足してしまうことがあります。",
          "「ちょっと聞きたいだけ」のはずの相談に、なぜか別分野のたとえ話を持ち出して、相手をぽかんとさせた経験があります。",
        ],
        advice:
          "あなたの中でばらばらに見える興味たちは、いつか思いがけない一点で交わります。寄り道の一つひとつが、誰も持っていないあなただけの引き出しを増やしているのです。",
      },
    },
    {
      id: "darwin",
      title: "ダーウィン型思考者",
      description:
        "あなたはダーウィン型思考者。地道な観察から壮大な理論を導き出す、自然界の読み手です。散歩中に道端の花の変化に気づいたり、いつもの店の客層の変化を感じ取ったりするタイプではありませんか？ チャールズ・ダーウィンはビーグル号で5年間世界を旅し、膘大な観察記録から進化論を導き出しました。しかし発表まで20年以上も慎重に証拠を集め続けたのです。「急がない観察者」の真骨頂です。弱点は、観察に時間をかけすぎて行動が遅くなること。「もう少しデータが集まったら動こう」が口癖になっていませんか？ ダーウィンも同じだったので安心してください。アドバイス：完璧な観察を待っていたら、進化論はまだ発表されていなかったかもしれません。たまには見切り発車も大切です。",
      detailedContent: {
        traits: [
          "一つの出来事だけでは結論を出しません。「先週もそうだった」「去年の同じ時期もこうだった」と、過去の記憶と照らし合わせて初めて「これは傾向だ」と判断するタイプです。",
          "派手な変化より、ゆっくり進む小さな変化に敏感です。誰も気づかないうちに少しずつ起きている移り変わりを、点と点をつないで全体像として捉えるのが得意です。",
          "「なぜそうなったのか」の背景や原因に強い興味を持ちます。目の前の結果そのものより、そこに至るまでの長いプロセスを想像することに面白さを感じます。",
          "結論を急かされても動じません。「まだ確証がない」と感じたら、周りが先に進んでも自分のペースで材料を集め続けられる粘り強さがあります。",
        ],
        behaviors: [
          "新しいお店や商品を、すぐには評価しません。「もう何回か通ってから決めよう」と、何度か試した平均で判断するので、レビューを書くのもつい遅くなりがちです。",
          "人間関係でも、第一印象より「何度も会ううちに見えてくるその人らしさ」を信じます。だから初対面で結論を出す人を見ると、少し早とちりに感じてしまいます。",
          "お店や行きつけの場所が少し変わると、「前に来たときはこうだった」と昔の様子をすぐ思い出して比べ、その移り変わりに一人で気づいて静かに納得していることがあります。",
          "天気や体調、睡眠時間など、気になることをこまめに記録するクセがあります。後から見返して「やっぱり傾向があった」と一人で答え合わせをする瞬間が、ひそかに好きです。",
        ],
        advice:
          "あなたが時間をかけて積み上げた「確かに変化している」という実感は、その場の勢いでは決して得られない強さを持っています。じっくり育てた視点を、ときどき思い切って外に出してみてください。あなたの長い観察は、きっと誰かの背中を押します。",
      },
    },
    {
      id: "edison",
      title: "エジソン型思考者",
      description:
        "あなたはエジソン型思考者。「とりあえず作ってみよう」精神で、失敗を恐れずアイデアを次々と形にする実践的発明家です。考えるより先に手が動く、プロトタイプ思考の持ち主ではありませんか？ トーマス・エジソンは電球の実用化で知られますが、そのフィラメント素材を見つけるまでに6,000種類以上の材料を試したと言われています。「失敗したのではない、うまくいかない方法を見つけたのだ」という名言は、まさにこのタイプの哲学です。弱点は、手を動かすのが好きすぎて、計画を立てるのを面倒に感じること。「設計図？ 作りながら考えるよ」は周囲をハラハラさせがちです。アドバイス：6,000回試す根性があるなら、1回くらい設計図を描いても損はしません。",
      detailedContent: {
        traits: [
          "うまくいかなくても落ち込むより「じゃあ次はこうしてみよう」と切り替えが速いタイプです。失敗を結果ではなく、次の一手のヒントとして受け取れる回復力があります。",
          "完璧な完成形より、まず動く「ざっくり版」を出すことを優先します。0点を恐れて止まるより、60点でいいから早く形にして、そこから直していく方が性に合っています。",
          "頭の中だけで考えていると逆に煮詰まってしまい、実際に手や体を動かし始めた途端にアイデアが湧いてくるタイプです。考えるための道具が「手」なのです。",
          "アイデアの量が武器です。一つに固執せず、思いついた案を片っ端から試し、ダメならすぐ捨てられる潔さで、結果的に当たりを引く確率を上げています。",
        ],
        behaviors: [
          "メッセージや返信を一発で完璧に書こうとせず、思いついたそばから短く送って、続きはあとから連投で足していくタイプです。整えてから出すより、まず出して反応を見るほうが早いと感じます。",
          "料理でレシピを見ても、途中から「これ足したらどうなる？」と勝手にアレンジを始めてしまい、同じ味を二度と再現できないことがよくあります。",
          "やりたいことができると、準備や下調べより先に手が動いてしまいます。動き出してから足りないものに気づき、その都度買い足したり調べたりしながら勢いで進めるタイプです。",
          "旅行やイベントの計画を細かく立てるのが苦手で、「とりあえず現地に着いてから考えよう」と出発し、その場のノリで予定を決めるのが意外と楽しいタイプです。",
        ],
        advice:
          "あなたの「まず動いてみる」一歩は、考えているだけの百の計画より早く世界を変えていきます。手を動かしながら学ぶあなたのスタイルは、立派な才能です。たまに振り返って、うまくいった一手を記録しておくと、その勢いはもっと遠くまで届きます。",
      },
    },
    {
      id: "newton",
      title: "ニュートン型思考者",
      description:
        "あなたはニュートン型思考者。数理的な厳密さで自然の法則を解き明かす、孤高の理論家です。「直感ではなく計算で答えを出したい」「なんとなくではなく数式で証明したい」と思うタイプではありませんか？ アイザック・ニュートンは万有引力の法則を発見しただけでなく、それを記述するために微積分まで発明してしまいました。問題を解く道具がなければ、道具ごと作ってしまう究極の理論家です。弱点は、厳密さを求めるあまり他人の「だいたいで良くない？」が許せないこと。レストランの割り勘を小数点以下まで計算して引かれた経験はありませんか？ アドバイス：ニュートンもリンゴが落ちるのを「だいたい下に落ちた」から始めました。最初はざっくりでも大丈夫です。",
      detailedContent: {
        traits: [
          "「なんとなくこうなる」では落ち着かず、なぜそうなるのかを根っこの原理までさかのぼって自分の手で導けたとき、ようやく腑に落ちます。誰かの結論をそのまま借りるより、一から組み立て直したいタイプです。",
          "前提や言葉の定義が曖昧なまま話が進むのが気持ち悪く、「そもそもそれってどういう意味で言ってる？」と最初にきちんと固めたくなります。土台が揺れていると先に進めないのです。",
          "一人で机に向かって一気に突き詰める時間が、あなたにとって最高に集中できる瞬間です。人を巻き込んで進めるより、自分の中で筋が通るまで静かに練り上げたいタイプです。",
          "「だいたい」や「とりあえず」で済ませた箇所が、後で必ず気になって戻ってきてしまいます。ほとんど合っていても、わずかに残った曖昧さが頭の片隅でずっと引っかかります。",
        ],
        behaviors: [
          "料理のレシピで「適量」「少々」と書かれていると落ち着かず、グラムや小さじで正確に量れる分量に自分で置き換えてからでないと手が動きません。",
          "家具の組み立てや模様替えで、いきなり動かす前にまず寸法を測り、頭の中で「ここに置けば何センチ余る」と計算しきってから一発で配置を決めたくなります。",
          "ゲームや遊びを始める前に「このルールはどう解釈するのが正しいの？」とつい確認したくなり、みんながノリで進めようとしても、前提をはっきりさせてからでないと落ち着いて楽しめません。",
          "誰かに「なんでそうなるの？」と聞かれると、つい前提から順を追って丁寧に説明しすぎて、「結論だけでいいよ」と言われてしまうことがあります。",
        ],
        advice:
          "妥協せず根っこまで突き詰めるあなたの粘り強さは、誰も気づかなかった土台のほころびを見つけ出します。あなたが一人で時間をかけて固めた答えには、揺るがない確かさが宿っています。",
      },
    },
    {
      id: "nightingale",
      title: "ナイチンゲール型思考者",
      description:
        "あなたはナイチンゲール型思考者。データの可視化で問題を解決に導く、社会派サイエンティストです。「グラフにすれば一目瞭然でしょ？」が決めゼリフで、数字の裏にある現実を見抜く力を持っています。フローレンス・ナイチンゲールといえば「白衣の天使」のイメージが強いですが、実は統計学の先駆者でもありました。クリミア戦争で兵士の死因を分析し、戦闘ではなく不衛生な環境が主な死因だとデータで証明。彼女が考案した「鶏のとさか」と呼ばれる円グラフの変形は、政治家を動かし、病院改革を実現させました。弱点は、データに頼りすぎて「数字に表れない価値」を見落とすことがあること。アドバイス：ナイチンゲールの真の武器はグラフではなく、「データで人を救いたい」という情熱でした。数字の先にある人を忘れずに。",
      detailedContent: {
        traits: [
          "頭の中にある事実を、相手に伝わる「見える形」へ翻訳するのが得意です。同じ数字でも、どう並べてどこに色を置けば一目で伝わるかを自然に考えてしまうタイプです。",
          "人を責める前に状況を疑います。「あの人のせい」ではなく「どこに無理があってこうなったのか」を切り分けて、感情論を地図に置き換えられるのが持ち味です。",
          "一人で正しさを噛みしめるより、その正しさで誰かに動いてほしいと願うタイプです。だから難しい話ほど、専門用語を捨てて身近なたとえに直す手間を惜しみません。",
          "現場の小さな違和感を放っておけません。「なんとなく不便」を「ここでこれだけ時間が消えている」と具体に変換し、改善のスイッチを押すのが上手です。",
        ],
        behaviors: [
          "家計や買い物を見直すとき、頭で考えるより先に表を作ってしまい、色分けした瞬間に「あ、ここに無駄があった」と自分でも驚くことがあります。",
          "友人の悩み相談に、つい「それ、一回紙に書き出して並べてみよ？」と提案して、話すより図にしたほうが早いと感じるタイプです。",
          "会議やグループLINEで意見が空中戦になると、見かねて要点を箇条書きや簡単な図にまとめ、いつのまにか話をまとめる係になっています。",
          "旅行や引っ越しの段取りを、自分用のリストや早見表にして共有し、「これ分かりやすい」と感謝された経験が何度かあります。",
        ],
        advice:
          "あなたが整えた一枚の図は、十回の説明より早く人の心を動かします。伝わる形にする手間を惜しまないあなたは、正しさを「みんなのもの」に変えられる人。その力で、これからも誰かの一歩を軽くしてあげてください。",
      },
    },
    {
      id: "faraday",
      title: "ファラデー型思考者",
      description:
        "あなたはファラデー型思考者。独学と実験で常識を覆す、叩き上げの天才です。教科書の理論より、自分の手で試して確かめることを大切にするタイプではありませんか？ マイケル・ファラデーは製本屋の徒弟から独学で科学者になり、電磁誘導の法則を発見しました。正式な高等教育を受けていなかったため数学が苦手でしたが、代わりに鮮やかな実験の直感で電気と磁気の関係を見抜いたのです。弱点は、「自分でやってみないと信じない」ため、人のアドバイスを素直に聞けないことがあること。車輪の再発明をしがちですが、その過程で思わぬ発見をするのもファラデー型の特権です。アドバイス：遠回りに見える道が、実は最も豊かな学びをもたらします。自分の手を信じてください。",
      detailedContent: {
        traits: [
          "説明書を読むより先に、まず触って動かしてみたくなります。手を動かしているうちに「なるほど、こういう仕組みか」と体で理解していくタイプで、頭でわかるより指先でわかるほうが腑に落ちます。",
          "専門用語や難しい数式で語られると身構えますが、その中身を自分の言葉と簡単なたとえに置き換えた瞬間、一気に理解が進みます。借り物の知識より、自分で噛み砕いた知識しか信用しません。",
          "「これ、自分で作れないかな」が口癖です。市販品を見ても、買うより前に構造を想像して、似たものを手元のもので再現できないか考えてしまいます。",
          "権威や肩書きにあまり動じません。偉い人が言ったことでも、自分の手で確かめて初めて「本当だ」と納得し、確かめるまではそっと保留にしておきます。",
        ],
        behaviors: [
          "家電やガジェットが壊れると、すぐ修理に出さず「とりあえず開けてみよう」とドライバーを取り出して、中身を眺めているうちに半日経っていることがあります。",
          "新しいアプリやツールを渡されると、チュートリアルを飛ばして勝手にあちこちボタンを押し、自力で使い方を覚えてしまうので、人に教わるのが少し苦手です。",
          "料理やDIYで「こうすると早いよ」と教わっても、まず自己流で一度やってみないと気が済まず、遠回りしてから結局その通りだったと気づくことがあります。",
          "便利な裏ワザを聞いても、すぐには取り入れず「本当にそうなる？」と自分で試して確かめてから、ようやく自分の手順に組み込みます。",
        ],
        advice:
          "自分の手で確かめたことは、誰かに借りた知識と違って一生あなたから消えません。回り道のあいだに拾った小さな失敗や気づきこそが、あなただけの財産になっていきます。その手を動かし続けてください。",
      },
    },
    {
      id: "fabre",
      title: "ファーブル型思考者",
      description:
        "あなたはファーブル型思考者。身近な生き物や現象をとことん観察し、実験で確かめずにはいられない博物学者タイプです。散歩中に虫の行動が気になって立ち止まったり、雲の形の変化を追いかけたりするタイプではありませんか？ ジャン・アンリ・ファーブルは「昆虫記」で知られるフランスの博物学者。フンコロガシが糞を転がす方向に法則があるのか、何時間もかけて観察と実験を繰り返しました。研究室ではなく野外の自然の中で、虫の目線になって世界を見つめ続けた人です。弱点は、観察対象に夢中になりすぎて時間を忘れること。待ち合わせに遅れた理由が「アリの行列が面白くて」では許してもらえないかもしれません。アドバイス：小さな発見を積み重ねるあなたの目は、世界を少しずつ豊かにしています。その目を大切に。",
      detailedContent: {
        traits: [
          "結論を急がず、まず「ただ見続ける」ことができます。すぐ答えを出すより、同じ対象を時間をかけて眺め、少しずつ変化に気づいていく過程そのものを楽しめるタイプです。",
          "小さな違いに目がよく利きます。「昨日と葉の色が少し違う」「この子だけ歩き方が変」といった、ほとんどの人が素通りする微差に自然と目が留まります。",
          "数字やデータより、生きた現物を自分の目で見たがります。資料で読んだことも、実物を観察して「本当にそうなっている」と確かめるまでは、どこか半信半疑のままです。",
          "対象に名前をつけたり、その「気持ち」を想像したりして、まるで友達のように親しんでしまいます。観察しているうちに、相手の世界に入り込んでいくのが得意です。",
        ],
        behaviors: [
          "ベランダの植物やペットの様子を毎日つい観察してしまい、「今日はいつもより元気がないな」と小さな変化にいち早く気づきます。",
          "散歩中に虫や鳥、空の色が気になって何度も立ち止まり、一緒にいる人を置いていきがちで「早く」と急かされることがあります。",
          "水槽やキャンプの焚き火、雨だれをただ眺めているだけで時間が溶け、気づけば予定の時刻をとっくに過ぎていることがあります。",
          "スマホのカメラロールが、料理や記念写真ではなく、道端の草花や虫、奇妙な形の雲のアップで埋まっています。",
        ],
        advice:
          "あなたがじっくり見つめた時間は、決して無駄になりません。誰も気に留めない小さな世界に名前と物語を与えられるあなたの目は、見慣れた日常をいつでも新鮮な発見の場所に変えてくれます。",
      },
    },
  ],
};

export default scienceThinkingQuiz;
