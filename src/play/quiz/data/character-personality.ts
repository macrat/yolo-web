import type {
  QuizDefinition,
  QuizAnswer,
  QuizQuestion,
  QuizResult,
  CompatibilityEntry,
} from "../types";
export type { CompatibilityEntry };
import { resultsBatch1 } from "./character-personality-results-batch1";
import { resultsBatch2 } from "./character-personality-results-batch2";
import { resultsBatch3 } from "./character-personality-results-batch3";
import { compatibilityMatrix } from "./character-personality-compatibility";

export { compatibilityMatrix };

/**
 * Character Personality Quiz (あなたに似たキャラ診断)
 *
 * 6-archetype model → 主軸 × 副軸 で 24 タイプを決める専用判定
 * (cycle-295 で 4軸/直接配点方式から再設計。判定は
 *  determineCharacterPersonalityResult / scoring.ts の汎用 determineResult は使わない)。
 *
 * 6 base archetypes:
 *   commander(司令塔・行動) / professor(博士・分析) / dreamer(夢想家・内省)
 *   trickster(策略家・逆張り) / guardian(守護者・備え) / artist(芸術家・感性)
 *
 * 各選択肢は 1 つの主signalアーキタイプ(hi 点) と 1 つの副signalアーキタイプ(lo 点) を持つ。
 * 総配点は全選択肢 T=30 固定(hi + lo = 30)。hi は反同点のため問ごとに分散:
 *   [29,27,25,23,21,19,28,26,24,22,20,18](Q1..Q12)。lo = 30 - hi。
 * 各アーキタイプが主signal を担う設問はちょうど 8 問ずつ(= count の対称性)。
 *
 * 判定(determineCharacterPersonalityResult):
 *   1. 選ばれた選択肢の主signal被選択回数 count[6] と 配点合計 score[6] を集計。
 *   2. (count, score) の辞書式(count 主・score が同点タイブレーク)で軸を決める。
 *   3. 主軸 P1 の count ≥ 8 なら同型(P1×P1)、未満なら副軸 P2 と (P1,P2)→typeId。
 *      順序対が無ければ逆順 (P2,P1) にフォールバック(§2 の 36 順序対を被覆)。
 *   4. なお残る同点はアーキタイプ正準 index(配列順でない)で決定的に 1 点化。
 *
 * points のキーは 24 タイプ ID ではなく 6 アーキタイプ名。汎用 determineResult
 * (typeId をキーに集計)へは流入しない(QuizContainer で専用判定へ分岐・
 *  reachability.test.ts の GENERIC_TIEBREAK_EXCLUDED で汎用ガードから除外)。
 */
