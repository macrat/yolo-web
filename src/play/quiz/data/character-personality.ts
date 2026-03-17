import type { QuizDefinition, CompatibilityEntry } from "../types";
export type { CompatibilityEntry };
import { resultsBatch1 } from "./character-personality-results-batch1";
import { resultsBatch2 } from "./character-personality-results-batch2";
import { resultsBatch3 } from "./character-personality-results-batch3";
import { compatibilityMatrix } from "./character-personality-compatibility";

export { compatibilityMatrix };

/**
 * Character Personality Quiz (あなたに似たキャラ診断)
 *
 * 4-axis personality model mapping to 24 character archetypes:
 *   A (Action):     active(+) vs reflective(-)
 *   S (Social):     outward(+) vs inward(-)
 *   P (Perception): logical(+) vs sensory(-)
 *   E (Energy):     burst(+) vs steady(-)
 *
 * 24 result types built from 6 base archetypes:
 *   commander, professor, dreamer, trickster, guardian, artist
 *
 * blazing-*:  commander primary (5 types)
 * dreaming-*: professor × dreamer / dreamer × dreamer variants
 * *-scholar:  professor primary (4 types)
 * star-chaser / tender-dreamer / dreaming-canvas / eternal-dreamer: dreamer primary (4 types)
 * clever-guardian / creative-disruptor: trickster primary (2 types)
 * gentle-fortress / ultimate-guardian / data-fortress / guardian-charger: guardian primary (4 types)
 * ultimate-artist / vibe-rebel: artist primary (2 types)
 * + 5 same-type doubles (ultimate-commander, endless-researcher, eternal-dreamer,
 *   ultimate-trickster, ultimate-guardian, ultimate-artist)
 *
 * Scoring: method B (direct point allocation).
 * Each choice awards 2pt (primary × 2 types) + 1pt (secondary × 2 types).
 *
 * Distribution verified: each of the 24 types receives
 *   Primary: 3–5 slots  Secondary: 3–5 slots  Total: 10–14 pts
 */
