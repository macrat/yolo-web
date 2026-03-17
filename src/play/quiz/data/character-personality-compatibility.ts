import type { CompatibilityEntry } from "../types";
import { sharedArchetypeCompatibility } from "./character-personality-compat-shared";
import { differentArchetypeCompatibility } from "./character-personality-compat-different";

/**
 * Compatibility matrix for all 300 type combinations of the character personality quiz.
 * Keys are sorted pairs joined with "--" (e.g. "academic-artist--blazing-canvas").
 *
 * Batch 1 (task-6): Self-pairs — 24 entries (same character × same character).
 * Batch 2 (task-7): Shared-archetype pairs — 124 entries (at least one shared archetype).
 * Batch 3 (task-8): Different-archetype pairs — 152 entries (no shared archetype).
 *
 * Theme for Batch 1: "似た者同士あるある" — amplified strengths and resonating quirks, depicted with humor.
 */
const selfPairCompatibility: Record<string, CompatibilityEntry> = {
  // ─── Batch 1: Self-pairs (24 entries) ────────────────────────────────────

  // #1 blazing-strategist × blazing-strategist
  // commander×professor: deadline genius × deadline genius
  // Both run mental simulations before acting; together the simulations collide.
  "blazing-strategist--blazing-strategist": {
    label: "締切3分前の頭脳戦争",
    description:
      "二人とも締切3分前にギアが全開になる。作戦が5手先まで見えているが、どちらの作戦が正しいかで本番より長い議論になる。気づいたら締切は延びている。",
  },

  // #2 blazing-poet × blazing-poet
  // commander×dreamer: burst of passion + immediate distraction by the sky
  // Both charge forward then simultaneously get derailed by a beautiful idea.
  "blazing-poet--blazing-poet": {
    label: "全力疾走と途中離脱の連鎖",
    description:
      "「行くぞ！」と二人同時に走り出して、3秒後に二人同時に空を見上げる。巻き込んだチームの全員が置いてけぼりになるが、本人たちは「最高のスタートだった」と言う。",
  },

  // #3 blazing-schemer × blazing-schemer
  // commander×trickster: two people who immediately abandon the orthodox path
  // Both find shortcuts; chaos when two shortcuts clash.
  "blazing-schemer--blazing-schemer": {
    label: "裏道が渋滞する日",
    description:
      "正攻法を2秒で飽きた者同士が裏道を目指す。二人の「もっといい抜け道」が異なるため、裏道の入口で鉢合わせ。「いや俺の方が近道」論争が始まり、普通に正面突破した方が速かったと後で気づく。",
  },

  // #4 blazing-warden × blazing-warden
  // commander×guardian: two leaders who confirm everyone is present while running
  // Both shout "Is everyone here?" — mutual confirmation loop ensues.
  "blazing-warden--blazing-warden": {
    label: "確認し合って前に進めない先頭二人",
    description:
      "「全員いるか！」「いるか！」と先頭同士が叫び合う。誰かが遅れると両方が止まって待つので、後ろの人は思いがけず休憩できる。チームで一番安全なのに一番進まないコンビ。",
  },

  // #5 blazing-canvas × blazing-canvas
  // commander×artist: two people who start with zero plan and ignite at deadline
  // Both enter the "flow" at the same time — productive chaos.
  "blazing-canvas--blazing-canvas": {
    label: "締切1時間前の傑作工場",
    description:
      "二人とも計画ゼロで走り出し、締切1時間前に同時にスイッチが入る。消しては塗り直す音が重なり合い、作業スペースが壮絶なことになるが、なぜか二作品とも傑作になる。",
  },

  // #6 dreaming-scholar × dreaming-scholar
  // professor×dreamer: both build elaborate theories from imagination
  // Two people who generate boundless hypotheses in bed at 4am.
  "dreaming-scholar--dreaming-scholar": {
    label: "朝4時の相互論文査読会",
    description:
      "「量子力学で夢を説明できるのでは」と一人が言い、もう一人が「吾輩にも理論がある」と返す。夜明けまでに3つの新説が爆誕する。どちらも論文を書く前に次の妄想が始まる。",
  },

  // #7 contrarian-professor × contrarian-professor
  // professor×trickster: both add alternative interpretations after giving the answer
  // When two "alternative explanation" people meet, the alternatives multiply.
  "contrarian-professor--contrarian-professor": {
    label: "別解が止まらない無限追記",
    description:
      "「でも違う解釈だと…」「さらに別解がある」と交互に追加し続ける。議題1件の処理に2時間。会議室を出る頃には誰も元の結論を覚えていないが、二人だけが充実した顔をしている。",
  },

  // #8 careful-scholar × careful-scholar
  // professor×guardian: both confirm safety 17 times before starting
  // Two people who verify everything — confirmation of confirmation begins.
  "careful-scholar--careful-scholar": {
    label: "確認の確認で始まらない実験",
    description:
      "「念のためもう一回確認しよう」「吾輩もそう思っていた」と頷き合う。確認リストが1から始まって47まで伸び、実験開始は翌日になる。でも失敗率は限りなくゼロに近い。",
  },

  // #9 academic-artist × academic-artist
  // professor×artist: both see poetry in data; double the lyrical analysis
  // Two people who turn graphs into poems — the most literary lab ever.
  "academic-artist--academic-artist": {
    label: "数式詩の相互鑑賞会",
    description:
      "「このグラフ、美しくないか」「詩みたいだよ」と頷き合い、レポート提出が2時間遅れる。完成物の文章が美しすぎて採点者が困惑するのも毎回セット。",
  },

  // #10 star-chaser × star-chaser
  // dreamer×trickster: both dream big while immediately self-heckling
  // Two self-heckling dreamers — the heckling amplifies until both laugh.
  "star-chaser--star-chaser": {
    label: "夢と自己ツッコミの無限往復",
    description:
      "「いつか絶対やる」「でもそれ普通じゃないよね」「やるよ?」「でもさ…」と二人で夢と逆張りを往復する。結論は出ないが、夜中の3時に同じキーワードを検索しているのは二人とも一緒。",
  },

  // #11 tender-dreamer × tender-dreamer
  // dreamer×guardian: both design "a world where everyone is happy" + worry loop
  // Two people who worry about each other while designing utopia.
  "tender-dreamer--tender-dreamer": {
    label: "心配し合うユートピア設計士",
    description:
      "「みんなが幸せな世界」を二人で設計しながら、「あの一言、あなたを傷つけなかったかな」と互いに心配している。設計図は47回磨かれ、心配もそれと同じ数だけ積み重なる。",
  },

  // #12 dreaming-canvas × dreaming-canvas
  // dreamer×artist: both convert reality into vivid internal narratives
  // Two people who write background stories for strangers on trains — a collaborative novel.
  "dreaming-canvas--dreaming-canvas": {
    label: "向かいの乗客に全員裏設定が生まれる電車",
    description:
      "電車の向かいの人に二人それぞれが別の人生を付与する。「この人、元バレリーナかも」「いや実は天文学者じゃないかな」と脳内映画が競作になり、降りる駅を乗り過ごすのはいつも二人同時。",
  },

  // #13 clever-guardian × clever-guardian
  // trickster×guardian: both find exploitable holes and plug them
  // Two security-brain people patching the same system from different angles.
  "clever-guardian--clever-guardian": {
    label: "穴を見つけ合うセキュリティ競技",
    description:
      "一人が「ここ悪用できる」と穴を見つけると、もう一人がすでに塞いでいる。「そこも対策済みっしょ」「じゃあここは?」と延々続き、システムは鉄壁になるが本来の作業が3日止まる。",
  },

  // #14 creative-disruptor × creative-disruptor
  // trickster×artist: both intentionally subvert the obvious choice
  // Two "why do it the normal way?" people — their disruptions collide.
  "creative-disruptor--creative-disruptor": {
    label: "王道を外した先で鉢合わせる二人",
    description:
      "「なんで王道でいくの?」と二人同時に言い、それぞれ別の方向に外す。どちらも「刺さった」瞬間にしか満足しないため、刺さり具合を比較する謎のサブ競技が始まる。",
  },

  // #15 gentle-fortress × gentle-fortress
  // guardian×artist: both notice micro-changes in others' expressions; both exhaust themselves
  // Two people who care for others while being secretly the most tired.
  "gentle-fortress--gentle-fortress": {
    label: "互いの疲れに先に気づくコンビ",
    description:
      "お互いの顔色の0.5ミリの曇りをすぐ感知して「大丈夫?」と先に言い合う。二人とも一番しんどいのに一番しんどそうに見せない。「どっちが先にしんどいか競争」を無意識にやっている。",
  },

  // #16 ultimate-commander × ultimate-commander
  // commander×commander: pure action energy — two people who move before thinking
  // Referenced from Q25 commander--commander style.
  "ultimate-commander--ultimate-commander": {
    label: "動き出す前に動いている二人",
    description:
      "「考えるより動け」を二人同時に実践する。作戦会議の前に体が動き出し、気づいたら別々の方向に突撃している。終わった後で合流して「結果オーライ」と言うのがルーティン。",
  },

  // #17 endless-researcher × endless-researcher
  // professor×professor: both keep saying "a little more research first"
  // Referenced from Q25 professor--professor style.
  "endless-researcher--endless-researcher": {
    label: "「もう少し調べてから」の相互承認",
    description:
      "「まだ情報が足りない」「吾輩もそう思う」と互いに承認し合い、調査リストが倍速で膨らむ。十分な情報が揃ったのに「万全を期すため」と言ってさらに1週間調べ続ける最強の踏み出せないコンビ。",
  },

  // #18 eternal-dreamer × eternal-dreamer
  // dreamer×dreamer: both say "someday" while having traveled 47 times in their heads
  // Referenced from Q25 dreamer--dreamer style.
  "eternal-dreamer--eternal-dreamer": {
    label: "脳内で先に出発している旅仲間",
    description:
      "「いつか一緒に旅しようね」「素敵ですわ」と言い合って2年。日程は未定のまま、脳内では同じ旅を47回経験している。次の「いつか」の話が始まる頃には、旅先の選択肢が200を超えている。",
  },

  // #19 ultimate-trickster × ultimate-trickster
  // trickster×trickster: both read beyond all layers of intent
  // Referenced from Q25 trickster--trickster style.
  "ultimate-trickster--ultimate-trickster": {
    label: "裏の読み合いが次元を超えた日",
    description:
      "「その発言の真意は?」「それを聞いてくること自体が罠っしょ」と無限ループに入る。3時間かけて解読した結論が「腹減った」だった経験が二人とも年に5回ある。それでも楽しい。",
  },

  // #20 ultimate-guardian × ultimate-guardian
  // guardian×guardian: both carry 7 umbrellas on sunny days
  // Referenced from Q25 guardian--guardian style.
  "ultimate-guardian--ultimate-guardian": {
    label: "持ち物リストが合体する準備",
    description:
      "「念のため」が口癖の二人が合流すると、持ち物リストが瞬時に12ページになる。晴れ予報の日に傘を計14本携行し、「これで大丈夫かな?」と互いに確認し合って出発が30分遅れる。",
  },

  // #21 ultimate-artist × ultimate-artist
  // artist×artist: both repeat "something's off" 1000 times
  // Referenced from Q25 artist--artist style.
  "ultimate-artist--ultimate-artist": {
    label: "「なんか違う」が重なり合う工房",
    description:
      "「なんか違う」「わかる、なんか違う」と頷き合い、完成品を二人で50回手直しする。外から見るといつでも完成しているが、二人には永遠に「まだ」が見えている。最も美しく最も終わらない共同作業。",
  },

  // #22 data-fortress × data-fortress
  // guardian×professor: both convert worry into data before relaxing
  // Two people who only feel "okay" after finding numerical evidence.
  "data-fortress--data-fortress": {
    label: "不安をデータにする相互エビデンス会",
    description:
      "「気のせいかな」と言えない二人が根拠を出し合う。一人が論文3本を提示すると、もう一人がさらに5本を積む。「大丈夫」という確信が生まれるのは最速で翌朝だが、その分の安心度は世界最高。",
  },

  // #23 vibe-rebel × vibe-rebel
  // artist×trickster: both follow intuition and end up far from everyone else
  // Two people who run in their own direction — they find each other at the fringe.
  "vibe-rebel--vibe-rebel": {
    label: "端っこで偶然出会う一匹狼二人",
    description:
      "それぞれ直感の方向に走ったら、同じ端っこで鉢合わせる。「なんでここにいるの?」「なんとなく?」「わかる」。説明しなくても通じる唯一の相手かもしれないが、二人とも群れるのが苦手なので集まり続けるかどうかは謎。",
  },

  // #24 guardian-charger × guardian-charger
  // guardian×commander: both stay in back, but both charge forward when necessary
  // Two people who hesitate to lead but both step up at the same critical moment.
  "guardian-charger--guardian-charger": {
    label: "必要な瞬間に二人同時に前に出る",
    description:
      "普段は後方でお互いの顔色を確認し合っている。いざという時、0秒で二人が同時に前に出る。終わった後まず「あなた大丈夫?」と互いに確認して、自分の心拍数を落ち着かせるのは最後の最後。",
  },
};

/**
 * Merged compatibility matrix containing all 300 entries:
 *   - 24 self-pairs
 *   - 124 shared-archetype pairs
 *   - 152 completely-different-archetype pairs
 */
export const compatibilityMatrix: Record<string, CompatibilityEntry> = {
  ...selfPairCompatibility,
  ...sharedArchetypeCompatibility,
  ...differentArchetypeCompatibility,
};