const characterPersonalityQuiz: QuizDefinition = {
  meta: {
    slug: "character-personality",
    title: "あなたに似たキャラ診断",
    description:
      "12個の日常シチュエーションに答えて、あなたの性格に最もよく似たキャラクターを判定します。「締切3分前に5手先を読む炎の策士」や「夢の中で3本の論文を書き終えた学術夢想家」など、24タイプのキャラクターから1つが決まります。友達との相性診断もできます!",
    shortDescription:
      "日常の行動パターン12問から、あなたに似たキャラクターを24タイプの中から診断!",
    type: "personality",
    category: "personality",
    questionCount: 12,
    icon: "\u{1F3AD}",
    accentColor: "#7c3aed",
    keywords: [
      "キャラ診断",
      "性格診断",
      "キャラクター診断",
      "相性診断",
      "パーソナリティ",
      "性格テスト",
      "24タイプ",
    ],
    publishedAt: "2026-03-17T00:00:00+09:00",
    seoTitle: "あなたに似たキャラ診断 | 無料キャラクター性格診断・心理テスト",
    relatedLinks: [
      {
        label: "守護キャラ診断を受ける",
        href: "/play/character-fortune",
      },
      {
        label: "音楽性格診断を受ける",
        href: "/play/music-personality",
      },
    ],
    faq: [
      {
        question:
          "キャラクター性格診断は何問あって、どのくらい時間がかかりますか？",
        answer:
          "全12問です。日常のシチュエーションに答えるだけなので、3〜5分程度で完了します。",
      },
      {
        question:
          "24タイプもあるのですか？どれになるかはどうやって決まりますか？",
        answer:
          "あなたの答えの一つひとつには、6つのキャラクター気質——ぐいぐい動く行動派、じっくり調べる分析派、頭の中で思い描く空想派、裏を読む策略派、先を見て備える守備派、感覚で捉える感性派——のどれかが表れています。12問を通して「どの気質を何回選んだか」を数え、いちばん多かった気質を軸に、次に多かった気質を掛け合わせて24タイプから近いキャラクターを判定します。答えが1つの気質にぐっと偏ったときは、その気質が極まったタイプになります。",
      },
      {
        question:
          "「締切3分前に5手先を読む炎の策士」のような面白いキャラ名はどこから来ていますか？",
        answer:
          "AIが各タイプの性格特徴を誇張してユーモラスに命名したものです。実際の人物や既存のキャラクターとは無関係で、純粋にエンターテインメントとして楽しんでいただくためのものです。",
      },
      {
        question: "やり直すと結果は変わりますか？",
        answer:
          "同じ選択肢を選べば同じ結果になります。「仕事中の自分」と「プライベートの自分」など、場面を想定して試すと異なるキャラになることもあり、それ自体が発見になります。",
      },
      {
        question: "友達との相性診断は何タイプの組み合わせに対応していますか？",
        answer:
          "24タイプすべての組み合わせに対応しています。自分と友達のキャラクターを選ぶと、二人の関係性を描いた相性コメントが表示されます。",
      },
    ],
  },
  questions: [
    // Q1: 休日の朝の目覚め (除外: commander, professor / hi29 lo1)
    {
      id: "q1",
      text: "休日の朝8時、アラームなしで自然に目が覚めた。まず何をする?",
      choices: [
        {
          id: "q1-a",
          text: "「もう少しだけ」と布団の中で、今日一日をぼんやり頭の中で思い描く",
          points: { dreamer: 29, trickster: 1 },
        },
        {
          id: "q1-b",
          text: "「二度寝と早起き、どっちが得かな」と考えつつ、いつもと違う朝を試したくなる",
          points: { trickster: 29, artist: 1 },
        },
        {
          id: "q1-c",
          text: "「昨日やり残したことはなかったか」を思い返し、確認できてからゆっくり起きる",
          points: { guardian: 29, professor: 1 },
        },
        {
          id: "q1-d",
          text: "カーテン越しの光の色や空気の感じで、「今日はいい日になりそう」と決める",
          points: { artist: 29, trickster: 1 },
        },
      ],
    },
    // Q2: ネットの買い物 (除外: commander, dreamer / hi27 lo3)
    {
      id: "q2",
      text: "ネットで気になるアイテムを見つけた。購入ボタンの前でどうする?",
      choices: [
        {
          id: "q2-a",
          text: "レビューと仕様を比較表にまとめ、納得できる根拠が揃うまで調べ続ける",
          points: { professor: 27, trickster: 3 },
        },
        {
          id: "q2-b",
          text: "定価では買わない。クーポンや別の入手ルートがないか裏を探す",
          points: { trickster: 27, guardian: 3 },
        },
        {
          id: "q2-c",
          text: "返品条件や保証を確認して、失敗しない備えをしてから決める",
          points: { guardian: 27, artist: 3 },
        },
        {
          id: "q2-d",
          text: "スペックより「これ好き」。色や質感がしっくりくるかで直感的に決める",
          points: { artist: 27, dreamer: 3 },
        },
      ],
    },
    // Q3: 初参加のグループイベント (除外: commander, guardian / hi25 lo5)
    {
      id: "q3",
      text: "初めて参加するグループイベント。あなたの動き方は?",
      choices: [
        {
          id: "q3-a",
          text: "どんな集まりで誰と誰がつながっているか、まず全体の構造を観察する",
          points: { professor: 25, dreamer: 5 },
        },
        {
          id: "q3-b",
          text: "会話を聞きながら、一人ひとりの背景を頭の中で勝手に物語にしている",
          points: { dreamer: 25, trickster: 5 },
        },
        {
          id: "q3-c",
          text: "場の本音と建前を読み取って、みんなとは違う角度から会話に入る",
          points: { trickster: 25, artist: 5 },
        },
        {
          id: "q3-d",
          text: "その場の空気や人の雰囲気を肌で感じ取って、心地いい距離を直感でとる",
          points: { artist: 25, professor: 5 },
        },
      ],
    },
    // Q4: トラブル発生 (除外: commander, artist / hi23 lo7)
    {
      id: "q4",
      text: "仕事や学校でトラブルが発生した。まず何をする?",
      choices: [
        {
          id: "q4-a",
          text: "原因を構造的に切り分け、根拠を一つずつ積み上げてから解決策を組む",
          points: { professor: 23, dreamer: 7 },
        },
        {
          id: "q4-b",
          text: "一度立ち止まって、この先どうなるかを頭の中で最後まで再生してから動く",
          points: { dreamer: 23, trickster: 7 },
        },
        {
          id: "q4-c",
          text: "王道の対処法を疑って、誰も見ていない抜け道や裏の原因を探す",
          points: { trickster: 23, artist: 7 },
        },
        {
          id: "q4-d",
          text: "最悪のケースを先に想定して、被害が広がらない備えを最優先する",
          points: { guardian: 23, professor: 7 },
        },
      ],
    },
    // Q5: 締切のある大きな課題 (除外: professor, dreamer / hi21 lo9)
    {
      id: "q5",
      text: "1週間の締切がある大きな課題。取り組み方は?",
      choices: [
        {
          id: "q5-a",
          text: "とりあえず着手。動きながら考えて、走りながら軌道修正する",
          points: { commander: 21, guardian: 9 },
        },
        {
          id: "q5-b",
          text: "正攻法だと時間がかかる。省ける手順や近道がないか先に探す",
          points: { trickster: 21, professor: 9 },
        },
        {
          id: "q5-c",
          text: "余裕をもって前倒し。想定外に備えてバッファを確保しておく",
          points: { guardian: 21, artist: 9 },
        },
        {
          id: "q5-d",
          text: "気分が乗った瞬間に一気に。「まだ違う」と納得いくまで作り込む",
          points: { artist: 21, trickster: 9 },
        },
      ],
    },
    // Q6: 嬉しいことがあった (除外: professor, trickster / hi19 lo11)
    {
      id: "q6",
      text: "すごく嬉しいことがあった! 最初のリアクションは?",
      choices: [
        {
          id: "q6-a",
          text: "いてもたってもいられず動く。誰かに会いに行くか、勢いで次のことも始める",
          points: { commander: 19, dreamer: 11 },
        },
        {
          id: "q6-b",
          text: "一人でその瞬間を頭の中で何度も再生して、じっくり噛みしめる",
          points: { dreamer: 19, commander: 11 },
        },
        {
          id: "q6-c",
          text: "近しい人にだけそっと伝えて、この幸運が続くように気を配る",
          points: { guardian: 19, artist: 11 },
        },
        {
          id: "q6-d",
          text: "この気持ちを色や音、何か形にして表現したくなる",
          points: { artist: 19, commander: 11 },
        },
      ],
    },
    // Q7: 自由に作れる3時間 (除外: professor, artist / hi28 lo2)
    {
      id: "q7",
      text: "自由に何かを作っていい時間が3時間ある。アプローチは?",
      choices: [
        {
          id: "q7-a",
          text: "とにかく手を動かし始める。作りながら完成形を決めていく",
          points: { commander: 28, artist: 2 },
        },
        {
          id: "q7-b",
          text: "まず頭の中で完成形を細部まで思い描いてから、実際に手をつける",
          points: { dreamer: 28, trickster: 2 },
        },
        {
          id: "q7-c",
          text: "王道の作り方をあえて外して、誰もやらない変化球を狙う",
          points: { trickster: 28, guardian: 2 },
        },
        {
          id: "q7-d",
          text: "失敗しないよう手順と材料を確認して、無理のない範囲で組み立てる",
          points: { guardian: 28, trickster: 2 },
        },
      ],
    },
    // Q8: リスクのある選択 (除外: dreamer, trickster / hi26 lo4)
    {
      id: "q8",
      text: "「リターンは大きいがリスクもある」選択肢が目の前に。どうする?",
      choices: [
        {
          id: "q8-a",
          text: "「やってみてダメなら次」と、まず飛び込む",
          points: { commander: 26, guardian: 4 },
        },
        {
          id: "q8-b",
          text: "確率や条件を洗い出し、判断できる根拠が揃うまで調べる",
          points: { professor: 26, guardian: 4 },
        },
        {
          id: "q8-c",
          text: "リスクを書き出して対策を用意し、信頼できる人にも相談してから決める",
          points: { guardian: 26, trickster: 4 },
        },
        {
          id: "q8-d",
          text: "理屈より「これは行ける気がする」という直感を信じる",
          points: { artist: 26, trickster: 4 },
        },
      ],
    },
    // Q9: 旅先の景色の記録 (除外: dreamer, guardian / hi24 lo6)
    {
      id: "q9",
      text: "旅先で素敵な景色に出会った。どう記録する?",
      choices: [
        {
          id: "q9-a",
          text: "とりあえずすぐシェア。「見て見て!」と発信して、その場を盛り上げる",
          points: { commander: 24, trickster: 6 },
        },
        {
          id: "q9-b",
          text: "場所・時間・光の条件をメモに残して、あとで見返せるようにする",
          points: { professor: 24, commander: 6 },
        },
        {
          id: "q9-c",
          text: "みんなが撮る定番アングルを外して、あえて裏側から狙う",
          points: { trickster: 24, artist: 6 },
        },
        {
          id: "q9-d",
          text: "写真より、目と体に焼き付ける。この光を感覚ごと覚えておきたい",
          points: { artist: 24, trickster: 6 },
        },
      ],
    },
    // Q10: 久しぶりに会う人 (除外: trickster, guardian / hi22 lo8)
    {
      id: "q10",
      text: "久しぶりに会う人がいる。どんな気持ちになる?",
      choices: [
        {
          id: "q10-a",
          text: "ワクワク! 会う前から「あれも話そう」と勢いづく",
          points: { commander: 22, professor: 8 },
        },
        {
          id: "q10-b",
          text: "前に何を話したか思い出し、相手の近況を整理してから会う",
          points: { professor: 22, artist: 8 },
        },
        {
          id: "q10-c",
          text: "会ったらどんな会話になるか、頭の中で何通りも思い描く",
          points: { dreamer: 22, artist: 8 },
        },
        {
          id: "q10-d",
          text: "特に準備はしない。会った瞬間の空気に合わせて感覚で話す",
          points: { artist: 22, dreamer: 8 },
        },
      ],
    },
    // Q11: いつも通り vs 新しいやり方 (除外: trickster, artist / hi20 lo10)
    {
      id: "q11",
      text: "いつも通りのやり方と、新しいやり方が選べる。どうする?",
      choices: [
        {
          id: "q11-a",
          text: "新しい方を即試す。動いてみないと分からないから",
          points: { commander: 20, dreamer: 10 },
        },
        {
          id: "q11-b",
          text: "「本当に新しい方がいいのか」を検証してから選ぶ",
          points: { professor: 20, dreamer: 10 },
        },
        {
          id: "q11-c",
          text: "新しいやり方でどうなるか、頭の中で最後までシミュレーションする",
          points: { dreamer: 20, commander: 10 },
        },
        {
          id: "q11-d",
          text: "いつも通りが安心。変える前にリスクを確かめておきたい",
          points: { guardian: 20, commander: 10 },
        },
      ],
    },
    // Q12: 5年後の自分 (除外: guardian, artist / hi18 lo12)
    {
      id: "q12",
      text: "5年後の自分について考えるとき、何が浮かぶ?",
      choices: [
        {
          id: "q12-a",
          text: "具体的な目標が見えて、もう今すぐ動き出したくなる",
          points: { commander: 18, dreamer: 12 },
        },
        {
          id: "q12-b",
          text: "現状を分析して、根拠のある道筋を逆算で組み立てる",
          points: { professor: 18, dreamer: 12 },
        },
        {
          id: "q12-c",
          text: "ぼんやりした理想の景色が浮かぶ。詳細より「雰囲気」を味わっている",
          points: { dreamer: 18, trickster: 12 },
        },
        {
          id: "q12-d",
          text: "王道のキャリアを疑って、人と違うルートや裏道を考える",
          points: { trickster: 18, professor: 12 },
        },
      ],
    },
  ],
  results: [...resultsBatch1, ...resultsBatch2, ...resultsBatch3],
};

