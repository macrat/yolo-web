import type { CompatibilityEntry } from "../types";

/**
 * Compatibility entries for pairs sharing at least one archetype (primary or secondary).
 * Self-pairs (xxx--xxx) are excluded (handled in a separate batch).
 * Keys are sorted alphabetically and joined with "--".
 *
 * Archetype groups:
 *   commander: blazing-strategist, blazing-poet, blazing-schemer, blazing-warden,
 *              blazing-canvas, ultimate-commander, guardian-charger
 *   professor: blazing-strategist, dreaming-scholar, contrarian-professor,
 *              careful-scholar, academic-artist, endless-researcher, data-fortress
 *   dreamer:   blazing-poet, dreaming-scholar, star-chaser, tender-dreamer,
 *              dreaming-canvas, eternal-dreamer
 *   trickster: blazing-schemer, contrarian-professor, star-chaser, clever-guardian,
 *              creative-disruptor, ultimate-trickster, vibe-rebel
 *   guardian:  blazing-warden, careful-scholar, tender-dreamer, clever-guardian,
 *              gentle-fortress, ultimate-guardian, data-fortress, guardian-charger
 *   artist:    blazing-canvas, academic-artist, dreaming-canvas, creative-disruptor,
 *              gentle-fortress, ultimate-artist, vibe-rebel
 */