const characterPersonalityQuiz: QuizDefinition = {
  meta: {
    slug: "character-personality",
    title: "あなたに似たキャラ診断",
    description:
      "12個の日常シチュエーションに答えて、あなたの性格に最もよく似たキャラクターを発見しましょう。「締切3分前に本気出す炎の司令塔」や「夢の中で論文を書く学術夢想家」など、24タイプのキャラクターの中からあなたにぴったりのキャラが見つかります。友達との相性診断もできます!",
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
    trustLevel: "generated",
    trustNote:
      "スコア計算は正確です。キャラクターと診断結果はAIが創作したエンターテインメントです。",
  },
  questions: [
    // Q1: 朝の目覚め方 (主軸: Action, 副軸: Energy)
    {
      id: "q1",
      text: "休日の朝8時、アラームなしで目覚めた。あなたがまず取る行動は?",
      choices: [
        {
          id: "q1-a",
          text: "「よし今日も動くか!」とベッドから飛び起きて、そのまま外に出る計画を立て始める",
          points: {
            "blazing-schemer": 2,
            "ultimate-commander": 2,
            "blazing-warden": 1,
            "blazing-poet": 1,
          },
        },
        {
          id: "q1-b",
          text: "スマホを手に取り、気になってたことをとりあえず調べ始める",
          points: {
            "ultimate-trickster": 2,
            "clever-guardian": 2,
            "blazing-strategist": 1,
            "contrarian-professor": 1,
          },
        },
        {
          id: "q1-c",
          text: "もう少しだけ...と布団にくるまって、頭の中で今日やりたいことを想像する",
          points: {
            "dreaming-canvas": 2,
            "ultimate-artist": 2,
            "eternal-dreamer": 1,
            "star-chaser": 1,
          },
        },
        {
          id: "q1-d",
          text: "「今日は何もしなくていい日だ」とじわじわ確認してから、ゆっくり体を起こす",
          points: {
            "ultimate-guardian": 2,
            "data-fortress": 2,
            "gentle-fortress": 1,
            "guardian-charger": 1,
          },
        },
      ],
    },
    // Q2: 買い物の判断 (主軸: Action, 副軸: Perception)
    {
      id: "q2",
      text: "ネットで気になるアイテムを見つけた。購入ボタンの前でどうする?",
      choices: [
        {
          id: "q2-a",
          text: "「欲しい!」と感じたらもうポチっている。後で理由を考える",
          points: {
            "blazing-poet": 2,
            "creative-disruptor": 2,
            "blazing-canvas": 1,
            "vibe-rebel": 1,
          },
        },
        {
          id: "q2-b",
          text: "レビューと比較サイトを見て、スプレッドシートに整理してから決める",
          points: {
            "endless-researcher": 2,
            "contrarian-professor": 2,
            "gentle-fortress": 1,
            "data-fortress": 1,
          },
        },
        {
          id: "q2-c",
          text: "値段と機能を5分で確認して「まあいけるでしょ」と購入する",
          points: {
            "blazing-strategist": 2,
            "ultimate-trickster": 2,
            "blazing-schemer": 1,
            "blazing-warden": 1,
          },
        },
        {
          id: "q2-d",
          text: "「本当に必要?」と自問して、1日置いて翌日また考える",
          points: {
            "careful-scholar": 2,
            "dreaming-scholar": 2,
            "academic-artist": 1,
            "eternal-dreamer": 1,
          },
        },
      ],
    },
    // Q3: 集団での立ち位置 (主軸: Social, 副軸: Action)
    {
      id: "q3",
      text: "初めて参加するグループイベント。あなたの動き方は?",
      choices: [
        {
          id: "q3-a",
          text: "まず全員に話しかけて、場の空気を把握しようとする",
          points: {
            "ultimate-commander": 2,
            "blazing-warden": 2,
            "blazing-schemer": 1,
            "blazing-canvas": 1,
          },
        },
        {
          id: "q3-b",
          text: "隅っこで様子を観察してから、気が合いそうな人に声をかける",
          points: {
            "dreaming-canvas": 2,
            "eternal-dreamer": 2,
            "dreaming-scholar": 1,
            "tender-dreamer": 1,
          },
        },
        {
          id: "q3-c",
          text: "仲いい人の隣をキープして、その人越しに輪を広げる",
          points: {
            "ultimate-guardian": 2,
            "guardian-charger": 2,
            "blazing-strategist": 1,
            "data-fortress": 1,
          },
        },
        {
          id: "q3-d",
          text: "一人でいても全然平気。むしろ観察が楽しい",
          points: {
            "vibe-rebel": 2,
            "star-chaser": 2,
            "clever-guardian": 1,
            "ultimate-artist": 1,
          },
        },
      ],
    },
    // Q4: 問題解決のスタイル (主軸: Perception, 副軸: Action)
    {
      id: "q4",
      text: "仕事/学校でトラブルが発生した。まず何をする?",
      choices: [
        {
          id: "q4-a",
          text: "原因を構造的に整理してから、解決策を順番に考える",
          points: {
            "contrarian-professor": 2,
            "careful-scholar": 2,
            "endless-researcher": 1,
            "data-fortress": 1,
          },
        },
        {
          id: "q4-b",
          text: "「とにかく動きながら考えよう」と行動を始める",
          points: {
            "blazing-schemer": 2,
            "ultimate-commander": 2,
            "blazing-canvas": 1,
            "dreaming-canvas": 1,
          },
        },
        {
          id: "q4-c",
          text: "「なんかこっちじゃない気がする」という直感で方向を決める",
          points: {
            "tender-dreamer": 2,
            "blazing-poet": 2,
            "star-chaser": 1,
            "ultimate-artist": 1,
          },
        },
        {
          id: "q4-d",
          text: "思いつく限り手を打って、うまくいった道を広げる",
          points: {
            "creative-disruptor": 2,
            "ultimate-trickster": 2,
            "star-chaser": 1,
            "blazing-poet": 1,
          },
        },
      ],
    },
    // Q5: エネルギーの使い方 (主軸: Energy, 副軸: Action)
    {
      id: "q5",
      text: "1週間の締切がある大きな課題。あなたの取り組み方は?",
      choices: [
        {
          id: "q5-a",
          text: "最後の2日間で全力を出す。それまでは頭の中で熟成させる",
          points: {
            "blazing-canvas": 2,
            "creative-disruptor": 2,
            "ultimate-artist": 1,
            "vibe-rebel": 1,
          },
        },
        {
          id: "q5-b",
          text: "毎日少しずつコツコツ進める。急ぎすぎると質が落ちる",
          points: {
            "gentle-fortress": 2,
            "guardian-charger": 2,
            "careful-scholar": 1,
            "endless-researcher": 1,
          },
        },
        {
          id: "q5-c",
          text: "最初の3日で一気に片付けて、残りは余裕を楽しむ",
          points: {
            "blazing-warden": 2,
            "blazing-strategist": 2,
            "ultimate-commander": 1,
            "blazing-poet": 1,
          },
        },
        {
          id: "q5-d",
          text: "計画表を作って、均等なペースで進める",
          points: {
            "endless-researcher": 2,
            "tender-dreamer": 2,
            "clever-guardian": 1,
            "ultimate-guardian": 1,
          },
        },
      ],
    },
    // Q6: 感情の処理 (主軸: Social, 副軸: Perception)
    {
      id: "q6",
      text: "嬉しいことがあった! あなたの最初のリアクションは?",
      choices: [
        {
          id: "q6-a",
          text: "すぐ誰かに話したい。LINEかけるか直接会いに行く",
          points: {
            "blazing-warden": 2,
            "blazing-canvas": 2,
            "blazing-strategist": 1,
            "ultimate-commander": 1,
          },
        },
        {
          id: "q6-b",
          text: "一人でじっくり噛みしめる。この感情、大切にしたい",
          points: {
            "dreaming-canvas": 2,
            "vibe-rebel": 2,
            "eternal-dreamer": 1,
            "contrarian-professor": 1,
          },
        },
        {
          id: "q6-c",
          text: "「なぜ嬉しいのか」を分析しながら日記に書く",
          points: {
            "dreaming-scholar": 2,
            "academic-artist": 2,
            "ultimate-trickster": 1,
            "careful-scholar": 1,
          },
        },
        {
          id: "q6-d",
          text: "家族や近くにいる人にだけ伝える。広めたいわけじゃないけど",
          points: {
            "guardian-charger": 2,
            "ultimate-guardian": 2,
            "blazing-warden": 1,
            "data-fortress": 1,
          },
        },
      ],
    },
    // Q7: 創造的な作業 (主軸: Perception, 副軸: Energy)
    {
      id: "q7",
      text: "自由に何かを作っていい時間が3時間ある。あなたのアプローチは?",
      choices: [
        {
          id: "q7-a",
          text: "まず構成や設計図を考えてから、手を動かす",
          points: {
            "careful-scholar": 2,
            "academic-artist": 2,
            "dreaming-scholar": 1,
            "gentle-fortress": 1,
          },
        },
        {
          id: "q7-b",
          text: "気分で手を動かし始めて、完成形は後から決まる",
          points: {
            "ultimate-artist": 2,
            "vibe-rebel": 2,
            "creative-disruptor": 1,
            "eternal-dreamer": 1,
          },
        },
        {
          id: "q7-c",
          text: "「こういうのを作りたい」というイメージを先に固める",
          points: {
            "star-chaser": 2,
            "tender-dreamer": 2,
            "dreaming-canvas": 1,
            "endless-researcher": 1,
          },
        },
        {
          id: "q7-d",
          text: "過去に似たものを調べてから、自分なりの改良点を加える",
          points: {
            "contrarian-professor": 2,
            "clever-guardian": 2,
            "academic-artist": 1,
            "ultimate-trickster": 1,
          },
        },
      ],
    },
    // Q8: リスクへの姿勢 (主軸: Energy, 副軸: Social)
    {
      id: "q8",
      text: "「リターンは大きいがリスクもある」という選択肢が目の前に。あなたは?",
      choices: [
        {
          id: "q8-a",
          text: "リスクを細かく書き出して、対策を全部考えてから判断する",
          points: {
            "data-fortress": 2,
            "gentle-fortress": 2,
            "eternal-dreamer": 1,
            "ultimate-guardian": 1,
          },
        },
        {
          id: "q8-b",
          text: "「やってみてダメだったら次」くらいの気持ちで飛び込む",
          points: {
            "blazing-schemer": 2,
            "ultimate-commander": 2,
            "creative-disruptor": 1,
            "ultimate-trickster": 1,
          },
        },
        {
          id: "q8-c",
          text: "信頼できる人に相談してから決める",
          points: {
            "blazing-warden": 2,
            "guardian-charger": 2,
            "data-fortress": 1,
            "ultimate-guardian": 1,
          },
        },
        {
          id: "q8-d",
          text: "「失敗したらどう面白いか」まで想像してからGO",
          points: {
            "blazing-canvas": 2,
            "blazing-poet": 2,
            "creative-disruptor": 1,
            "vibe-rebel": 1,
          },
        },
      ],
    },
    // Q9: 記憶の仕方 (主軸: Perception, 副軸: Social)
    {
      id: "q9",
      text: "旅先で素敵な景色を見た。あなたの記録の仕方は?",
      choices: [
        {
          id: "q9-a",
          text: "写真を撮って、場所と状況をメモに残す",
          points: {
            "endless-researcher": 2,
            "contrarian-professor": 2,
            "academic-artist": 1,
            "dreaming-scholar": 1,
          },
        },
        {
          id: "q9-b",
          text: "目に焼き付けて、体に記憶させる。写真より本物",
          points: {
            "ultimate-trickster": 2,
            "eternal-dreamer": 2,
            "dreaming-canvas": 1,
            "tender-dreamer": 1,
          },
        },
        {
          id: "q9-c",
          text: "「この光、あの映画のシーンみたいだ」と物語に変換して覚える",
          points: {
            "star-chaser": 2,
            "ultimate-artist": 2,
            "blazing-poet": 1,
            "vibe-rebel": 1,
          },
        },
        {
          id: "q9-d",
          text: "SNSに投稿して、誰かと感動を共有したい",
          points: {
            "blazing-strategist": 2,
            "blazing-warden": 2,
            "blazing-canvas": 1,
            "ultimate-commander": 1,
          },
        },
      ],
    },
    // Q10: 他者との関わり (主軸: Social, 副軸: Energy)
    {
      id: "q10",
      text: "久しぶりに会う人がいる。どんな気持ちになる?",
      choices: [
        {
          id: "q10-a",
          text: "ワクワク! 話したいことが山ほどある",
          points: {
            "blazing-strategist": 2,
            "ultimate-commander": 2,
            "blazing-schemer": 1,
            "blazing-warden": 1,
          },
        },
        {
          id: "q10-b",
          text: "普通に楽しみ。まあ会ってみれば盛り上がるでしょ",
          points: {
            "clever-guardian": 2,
            "contrarian-professor": 2,
            "academic-artist": 1,
            "blazing-strategist": 1,
          },
        },
        {
          id: "q10-c",
          text: "少し緊張するが、話し始めれば大丈夫",
          points: {
            "tender-dreamer": 2,
            "gentle-fortress": 2,
            "dreaming-scholar": 1,
            "guardian-charger": 1,
          },
        },
        {
          id: "q10-d",
          text: "その人のことを事前にいろいろ思い出して、心の準備をする",
          points: {
            "dreaming-scholar": 2,
            "academic-artist": 2,
            "clever-guardian": 1,
            "contrarian-professor": 1,
          },
        },
      ],
    },
    // Q11: ルーティンと変化 (主軸: Action, 副軸: Energy)
    {
      id: "q11",
      text: "いつも通りのやり方と、新しいやり方が選べる。あなたは?",
      choices: [
        {
          id: "q11-a",
          text: "新しい方を即試す。失敗しても知見になるから",
          points: {
            "blazing-schemer": 2,
            "ultimate-trickster": 2,
            "blazing-canvas": 1,
            "creative-disruptor": 1,
          },
        },
        {
          id: "q11-b",
          text: "いつも通りが安心。変化にはエネルギーがいる",
          points: {
            "ultimate-guardian": 2,
            "data-fortress": 2,
            "guardian-charger": 1,
            "tender-dreamer": 1,
          },
        },
        {
          id: "q11-c",
          text: "「本当に新しいやり方の方がいいの?」とまず検証する",
          points: {
            "endless-researcher": 2,
            "careful-scholar": 2,
            "contrarian-professor": 1,
            "dreaming-scholar": 1,
          },
        },
        {
          id: "q11-d",
          text: "気分で決める。その日の直感に従う",
          points: {
            "ultimate-artist": 2,
            "vibe-rebel": 2,
            "clever-guardian": 1,
            "star-chaser": 1,
          },
        },
      ],
    },
    // Q12: 将来の計画 (主軸: Energy, 副軸: Perception)
    {
      id: "q12",
      text: "5年後の自分について考えるとき、どんなイメージが浮かぶ?",
      choices: [
        {
          id: "q12-a",
          text: "具体的なマイルストーンが思い浮かぶ。逆算で計画を立てたい",
          points: {
            "data-fortress": 2,
            "gentle-fortress": 2,
            "careful-scholar": 1,
            "endless-researcher": 1,
          },
        },
        {
          id: "q12-b",
          text: "ぼんやりした景色が浮かぶ。詳細より「雰囲気」が先",
          points: {
            "eternal-dreamer": 2,
            "star-chaser": 2,
            "dreaming-canvas": 1,
            "ultimate-artist": 1,
          },
        },
        {
          id: "q12-c",
          text: "「あの時やっておけばよかった」を減らしたいと思う",
          points: {
            "ultimate-guardian": 2,
            "guardian-charger": 2,
            "gentle-fortress": 1,
            "tender-dreamer": 1,
          },
        },
        {
          id: "q12-d",
          text: "ワクワクする未来像が次々と浮かんでくる。絞れない",
          points: {
            "blazing-canvas": 2,
            "creative-disruptor": 2,
            "blazing-poet": 1,
            "vibe-rebel": 1,
          },
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