/** All valid type IDs for this quiz */
export const CHARACTER_PERSONALITY_TYPE_IDS = [
  "blazing-strategist",
  "blazing-poet",
  "blazing-schemer",
  "blazing-warden",
  "blazing-canvas",
  "dreaming-scholar",
  "contrarian-professor",
  "careful-scholar",
  "academic-artist",
  "star-chaser",
  "tender-dreamer",
  "dreaming-canvas",
  "clever-guardian",
  "creative-disruptor",
  "gentle-fortress",
  "ultimate-commander",
  "endless-researcher",
  "eternal-dreamer",
  "ultimate-trickster",
  "ultimate-guardian",
  "ultimate-artist",
  "data-fortress",
  "vibe-rebel",
  "guardian-charger",
] as const;

export type CharacterPersonalityTypeId =
  (typeof CHARACTER_PERSONALITY_TYPE_IDS)[number];

/**
 * 6 base archetypes. この配列順は最終同点決着の決定的規準(正準 index)としても使う
 * ——quiz.results の配列順ではないので G3(配列順タイブレーク禁止)を満たす。
 */
export const ARCHETYPE_IDS = [
  "commander",
  "professor",
  "dreamer",
  "trickster",
  "guardian",
  "artist",
] as const;

export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

/**
 * 主軸の count がこの閾値以上なら同型(主×主)と判定する。
 * データ導出値: 各アーキタイプは主signal を 8 問で担うので、そのアーキタイプの
 * 主signal を全 8 問で選ぶ「本人」の count はちょうど 8 になる。
 */