export const sharedArchetypeCompatibility: Record<string, CompatibilityEntry> =
  {
    // ==========================================
    // commander共有ペア
    // ==========================================

    // blazing-strategist (cmd+prf) × blazing-poet (cmd+drm)
    "blazing-poet--blazing-strategist": {
      label: "熱量の方向が違う同志",
      description:
        "どちらも「やるぞ!」で走り出すが、策士は3手先を見ながら走り、詩人は走りながら空を見上げる。進む速度は同じなのに辿り着く場所がいつも違う。",
    },

    // blazing-strategist (cmd+prf) × blazing-schemer (cmd+tri)
    "blazing-schemer--blazing-strategist": {
      label: "爆速の二択論争",
      description:
        "策士は「論理的に考えるとこの道だ」、謀略家は「でもこっちの裏道の方が早い」と言い合う。どちらが正しいかより、どちらが先に動くかで決まる。",
    },

    // blazing-strategist (cmd+prf) × blazing-warden (cmd+grd)
    "blazing-strategist--blazing-warden": {
      label: "先頭と後方の二人司令",
      description:
        "策士は先頭で計算を走らせ、守護司令塔は「全員ついてきてるか!」と叫ぶ。役割が自然に分かれ、チームの前後をこの二人が完璧にカバーする。",
    },

    // blazing-strategist (cmd+prf) × blazing-canvas (cmd+art)
    "blazing-canvas--blazing-strategist": {
      label: "設計図と衝動の化学反応",
      description:
        "策士が「こう動けば成功する」と整理した計画を、画家が感性で「でもこっちの方が美しい」と塗り替える。完成物はいつも予想の斜め上に着地する。",
    },

    // blazing-strategist (cmd+prf) × ultimate-commander (cmd+cmd)
    "blazing-strategist--ultimate-commander": {
      label: "理屈と根性の合体技",
      description:
        "覇王が「考えるより動け」と言い、策士が「動きながら考える」と返す。方針は一致しているのに進め方が微妙に違い、結果的に最速かつ最適なルートが生まれる。",
    },

    // blazing-strategist (cmd+prf) × guardian-charger (grd+cmd)
    "blazing-strategist--guardian-charger": {
      label: "攻守の自然な棲み分け",
      description:
        "策士が前線で論理を振りかざす間、守護者は「後方は私が持つ」と盾になる。お互いの役割を説明したことは一度もないが、すでに完璧に連携している。",
    },

    // blazing-poet (cmd+drm) × blazing-schemer (cmd+tri)
    "blazing-poet--blazing-schemer": {
      label: "炎と策の大暴走",
      description:
        "詩人が「行くぞ!」と煽り、謀略家が「どうせなら裏道で行こう」と誘う。勢いと策略が合わさって、誰も想定しなかった方向に事態が展開する。",
    },

    // blazing-poet (cmd+drm) × blazing-warden (cmd+grd)
    "blazing-poet--blazing-warden": {
      label: "夢と責任の熱い相棒",
      description:
        "詩人が夢を語りながら走り、守護司令塔が「全員ついてきてるか!」と振り返る。ビジョンと責任感がセットで動くので、誰も置いてかれない熱量の旅になる。",
    },

    // blazing-poet (cmd+drm) × blazing-canvas (cmd+art)
    "blazing-canvas--blazing-poet": {
      label: "感性の二重奏",
      description:
        "詩人は「なぜこれをやるのか」を感じながら走り、画家は「どう美しく仕上げるか」を描きながら走る。進む方向はバラバラでも、出来上がるものは確かに美しい。",
    },

    // blazing-poet (cmd+drm) × ultimate-commander (cmd+cmd)
    "blazing-poet--ultimate-commander": {
      label: "熱量の強火と中火",
      description:
        "覇王が全開で突っ走る傍ら、詩人が「ちょっと待って、あの夕焼けきれいじゃない?」と立ち止まる。覇王は苦笑いしながらも、実は詩人の感性に何度も救われている。",
    },

    // blazing-poet (cmd+drm) × guardian-charger (grd+cmd)
    "blazing-poet--guardian-charger": {
      label: "夢見る先頭と守る盾",
      description:
        "詩人が夢を語りながら前に進み、守護者が「後ろは私が守る」と盾になる。詩人は後ろを見ないが、いつも守られていることを感覚で知っている。",
    },

    // blazing-schemer (cmd+tri) × blazing-warden (cmd+grd)
    "blazing-schemer--blazing-warden": {
      label: "抜け道と安全確認の問答",
      description:
        "謀略家が「裏道で行こう」と言うたびに、守護司令塔が「全員通れるか確認した?」と返す。スピードと安全性を両立させるこの二人のやり取りは、毎回攻防戦になる。",
    },

    // blazing-schemer (cmd+tri) × blazing-canvas (cmd+art)
    "blazing-canvas--blazing-schemer": {
      label: "奇策と衝動の共犯関係",
      description:
        "謀略家が仕掛けた奇策に、画家が「それ面白い!」と飛びついて感性で仕上げる。計算と直感が混ざり合い、後から誰も再現できない傑作が生まれる。",
    },

    // blazing-schemer (cmd+tri) × ultimate-commander (cmd+cmd)
    "blazing-schemer--ultimate-commander": {
      label: "正面突破と側面攻略",
      description:
        "覇王が正面から全力でぶつかる横で、謀略家が「実は裏口があるんだよね」と笑う。力と策略の組み合わせで、難攻不落の問題が面白いほど崩れていく。",
    },

    // blazing-schemer (cmd+tri) × guardian-charger (grd+cmd)
    "blazing-schemer--guardian-charger": {
      label: "奇手と盾の奇妙な均衡",
      description:
        "謀略家が「こっちから崩そう」と言い、守護者が「それで後方は大丈夫か?」と確認する。リスクを取る者と守る者が同じチームにいる、緊張感のある最強ペア。",
    },

    // blazing-warden (cmd+grd) × blazing-canvas (cmd+art)
    "blazing-canvas--blazing-warden": {
      label: "守りながら描く二人旅",
      description:
        "守護司令塔が「全員安全か?」と確認しながら進む横で、画家が「この景色、残しておきたい」と足を止める。責任感と感性が同居する、温かみのある旅路。",
    },

    // blazing-warden (cmd+grd) × ultimate-commander (cmd+cmd)
    "blazing-warden--ultimate-commander": {
      label: "全開と全員確認の攻防",
      description:
        "覇王が「止まるな全員前だ!」と叫ぶ中、守護司令塔が「最後の一人を待ってから行く」と譲らない。この二人が揃うとチームが最速かつ誰も脱落しない奇跡が起きる。",
    },

    // blazing-warden (cmd+grd) × guardian-charger (grd+cmd)
    "blazing-warden--guardian-charger": {
      label: "守りの双璧、前後を固める",
      description:
        "守護司令塔が前列の安全を確認しながら進み、守護者が後方から盾になる。どちらも「仲間を守るために前に出る」という本能を持つ、信頼の厚い二人組。",
    },

    // blazing-canvas (cmd+art) × ultimate-commander (cmd+cmd)
    "blazing-canvas--ultimate-commander": {
      label: "爆走と美しい残像",
      description:
        "覇王が全速力で突き進む道に、画家が「待って、あの光の入り方がすごい」と立ち止まる。覇王は引っ張り、画家は彩る。軌跡が自然と芸術作品になるコンビ。",
    },

    // blazing-canvas (cmd+art) × guardian-charger (grd+cmd)
    "blazing-canvas--guardian-charger": {
      label: "描きながら守る二人の行軍",
      description:
        "画家が感性のまま突き進む横で、守護者が「後方は私が守る」と盾になる。画家は守られているとは気づかないが、そのおかげで迷いなく描き続けられている。",
    },

    // ultimate-commander (cmd+cmd) × guardian-charger (grd+cmd)
    "guardian-charger--ultimate-commander": {
      label: "前進本能と逆算の盾",
      description:
        "覇王が「全員前へ」と叫ぶ横で、守護者が「後方を確保してから前に出る」と動く。目指す方向は同じでも、アプローチが真逆。この二人が組むと前後が完璧に守られる。",
    },

    // ==========================================
    // professor共有ペア
    // ==========================================

    // blazing-strategist (cmd+prf) × dreaming-scholar (prf+drm)
    "blazing-strategist--dreaming-scholar": {
      label: "行動と白昼夢の知的対話",
      description:
        "策士が「で、その研究どう使う?」と詰め寄り、学術夢想家が「使い方より面白さが大事で...」と答える。お互い論理は通っているのに、向いている方向が90度ずれている。",
    },

    // blazing-strategist (cmd+prf) × contrarian-professor (prf+tri)
    "blazing-strategist--contrarian-professor": {
      label: "答えを出す者と疑う者",
      description:
        "策士が「これで行こう」と決断した直後に、へそ曲がり博士が「でも別の解釈だと...」と追加する。策士はため息をつくが、その追加意見のおかげで判断が一段精緻になる。",
    },

    // blazing-strategist (cmd+prf) × careful-scholar (prf+grd)
    "blazing-strategist--careful-scholar": {
      label: "スピードと念入り確認",
      description:
        "策士が5分で判断を下す横で、慎重博士が「念のためもう一回確認しよう」と言う。速さと確実性のどちらが正解かは場面による。この二人がいれば両方使い分けられる。",
    },

    // blazing-strategist (cmd+prf) × academic-artist (prf+art)
    "academic-artist--blazing-strategist": {
      label: "実利と詩情の知的衝突",
      description:
        "策士が「効率よくやろう」と言い、データの詩人が「でもこの問題、美しい構造してるよね」と感動している。目的は同じなのに、見えているものが全然違う。",
    },

    // blazing-strategist (cmd+prf) × endless-researcher (prf+prf)
    "blazing-strategist--endless-researcher": {
      label: "「もういい」と「もう少し」",
      description:
        "策士が「それだけ調べれば十分だ、行動しよう」と促し、永遠の研究者が「もう少し調べてから」と返す。この問答を10回繰り返して、ようやく最強の準備が整う。",
    },

    // blazing-strategist (cmd+prf) × data-fortress (grd+prf)
    "blazing-strategist--data-fortress": {
      label: "論理の攻めと論理の守り",
      description:
        "策士が論理で「こう攻めるべきだ」と言い、論理的守護者が「その攻めのリスクをデータで確認した」と返す。同じ武器を攻撃と防御に使う、鏡のようなペア。",
    },

    // dreaming-scholar (prf+drm) × contrarian-professor (prf+tri)
    "contrarian-professor--dreaming-scholar": {
      label: "夢想と反論の無限ループ",
      description:
        "学術夢想家が「こんな研究したら面白い!」と提案すると、へそ曲がり博士が「でもこういう反証があって...」と返す。夢はどんどん精緻になるが、一向に実験が始まらない。",
    },

    // dreaming-scholar (prf+drm) × careful-scholar (prf+grd)
    "careful-scholar--dreaming-scholar": {
      label: "夢想と慎重の共同研究",
      description:
        "学術夢想家が「この方向で研究しよう」と白昼夢を語り、慎重博士が「安全性を確認してから始めよう」と落ち着かせる。進むのは遅いが、失敗したことがない。",
    },

    // dreaming-scholar (prf+drm) × academic-artist (prf+art)
    "academic-artist--dreaming-scholar": {
      label: "数式と夢想の詩的融合",
      description:
        "学術夢想家が夢の設定資料集を作り、データの詩人が「これ、論文としても美しいよ」と感動する。実現不可能な研究計画に芸術的な価値が生まれていく。",
    },

    // dreaming-scholar (prf+drm) × endless-researcher (prf+prf)
    "dreaming-scholar--endless-researcher": {
      label: "調べる深さと夢想の高さ",
      description:
        "永遠の研究者が地の底まで調べ、学術夢想家が空の果てまで妄想する。二人の知識の守備範囲を合わせると、宇宙の端から端まで届く理論が完成しそうになる。",
    },

    // dreaming-scholar (prf+drm) × data-fortress (grd+prf)
    "data-fortress--dreaming-scholar": {
      label: "根拠と夢想の奇妙な共鳴",
      description:
        "論理的守護者が「心配の根拠を調べた」と数値を出すと、学術夢想家が「その数値、別の解釈もできて面白い」と白昼夢に発展させる。不安がいつのまにか研究に変わる。",
    },

    // contrarian-professor (prf+tri) × careful-scholar (prf+grd)
    "careful-scholar--contrarian-professor": {
      label: "疑問と慎重の二重チェック",
      description:
        "慎重博士が「念のため確認した」と報告すると、へそ曲がり博士が「でも違う角度から見ると見落としがある」と指摘する。この二人が通過した計画は、穴がない。",
    },

    // contrarian-professor (prf+tri) × academic-artist (prf+art)
    "academic-artist--contrarian-professor": {
      label: "反論と感性の知的遊び",
      description:
        "データの詩人が「これ美しいよね」と言うと、へそ曲がり博士が「美しさの定義が曖昧だけど...」と突っ込む。詩人は怒らず「じゃあ定義から考えよう」と乗ってくる。",
    },

    // contrarian-professor (prf+tri) × endless-researcher (prf+prf)
    "contrarian-professor--endless-researcher": {
      label: "不足と別解の連鎖",
      description:
        "永遠の研究者が「もう少し調べてから」と言い、へそ曲がり博士が「その調べ方に別の視点が必要」と追加する。この二人が揃うと、準備が永遠に完了しない。",
    },

    // contrarian-professor (prf+tri) × data-fortress (grd+prf)
    "contrarian-professor--data-fortress": {
      label: "反論とデータの頭脳バトル",
      description:
        "論理的守護者がデータで心配を証明すると、へそ曲がり博士が「そのデータの解釈、別のパターンもある」と切り込む。議論は終わらないが、最終結論の精度は異様に高い。",
    },

    // careful-scholar (prf+grd) × academic-artist (prf+art)
    "academic-artist--careful-scholar": {
      label: "確認と感動の研究室",
      description:
        "慎重博士が17回確認してから「よし、大丈夫」と言うと、データの詩人が「そのプロセス自体が美しい」と感動している。一人は安全のため、一人は美のために、同じことをしている。",
    },

    // careful-scholar (prf+grd) × endless-researcher (prf+prf)
    "careful-scholar--endless-researcher": {
      label: "慎重さの二乗",
      description:
        "慎重博士が「念のため確認」と言い、永遠の研究者が「まだ調べ足りない」と言う。どちらも行動に移るのが遅いが、二人が動いた後は絶対に失敗しないという謎の安心感がある。",
    },

    // careful-scholar (prf+grd) × data-fortress (grd+prf)
    "careful-scholar--data-fortress": {
      label: "「論理で慎重」と「本能で慎重」",
      description:
        "慎重博士は「理論上は安全だが念のため確認」と言い、論理的守護者は「不安だからデータで証明する」と言う。出発点が違うのに、最終的にやることが全く同じ二人。",
    },

    // academic-artist (prf+art) × endless-researcher (prf+prf)
    "academic-artist--endless-researcher": {
      label: "感動と蓄積の同床異夢",
      description:
        "永遠の研究者が知識を積み上げるために調べ、データの詩人が「これ美しい」と感動するために調べる。同じ行動でも目的が違うから、話すと互いに新鮮な驚きがある。",
    },

    // academic-artist (prf+art) × data-fortress (grd+prf)
    "academic-artist--data-fortress": {
      label: "詩と数値の不思議な翻訳",
      description:
        "論理的守護者がデータで不安を証明すると、データの詩人が「その不安、詩の題材になる」と言い出す。守護者は戸惑いながらも、詩人の視点から不安が軽くなることに気づく。",
    },

    // endless-researcher (prf+prf) × data-fortress (grd+prf)
    "data-fortress--endless-researcher": {
      label: "積み上げとデータ化の同盟",
      description:
        "永遠の研究者が情報を積み上げ、論理的守護者がそれをデータベース化して安全策に変える。知識の蓄積が最強の守りになる、生産性の高い二人組。",
    },

    // ==========================================
    // dreamer共有ペア
    // ==========================================

    // blazing-poet (cmd+drm) × dreaming-scholar (prf+drm)
    "blazing-poet--dreaming-scholar": {
      label: "炎の夢と霧の夢",
      description:
        "詩人が「やるぞ!」と走り出し、学術夢想家が「実はその方向で論文が書けそうで...」と白昼夢に入る。同じ「夢見る」でも、方向と温度がまるで違う二人。",
    },

    // blazing-poet (cmd+drm) × star-chaser (drm+tri)
    "blazing-poet--star-chaser": {
      label: "夢と斜め視点のぶつかり合い",
      description:
        "詩人が熱量で「夢に向かうぞ!」と言い、夢追い人が「でもそれって普通じゃない?」と逆張りする。詩人は熱くなるが、斜めの視点のおかげで夢の輪郭が鮮明になる。",
    },

    // blazing-poet (cmd+drm) × tender-dreamer (drm+grd)
    "blazing-poet--tender-dreamer": {
      label: "熱い夢とやさしい夢",
      description:
        "詩人が「みんなで行くぞ!」と旗を振り、夢想家が「みんな大丈夫かな...」と後ろを気にする。前向きな夢と内向きな思いやりが同居する、温度差のある優しいコンビ。",
    },

    // blazing-poet (cmd+drm) × dreaming-canvas (drm+art)
    "blazing-poet--dreaming-canvas": {
      label: "行動する夢と映像化する夢",
      description:
        "詩人が「行くぞ!」と飛び出す横で、夢見る画家が目を閉じて「あ、あのシーンだ」と映像を見ている。どちらも夢の住人だが、夢との距離感が全く違う。",
    },

    // blazing-poet (cmd+drm) × eternal-dreamer (drm+drm)
    "blazing-poet--eternal-dreamer": {
      label: "「今すぐ」と「いつか」の差",
      description:
        "詩人が「やるぞ、今すぐ!」と叫び、永遠の夢想家が「いつかやろう...」と呟く。同じ夢を持っているのに、行動への踏み出し方がまるで違う二人。",
    },

    // dreaming-scholar (prf+drm) × star-chaser (drm+tri)
    "dreaming-scholar--star-chaser": {
      label: "夢を理論化する者と斜める者",
      description:
        "学術夢想家が「この夢に理論的根拠を加えると...」と膨らませ、夢追い人が「でもその夢、普通すぎない?」と鋭い突っ込みを入れる。夢がどんどん精密で尖っていく。",
    },

    // dreaming-scholar (prf+drm) × tender-dreamer (drm+grd)
    "dreaming-scholar--tender-dreamer": {
      label: "研究の夢と共感の夢",
      description:
        "学術夢想家が「この仮説を検証したい」と言い、優しい夢想家が「それ、みんなに役立つ研究だよ」と添える。知的な夢に感情的な意味が加わって、研究の動機が深まる。",
    },

    // dreaming-scholar (prf+drm) × dreaming-canvas (drm+art)
    "dreaming-canvas--dreaming-scholar": {
      label: "論文の夢と映像の夢",
      description:
        "学術夢想家が夢の中で論文を書き、夢見る画家が夢の中で映画を撮っている。どちらも夢の住人だが、夢の表現形式が全然違う。ただし二人とも、起きている時間は少ない。",
    },

    // dreaming-scholar (prf+drm) × eternal-dreamer (drm+drm)
    "dreaming-scholar--eternal-dreamer": {
      label: "「理論ある夢」と「純粋な夢」",
      description:
        "学術夢想家は夢に根拠を積み上げ、永遠の夢想家はただ夢だけを抱き続ける。どちらも「いつか実現する」と信じているが、永遠の夢想家の方が少し幸せそうに見える。",
    },

    // star-chaser (drm+tri) × tender-dreamer (drm+grd)
    "star-chaser--tender-dreamer": {
      label: "斜め視線とやさしい視線",
      description:
        "夢追い人が「その夢、普通じゃない?」と突っ込み、優しい夢想家が「でも大切な夢だよ」と優しく包む。冷静な逆張りと温かい肯定が同居する、奇妙なバランスのコンビ。",
    },

    // star-chaser (drm+tri) × dreaming-canvas (drm+art)
    "dreaming-canvas--star-chaser": {
      label: "鋭い夢と柔らかい夢",
      description:
        "夢追い人が「それって本当に夢なの?」と問い、夢見る画家が「夢の中でフルカラーで見えるから本物だよ」と答える。問いと映像が交差して、夢の輪郭が深まる。",
    },

    // star-chaser (drm+tri) × eternal-dreamer (drm+drm)
    "eternal-dreamer--star-chaser": {
      label: "鋭い夢想家と純粋な夢想家",
      description:
        "夢追い人が「それって現実的?」と問い詰め、永遠の夢想家が「現実的かどうかより、夢であることが大事」と答える。議論するほど、お互いの夢がより鮮明になっていく。",
    },

    // tender-dreamer (drm+grd) × dreaming-canvas (drm+art)
    "dreaming-canvas--tender-dreamer": {
      label: "心配する夢と映像の夢",
      description:
        "優しい夢想家が「みんなが笑える未来を想像する」と言い、夢見る画家が「私はその未来をフルカラーで見えてる」と返す。同じ夢を違う感覚器官で受け取っている二人。",
    },

    // tender-dreamer (drm+grd) × eternal-dreamer (drm+drm)
    "eternal-dreamer--tender-dreamer": {
      label: "利他の夢と純粋な夢",
      description:
        "優しい夢想家は「みんなが幸せになれるように」と夢を描き、永遠の夢想家はただただ夢を愛でる。向いている方向は違うが、どちらも夢を手放さない点は同じ。",
    },

    // dreaming-canvas (drm+art) × eternal-dreamer (drm+drm)
    "dreaming-canvas--eternal-dreamer": {
      label: "映像の夢と純粋な夢",
      description:
        "夢見る画家が「夢をフルカラーで見れる」と言い、永遠の夢想家が「脳内では47回旅した」と答える。二人の夢は誰の承認も必要としない完全な内側の世界で輝いている。",
    },

    // ==========================================
    // trickster共有ペア
    // ==========================================

    // blazing-schemer (cmd+tri) × contrarian-professor (prf+tri)
    "blazing-schemer--contrarian-professor": {
      label: "策略と知的反論の共鳴",
      description:
        "謀略家が「こっちの裏道が早い」と言い、へそ曲がり博士が「その裏道にも別の見方があって...」と追加する。策略に理屈が乗って、最終手段が異様に精緻になる。",
    },

    // blazing-schemer (cmd+tri) × star-chaser (drm+tri)
    "blazing-schemer--star-chaser": {
      label: "奇策と逆張りの同盟",
      description:
        "謀略家が「普通じゃない道を行こう」と言い、夢追い人が「でもそれって普通じゃない?」と突っ込む。逆張り同士なのになぜか逆張り合いになり、結果が最も尖った方向へ転がる。",
    },

    // blazing-schemer (cmd+tri) × clever-guardian (tri+grd)
    "blazing-schemer--clever-guardian": {
      label: "攻めの策と守りの策",
      description:
        "謀略家が「こちらから崩そう」と仕掛け、戦略的安全係が「その崩し方の弱点を先に塞いでおく」と準備する。攻守の策が噛み合って、完璧な手が生まれる。",
    },

    // blazing-schemer (cmd+tri) × creative-disruptor (tri+art)
    "blazing-schemer--creative-disruptor": {
      label: "奇策と美学の逆張り競争",
      description:
        "謀略家が「裏道で行こう」と言い、逆張り曲者が「それ王道になったら意味ないじゃん」と言い返す。どちらも「普通でない」が信条なのに、普通でない方向が少し違う。",
    },

    // blazing-schemer (cmd+tri) × ultimate-trickster (tri+tri)
    "blazing-schemer--ultimate-trickster": {
      label: "熱量の策と冷静の策",
      description:
        "謀略家が熱量で「こっちの裏道だ!」と走り、究極の策略家が「その裏をさらに読んでみると...」と静かに考える。同じ「策」でも温度がまるで違う二人。",
    },

    // blazing-schemer (cmd+tri) × vibe-rebel (art+tri)
    "blazing-schemer--vibe-rebel": {
      label: "計算の逆張りと本能の逆張り",
      description:
        "謀略家が「計算して裏道を選ぶ」と言い、野生の芸術家が「直感で進んだら逆張りになってた」と笑う。どちらも王道から外れているが、理由が全然違う。",
    },

    // contrarian-professor (prf+tri) × star-chaser (drm+tri)
    "contrarian-professor--star-chaser": {
      label: "知的反論と夢への突っ込み",
      description:
        "へそ曲がり博士が理屈で反論し、夢追い人が感性で「それって普通すぎない?」と突っ込む。二人とも「今の方向性への疑問」という武器を持つが、使い方が全く違う。",
    },

    // contrarian-professor (prf+tri) × clever-guardian (tri+grd)
    "clever-guardian--contrarian-professor": {
      label: "穴を見つける者たちの議論",
      description:
        "へそ曲がり博士が「この答えには別の解釈がある」と言い、戦略的安全係が「その穴はもう塞いだよ」と返す。見つける視点と塞ぐ視点が合わさって、鉄壁の論理が完成する。",
    },

    // contrarian-professor (prf+tri) × creative-disruptor (tri+art)
    "contrarian-professor--creative-disruptor": {
      label: "知的逆張りと美学的逆張り",
      description:
        "へそ曲がり博士が「正解があるとしたら別の解釈もある」と言い、逆張り曲者が「だったら王道じゃない方がいい」と感性で仕上げる。逆張りに理屈と美学が同時に乗っかる。",
    },

    // contrarian-professor (prf+tri) × ultimate-trickster (tri+tri)
    "contrarian-professor--ultimate-trickster": {
      label: "「でも別の視点は」の無限増殖",
      description:
        "へそ曲がり博士が「別の解釈もある」と言い、究極の策略家が「その解釈の裏をさらに読むと」と返す。二人の会話を聞いていると頭が痛くなるが、最終的に出る結論は完璧。",
    },

    // contrarian-professor (prf+tri) × vibe-rebel (art+tri)
    "contrarian-professor--vibe-rebel": {
      label: "理屈の逸脱と本能の逸脱",
      description:
        "へそ曲がり博士が論理で「この正解は不完全だ」と逸脱し、野生の芸術家が直感で「なんか違う」と逸脱する。到達点は似ているのに、過程が真逆な奇妙な同志。",
    },

    // star-chaser (drm+tri) × clever-guardian (tri+grd)
    "clever-guardian--star-chaser": {
      label: "夢への逆張りと穴の逆張り",
      description:
        "夢追い人が「この夢、普通じゃない?」と夢に突っ込み、戦略的安全係が「その夢の実現方法に弱点がある」と探す。夢が鋭く、かつ堅牢になる少し珍しい二人組。",
    },

    // star-chaser (drm+tri) × creative-disruptor (tri+art)
    "creative-disruptor--star-chaser": {
      label: "夢の逆張りと王道の逆張り",
      description:
        "夢追い人が「これって普通すぎない?」と夢を問い直し、逆張り曲者が「普通じゃない方向で仕上げよう」と美学で応える。二人で話すと、夢が確実に「王道でないもの」になる。",
    },

    // star-chaser (drm+tri) × ultimate-trickster (tri+tri)
    "star-chaser--ultimate-trickster": {
      label: "夢の疑問と策略の疑問",
      description:
        "夢追い人が「この夢って本当に正しい方向?」と問い、究極の策略家が「そもそも正しい方向って何?」と返す。問いが問いを呼ぶが、最終的に夢の骨格が強化される。",
    },

    // star-chaser (drm+tri) × vibe-rebel (art+tri)
    "star-chaser--vibe-rebel": {
      label: "夢の逆張りと感性の逸脱",
      description:
        "夢追い人が「普通じゃない夢を持つ」と言い、野生の芸術家が「直感でいつも異端になってる」と笑う。どちらも枠の外にいるが、辿り着き方がまるで違う。",
    },

    // clever-guardian (tri+grd) × creative-disruptor (tri+art)
    "clever-guardian--creative-disruptor": {
      label: "守りの策と崩しの策",
      description:
        "戦略的安全係が「この弱点を塞ごう」と言い、逆張り曲者が「そもそも王道を崩した方が弱点が消える」と言い返す。守ると崩すが同じ「策」から生まれている、鋭い二人。",
    },

    // clever-guardian (tri+grd) × ultimate-trickster (tri+tri)
    "clever-guardian--ultimate-trickster": {
      label: "守りの策と深読みの策",
      description:
        "戦略的安全係が「ここに穴がある」と言い、究極の策略家が「その穴を利用する人間の行動パターンを3手先まで読んだ」と返す。どちらも「裏を読む」が、目的が守りか攻めかで違う。",
    },

    // clever-guardian (tri+grd) × vibe-rebel (art+tri)
    "clever-guardian--vibe-rebel": {
      label: "計算の守りと本能の逸脱",
      description:
        "戦略的安全係が「この抜け穴を計算で見つけた」と言い、野生の芸術家が「直感で同じ穴に気づいてた」と答える。同じ結論に全く違うプロセスで辿り着く、驚きのペア。",
    },

    // creative-disruptor (tri+art) × ultimate-trickster (tri+tri)
    "creative-disruptor--ultimate-trickster": {
      label: "感性の逆張りと計算の逆張り",
      description:
        "逆張り曲者が「感性で仕上げた逆張り」を出すと、究極の策略家が「そのアプローチ、実は3手先まで計算した結果と一致してる」と言う。感性と策略が同じ答えを出す瞬間。",
    },

    // creative-disruptor (tri+art) × vibe-rebel (art+tri)
    "creative-disruptor--vibe-rebel": {
      label: "逆張りの計算と逆張りの本能",
      description:
        "逆張り曲者が「計算して逆張りを選ぶ」と言い、野生の芸術家が「本能で動いたら逆張りになってた」と笑う。どちらも似た結果なのに、プロセスが真逆。それぞれ相手が羨ましい。",
    },

    // ultimate-trickster (tri+tri) × vibe-rebel (art+tri)
    "ultimate-trickster--vibe-rebel": {
      label: "深読みと直感の逸脱者同士",
      description:
        "究極の策略家が「裏の裏を読んでこの選択をした」と言い、野生の芸術家が「直感でこっちに来たら同じ場所だった」と笑う。最も思考した者と最も直感な者が同じ場所にいる。",
    },

    // ==========================================
    // guardian共有ペア
    // ==========================================

    // blazing-warden (cmd+grd) × careful-scholar (prf+grd)
    "blazing-warden--careful-scholar": {
      label: "走りながら確認と止まって確認",
      description:
        "守護司令塔が「走りながら全員確認する」と言い、慎重博士が「走る前に17回確認しよう」と返す。どちらも守ることが目的だが、タイミングが正反対。なぜか相性がいい。",
    },

    // blazing-warden (cmd+grd) × tender-dreamer (drm+grd)
    "blazing-warden--tender-dreamer": {
      label: "熱い守りと静かな心配",
      description:
        "守護司令塔が「全員で前に進むぞ!」と叫び、優しい夢想家が「みんな疲れてないかな...」と後ろを気にする。元気よく守る者とそっと心配する者が同じ方向を向く。",
    },

    // blazing-warden (cmd+grd) × clever-guardian (tri+grd)
    "blazing-warden--clever-guardian": {
      label: "守りの熱量と守りの策略",
      description:
        "守護司令塔が熱量で「全員守るぞ!」と言い、戦略的安全係が「守るべき弱点を先に計算した」と返す。勢いと策略が組み合わさって、チームの守りが異常に固くなる。",
    },

    // blazing-warden (cmd+grd) × gentle-fortress (grd+art)
    "blazing-warden--gentle-fortress": {
      label: "熱血守護と静かな守護",
      description:
        "守護司令塔が「全員絶対に守る!」と宣言し、穏やかな要塞が「大丈夫?」と静かに聞く。同じ「守りたい」という気持ちが、全く異なる表現形式で現れているペア。",
    },

    // blazing-warden (cmd+grd) × ultimate-guardian (grd+grd)
    "blazing-warden--ultimate-guardian": {
      label: "走る守護と万全の守護",
      description:
        "守護司令塔が走りながら守り、備えの王が7本の傘を持って完璧な準備をする。動きながら守るスタイルと、止まって完璧な守りを作るスタイルの対比が鮮やかなペア。",
    },

    // blazing-warden (cmd+grd) × data-fortress (grd+prf)
    "blazing-warden--data-fortress": {
      label: "感情の守りとデータの守り",
      description:
        "守護司令塔が「大切な人を守る!」と熱量で動き、論理的守護者が「守るべき理由をデータで証明した」と言う。同じ「守る」という行動に、熱さとデータが同居する。",
    },

    // careful-scholar (prf+grd) × tender-dreamer (drm+grd)
    "careful-scholar--tender-dreamer": {
      label: "論理の心配と感情の心配",
      description:
        "慎重博士が「念のため確認した方が安心だ」と言い、優しい夢想家が「みんなが大丈夫かどうか心配...」と言う。どちらも心配性だが、心配の対象と方法が違う。",
    },

    // careful-scholar (prf+grd) × clever-guardian (tri+grd)
    "careful-scholar--clever-guardian": {
      label: "慎重の学者と策略の番人",
      description:
        "慎重博士が「念のため確認しておこう」と言い、戦略的安全係が「確認すべき弱点はここにある」と指摘する。念入りさと戦略性が組み合わさって、完璧な安全体制が生まれる。",
    },

    // careful-scholar (prf+grd) × gentle-fortress (grd+art)
    "careful-scholar--gentle-fortress": {
      label: "論理的安全と感性的安全",
      description:
        "慎重博士が「理論上は安全だが確認する」と言い、穏やかな要塞が「なんか違和感がある」と感性で言う。論理と直感、どちらも「安全でないかも」という信号。この二人が通ると絶対安全。",
    },

    // careful-scholar (prf+grd) × ultimate-guardian (grd+grd)
    "careful-scholar--ultimate-guardian": {
      label: "念入りと万全の共鳴",
      description:
        "慎重博士が「念のため17回確認」と言い、備えの王が「晴れでも傘を7本持つ」と答える。確認の深さと準備の広さが同じ「慎重」という価値観から来ている、静かな共鳴。",
    },

    // careful-scholar (prf+grd) × data-fortress (grd+prf)
    // (上記で「careful-scholar--data-fortress」として既出)

    // careful-scholar (prf+grd) × guardian-charger (grd+cmd)
    "careful-scholar--guardian-charger": {
      label: "止まって守ると前に出て守る",
      description:
        "慎重博士が「確認してから動く」という守り方をし、守護者が「必要なら前に出て盾になる」という守り方をする。守り方が静と動の対極にあるが、どちらも仲間を最優先にしている。",
    },

    // tender-dreamer (drm+grd) × clever-guardian (tri+grd)
    "clever-guardian--tender-dreamer": {
      label: "弱点を塞ぐ守護と心配で守る守護",
      description:
        "戦略的安全係が「弱点を計算で見つけて塞ぐ」と言い、優しい夢想家が「みんな大丈夫かな」とそっと心配する。どちらも守っているが、一人は頭で、一人は心で守っている。",
    },

    // tender-dreamer (drm+grd) × gentle-fortress (grd+art)
    "gentle-fortress--tender-dreamer": {
      label: "そっと守る者同士の沈黙",
      description:
        "優しい夢想家が「みんなが笑ってれば私は大丈夫」と言い、穏やかな要塞が「大丈夫?」と聞く。どちらも自分より相手を優先して疲れている。たまには互いに「大丈夫?」と聞き合う。",
    },

    // tender-dreamer (drm+grd) × ultimate-guardian (grd+grd)
    "tender-dreamer--ultimate-guardian": {
      label: "やさしい心配と万全の心配",
      description:
        "優しい夢想家が「みんなが幸せかどうか」で心配し、備えの王が「もしもの事態」を想定して準備する。心配の質が違うが、どちらも「大丈夫なはず、でも心配」という感覚は同じ。",
    },

    // tender-dreamer (drm+grd) × data-fortress (grd+prf)
    "data-fortress--tender-dreamer": {
      label: "データの心配と感情の心配",
      description:
        "論理的守護者が「心配の根拠をデータで証明した」と言い、優しい夢想家が「データじゃなくてみんなの顔を見てればわかる」と返す。心配の表現形式は違っても、根っこは同じ。",
    },

    // tender-dreamer (drm+grd) × guardian-charger (grd+cmd)
    "guardian-charger--tender-dreamer": {
      label: "行動で守ると想いで守る",
      description:
        "守護者が「必要なら盾になる」と行動で守り、優しい夢想家が「みんなのことをずっと想っている」と心で守る。守り方は違うが、両者とも自分を後回しにしている。",
    },

    // clever-guardian (tri+grd) × gentle-fortress (grd+art)
    "clever-guardian--gentle-fortress": {
      label: "策略の守りと感性の守り",
      description:
        "戦略的安全係が「弱点を見つけて塞ぐ」と言い、穏やかな要塞が「誰かが痛んでいる気がする」と感性で気づく。論理で守る者と感性で守る者が同じチームにいると、どんな脅威も見逃さない。",
    },

    // clever-guardian (tri+grd) × ultimate-guardian (grd+grd)
    "clever-guardian--ultimate-guardian": {
      label: "穴を塞ぐ守護と万全の守護",
      description:
        "戦略的安全係が「この弱点を塞いだ」と言うと、備えの王が「じゃあ次はこの弱点も」と返す。守りに対して限りなく細かい二人が組むと、攻撃が通る隙間が存在しなくなる。",
    },

    // clever-guardian (tri+grd) × data-fortress (grd+prf)
    "clever-guardian--data-fortress": {
      label: "弱点探しとデータの守り",
      description:
        "戦略的安全係が「悪意ある人間の思考を読んで弱点を塞ぐ」と言い、論理的守護者が「その弱点の根拠をデータで確認した」と返す。直感と数値が守りを二重に固める。",
    },

    // clever-guardian (tri+grd) × guardian-charger (grd+cmd)
    "clever-guardian--guardian-charger": {
      label: "守る策と守るための前進",
      description:
        "戦略的安全係が「後方から弱点を計算で守る」と言い、守護者が「必要なら前に出て盾になる」と言う。守り方が後方と前方に分かれているが、どちらも仲間の安全を最優先にしている。",
    },

    // gentle-fortress (grd+art) × ultimate-guardian (grd+grd)
    "gentle-fortress--ultimate-guardian": {
      label: "感性の要塞と万全の要塞",
      description:
        "穏やかな要塞が「なんか心配な気がする」と感性で警戒し、備えの王が「その場合のための備えが7種類ある」と答える。感覚と準備が組み合わさって、完璧な守りが生まれる。",
    },

    // gentle-fortress (grd+art) × data-fortress (grd+prf)
    "data-fortress--gentle-fortress": {
      label: "感覚の守りとデータの守り",
      description:
        "穏やかな要塞が「誰かが傷ついている気がする」と感性で察知し、論理的守護者が「その不安をデータで確認した」と返す。感覚と論理、どちらも「誰かを守りたい」から始まっている。",
    },

    // gentle-fortress (grd+art) × guardian-charger (grd+cmd)
    "gentle-fortress--guardian-charger": {
      label: "そっと守ると盾になる",
      description:
        "穏やかな要塞が「さりげなく痛みを和らげる」と言い、守護者が「必要な時は前に出て盾になる」と言う。どちらも表に出ずに守るスタイルだが、方法がじわじわと力強いの違いがある。",
    },

    // ultimate-guardian (grd+grd) × data-fortress (grd+prf)
    "data-fortress--ultimate-guardian": {
      label: "万全の備えとデータの備え",
      description:
        "備えの王が「もしもを3倍広く想定する」と言い、論理的守護者が「その想定をデータで裏付けた」と返す。直感的な備えと論理的な備えが同じチームにいると、準備が限りなく完璧になる。",
    },

    // ultimate-guardian (grd+grd) × guardian-charger (grd+cmd)
    "guardian-charger--ultimate-guardian": {
      label: "万全の番人と盾になる番人",
      description:
        "備えの王が「全ての可能性に備えた」と言い、守護者が「その上で必要なら前に出る」と言う。守りの最深部と最前線を二人が担い、仲間の安全が二重三重に守られる。",
    },

    // data-fortress (grd+prf) × guardian-charger (grd+cmd)
    "data-fortress--guardian-charger": {
      label: "論理の守護と身体を張る守護",
      description:
        "論理的守護者がデータで安全を証明し、守護者が「それでも足りなければ私が盾になる」と言う。情報と行動の両面から守りを固めるコンビ。仲間が最も安心できる組み合わせ。",
    },

    // ==========================================
    // artist共有ペア
    // ==========================================

    // blazing-canvas (cmd+art) × academic-artist (prf+art)
    "academic-artist--blazing-canvas": {
      label: "衝動の絵と論理の詩",
      description:
        "情熱の画家が「感じたら描く!」と飛び出し、データの詩人が「その感情、なぜそう感じたか分析すると...」と掘り下げる。衝動と理性が同じ「美しい」を目指して動いている。",
    },

    // blazing-canvas (cmd+art) × dreaming-canvas (drm+art)
    "blazing-canvas--dreaming-canvas": {
      label: "走る画家と夢見る画家",
      description:
        "情熱の画家が「行くぞ!」と叫びながら描き、夢見る画家が目を閉じて映像を見ながら描く。どちらもキャンバスに向かっているが、一人は走り、一人は夢の中にいる。",
    },

    // blazing-canvas (cmd+art) × creative-disruptor (tri+art)
    "blazing-canvas--creative-disruptor": {
      label: "衝動の逸脱と計算の逸脱",
      description:
        "情熱の画家が「やる!」と走り出した結果として王道を外れ、逆張り曲者が計算して王道を外す。どちらも「普通じゃない」を作るが、意図的かどうかが決定的に違う。",
    },

    // blazing-canvas (cmd+art) × gentle-fortress (grd+art)
    "blazing-canvas--gentle-fortress": {
      label: "爆走する感性と静かな感性",
      description:
        "情熱の画家が感性で全速力で走り、穏やかな要塞が感性で静かに誰かの痛みを察する。同じ「感性」が外に爆発するものと内に向かうものに分かれている、温度差の大きいペア。",
    },

    // blazing-canvas (cmd+art) × ultimate-artist (art+art)
    "blazing-canvas--ultimate-artist": {
      label: "炎の感性と純粋な感性",
      description:
        "情熱の画家が「やるぞ!」と感性に火をつけ、美の追求者が「うーん、まだ違う」と感性を磨き続ける。どちらも感性に従って動くが、一人は爆発させ、一人は精錬させる。",
    },

    // blazing-canvas (cmd+art) × vibe-rebel (art+tri)
    "blazing-canvas--vibe-rebel": {
      label: "炎の直感と野生の直感",
      description:
        "情熱の画家が「感じたから行く!」と走り出し、野生の芸術家が「直感で動いたらここにいた」と笑う。どちらも理由より感覚が先。二人でいると、常識という概念が溶けていく。",
    },

    // academic-artist (prf+art) × dreaming-canvas (drm+art)
    "academic-artist--dreaming-canvas": {
      label: "分析する感性と映像化する感性",
      description:
        "データの詩人が「この美しさを分析すると」と言い、夢見る画家が「この景色、夢に出てきた映画みたい」と答える。同じ「感性で受け取る」でも、処理の仕方が全然違う。",
    },

    // academic-artist (prf+art) × creative-disruptor (tri+art)
    "academic-artist--creative-disruptor": {
      label: "美しい理屈と美しい反骨",
      description:
        "データの詩人が「この逆張り、論理的に美しい」と言い、逆張り曲者が「計算して逆張りしたのに、詩みたいって言われるとなぜか嬉しい」と返す。美学の共鳴が生まれる瞬間。",
    },

    // academic-artist (prf+art) × gentle-fortress (grd+art)
    "academic-artist--gentle-fortress": {
      label: "分析する優しさと感じる優しさ",
      description:
        "データの詩人が「この感情を分析すると」と言い、穏やかな要塞が「そこまで分析しなくても、ただ側にいるだけでいい」と言う。優しさの表現が理屈と沈黙に分かれている二人。",
    },

    // academic-artist (prf+art) × ultimate-artist (art+art)
    "academic-artist--ultimate-artist": {
      label: "言語化する美と言語化できない美",
      description:
        "データの詩人が「この美しさ、論理で説明できる」と言い、美の追求者が「言葉にできないのが美しいんだよ」と返す。美に対するアプローチが真逆だが、どちらも美を深く愛している。",
    },

    // academic-artist (prf+art) × vibe-rebel (art+tri)
    "academic-artist--vibe-rebel": {
      label: "論理する感性と本能の感性",
      description:
        "データの詩人が「この感性を数値化すると」と言い、野生の芸術家が「数値化するとその感性が死ぬ気がする」と返す。感性への向き合い方が正反対な、刺激的な対話相手。",
    },

    // dreaming-canvas (drm+art) × creative-disruptor (tri+art)
    "creative-disruptor--dreaming-canvas": {
      label: "夢の映像と逆張りの美学",
      description:
        "夢見る画家が「夢で見た映像を描いている」と言い、逆張り曲者が「その夢の映像、どうせなら王道じゃない表現で出そう」と提案する。夢が尖った形で世に出るきっかけになるペア。",
    },

    // dreaming-canvas (drm+art) × gentle-fortress (grd+art)
    "dreaming-canvas--gentle-fortress": {
      label: "夢の感性と守りの感性",
      description:
        "夢見る画家が「目を閉じると世界が見える」と言い、穏やかな要塞が「その世界、誰も傷つけないようにそっと守る」と言う。感性が夢の方向と守りの方向に枝分かれしている。",
    },

    // dreaming-canvas (drm+art) × ultimate-artist (art+art)
    "dreaming-canvas--ultimate-artist": {
      label: "夢の色彩と感性の追求",
      description:
        "夢見る画家が「夢で見たフルカラーの景色を残したい」と言い、美の追求者が「うーん、その色、まだ違う」と感性で問い直す。どちらも感性の忠実な僕で、現実との距離が似ている。",
    },

    // dreaming-canvas (drm+art) × vibe-rebel (art+tri)
    "dreaming-canvas--vibe-rebel": {
      label: "内なる映像と外向きの本能",
      description:
        "夢見る画家が「内側に映像が流れている」と言い、野生の芸術家が「直感で外に向かって走っている」と言う。どちらも感性に従っているが、方向が内と外で対照的。",
    },

    // creative-disruptor (tri+art) × gentle-fortress (grd+art)
    "creative-disruptor--gentle-fortress": {
      label: "挑発する感性と癒やす感性",
      description:
        "逆張り曲者が「刺さる美学で世界を揺さぶる」と言い、穏やかな要塞が「揺さぶられた人を静かに包む」と言う。どちらも感性から動いているが、効果が正反対。二人で世界を揺らして癒やす。",
    },

    // creative-disruptor (tri+art) × ultimate-artist (art+art)
    "creative-disruptor--ultimate-artist": {
      label: "戦略的な美と純粋な美",
      description:
        "逆張り曲者が「計算して逆張りし感性で仕上げた」と言い、美の追求者が「うーん、計算が見えてしまう」と返す。どちらも美を作るが、一人は手段として、一人は目的として美を追う。",
    },

    // creative-disruptor (tri+art) × vibe-rebel (art+tri)
    // (上記で「creative-disruptor--vibe-rebel」として既出)

    // gentle-fortress (grd+art) × ultimate-artist (art+art)
    "gentle-fortress--ultimate-artist": {
      label: "守る感性と磨く感性",
      description:
        "穏やかな要塞が「感性で誰かの痛みを感じ取り、静かに守る」と言い、美の追求者が「感性で世界の美しさを感じ取り、磨き続ける」と言う。同じ感性のアンテナが、守護と芸術に分かれている。",
    },

    // gentle-fortress (grd+art) × vibe-rebel (art+tri)
    "gentle-fortress--vibe-rebel": {
      label: "静かな感性と爆走する感性",
      description:
        "穏やかな要塞が感性でそっと誰かを包み、野生の芸術家が感性で全力で走り出す。どちらも感性に従っているが、速度と方向がまるで違う。不思議と惹かれ合うペア。",
    },

    // ultimate-artist (art+art) × vibe-rebel (art+tri)
    "ultimate-artist--vibe-rebel": {
      label: "感性の純粋追求と感性の逸脱",
      description:
        "美の追求者が「うーん、まだ違う」と感性を磨き続け、野生の芸術家が「直感で動いたら異端だった」と笑う。どちらも感性に支配されているが、一人は内省し、一人は外に飛び出す。",
    },
  };