const SAME_TYPE_COUNT_THRESHOLD = 8;

/**
 * (主軸, 副軸) → typeId の写像(design.md §2 の 24 順序対を直接列挙)。
 * 異型 15 + 同型 6 + 逆順 3。残る 12 の順序対は逆順フォールバックで引く
 * (順序対 (P1,P2) が無ければ (P2,P1) を引く=36 順序対すべてを被覆)。
 */
const AXIS_PAIR_TO_TYPE: Record<string, CharacterPersonalityTypeId> = {
  // 異型 15(C(6,2))
  "commander--professor": "blazing-strategist",
  "commander--dreamer": "blazing-poet",
  "commander--trickster": "blazing-schemer",
  "commander--guardian": "blazing-warden",
  "commander--artist": "blazing-canvas",
  "professor--dreamer": "dreaming-scholar",
  "professor--trickster": "contrarian-professor",
  "professor--guardian": "careful-scholar",
  "professor--artist": "academic-artist",
  "dreamer--trickster": "star-chaser",
  "dreamer--guardian": "tender-dreamer",
  "dreamer--artist": "dreaming-canvas",
  "trickster--guardian": "clever-guardian",
  "trickster--artist": "creative-disruptor",
  "guardian--artist": "gentle-fortress",
  // 同型 6
  "commander--commander": "ultimate-commander",
  "professor--professor": "endless-researcher",
  "dreamer--dreamer": "eternal-dreamer",
  "trickster--trickster": "ultimate-trickster",
  "guardian--guardian": "ultimate-guardian",
  "artist--artist": "ultimate-artist",
  // 逆順 3(#8/#14/#4 の順序違い)
  "guardian--professor": "data-fortress",
  "artist--trickster": "vibe-rebel",
  "guardian--commander": "guardian-charger",
};

/**
 * 回答から各アーキタイプの主signal被選択回数 count と 配点合計 score を集計する。
 * 各選択肢は主signal(hi=最大点)と副signal(lo)を持ち、hi > lo が常に成り立つため
 * 主signal は選択肢内で最大点のアーキタイプとして一意に決まる。
 */
function tallyArchetypes(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
): {
  count: Record<ArchetypeId, number>;
  score: Record<ArchetypeId, number>;
} {
  const count = Object.fromEntries(ARCHETYPE_IDS.map((a) => [a, 0])) as Record<
    ArchetypeId,
    number
  >;
  const score = Object.fromEntries(ARCHETYPE_IDS.map((a) => [a, 0])) as Record<
    ArchetypeId,
    number
  >;

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const choice = question.choices.find((c) => c.id === answer.choiceId);
    if (!choice?.points) continue;

    let mainArchetype: ArchetypeId | null = null;
    let mainPoints = -1;
    for (const archetype of ARCHETYPE_IDS) {
      const pts = choice.points[archetype] ?? 0;
      score[archetype] += pts;
      if (pts > mainPoints) {
        mainPoints = pts;
        mainArchetype = archetype;
      }
    }
    if (mainArchetype) count[mainArchetype] += 1;
  }

  return { count, score };
}

/**
 * Determine the character-personality result type from quiz answers.
 *
 * count ベースの軸判定(design.md §B-mech / cycle-295):
 *   1. 主signal被選択回数 count と 配点合計 score を集計。
 *   2. (count, score) の辞書式順で軸を決める(count が主・score が同点タイブレーク)。
 *      なお同点はアーキタイプ正準 index(ARCHETYPE_IDS の順)で決定的に決着。
 *   3. 主軸 P1 の count ≥ 8 なら同型(P1×P1)、未満なら副軸 P2 と (P1,P2)→typeId。
 *      直接の順序対が無ければ逆順 (P2,P1) にフォールバックする。
 *
 * 得点軸でなく count 軸にした理由: 副signalの三次アーキタイプ染み出し(cross-talk)を
 * 軸決定から排除し、全 24 タイプを本人回答で到達可能(G1=24/24)にするため。
 */
export function determineCharacterPersonalityResult(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  results: QuizResult[],
): QuizResult {
  const { count, score } = tallyArchetypes(questions, answers);

  const ranked = [...ARCHETYPE_IDS].sort((a, b) => {
    if (count[b] !== count[a]) return count[b] - count[a];
    if (score[b] !== score[a]) return score[b] - score[a];
    // 最終の決定的決着: アーキタイプ正準 index(配列順=quiz.results 順ではない)。
    return ARCHETYPE_IDS.indexOf(a) - ARCHETYPE_IDS.indexOf(b);
  });

  const primary = ranked[0];

  let typeId: CharacterPersonalityTypeId;
  if (count[primary] >= SAME_TYPE_COUNT_THRESHOLD) {
    typeId = AXIS_PAIR_TO_TYPE[`${primary}--${primary}`];
  } else {
    const secondary = ranked[1];
    typeId =
      AXIS_PAIR_TO_TYPE[`${primary}--${secondary}`] ??
      AXIS_PAIR_TO_TYPE[`${secondary}--${primary}`];
  }

  return results.find((r) => r.id === typeId) ?? results[0];
}

/**
 * Look up compatibility between two type IDs.
 * Order does not matter: getCompatibility("a","b") === getCompatibility("b","a").
 */
export function getCompatibility(
  typeA: string,
  typeB: string,
): CompatibilityEntry | undefined {
  const key = [typeA, typeB].sort().join("--");
  return compatibilityMatrix[key];
}

/**
 * Check if a given string is a valid character personality type ID.
 */
export function isValidCharacterPersonalityTypeId(
  id: string,
): id is CharacterPersonalityTypeId {
  return (CHARACTER_PERSONALITY_TYPE_IDS as readonly string[]).includes(id);
}

export default characterPersonalityQuiz;
