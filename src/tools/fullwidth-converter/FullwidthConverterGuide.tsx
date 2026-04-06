import styles from "./FullwidthConverterGuide.module.css";

/**
 * 全角半角変換の解説コンポーネント
 * SEOと来訪者の理解促進のために、変換の仕組みや用途を説明する
 */
export default function FullwidthConverterGuide() {
  return (
    <div className={styles.guide}>
      <section className={styles.section}>
        <h2 className={styles.heading}>全角と半角の違いとは</h2>
        <p className={styles.body}>
          全角と半角は、文字が占める横幅の違いを表します。全角文字は漢字と同じ幅（通常の2倍）を占め、半角文字はその半分の幅です。もともとは日本語を扱うためのコンピュータが、英数字や記号を全幅の漢字と同じマスに収めるために生まれた概念です。
        </p>
        <p className={styles.body}>
          Unicodeでは、半角英数字・記号は
          U+0021〜U+007E（ASCII範囲）に、対応する全角文字は
          U+FF01〜U+FF5E（全角ASCII範囲）にそれぞれ割り当てられています。全角スペース（U+3000）と半角スペース（U+0020）も別のコードポイントを持つ、異なる文字です。カタカナも同様に、全角（U+30A0〜U+30FF）と半角（U+FF65〜U+FF9F）の両方が存在します。
        </p>
        <p className={styles.body}>
          見た目が似ていても文字コード上は別の文字であるため、コンピュータで文字列比較や検索を行う場合、表記が揃っていないと意図しない不一致が生じることがあります。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>全角半角変換が必要になる場面</h2>
        <ul className={styles.list}>
          <li>
            <strong>データ入力の統一（Excel・CSV処理）</strong>
            ：複数の担当者が入力したデータでは、同じ数字や英字でも全角・半角が混在しがちです。集計や比較の前に統一しておくと、意図しない不一致を防げます。
          </li>
          <li>
            <strong>フォーム入力の正規化</strong>
            ：Webフォームでの電話番号や郵便番号など、半角数字を期待するフィールドに全角で入力されることがあります。送信前や受信後に正規化することで、バリデーションエラーを減らせます。
          </li>
          <li>
            <strong>プログラミングでの文字列比較</strong>
            ：「Ａ」と「A」は見た目が似ていますが、コードポイントが異なるため、単純な文字列比較では一致しません。比較前に表記を統一しておくことで、検索漏れや誤判定を防げます。
          </li>
          <li>
            <strong>テキストの見た目を揃える</strong>
            ：文書・チャット・資料作成などで、全角と半角が混在していると読みにくくなることがあります。スタイルを統一するために変換を行います。
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>変換対象の文字一覧</h2>
        <p className={styles.body}>
          このツールが変換する文字の一覧です。カテゴリごとにオン・オフの切り替えが可能です。
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>カテゴリ</th>
                <th className={styles.th}>半角</th>
                <th className={styles.th}>全角</th>
                <th className={styles.th}>備考</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.td}>英数字</td>
                <td className={styles.tdMono}>0–9, A–Z, a–z</td>
                <td className={styles.tdMono}>０–９, Ａ–Ｚ, ａ–ｚ</td>
                <td className={styles.td}>
                  ASCII U+0030〜U+0039, U+0041〜U+005A, U+0061〜U+007A
                </td>
              </tr>
              <tr>
                <td className={styles.td}>記号・スペース</td>
                <td className={styles.tdMono}>
                  ! &quot; # $ % &amp; … （半角記号）, スペース
                </td>
                <td className={styles.tdMono}>
                  ！ ＂ ＃ ＄ ％ ＆ … （全角記号）, 　（全角スペース）
                </td>
                <td className={styles.td}>
                  ASCII 記号 U+0021〜U+007E 範囲の非英数字、スペース U+0020 ↔
                  U+3000
                </td>
              </tr>
              <tr>
                <td className={styles.td}>カタカナ</td>
                <td className={styles.tdMono}>ｦ ｧ ｨ … ﾝ（半角カナ）</td>
                <td className={styles.tdMono}>ヲ ァ ィ … ン（全角カナ）</td>
                <td className={styles.td}>
                  U+FF65〜U+FF9F ↔ U+30A0〜U+30FF。濁点・半濁点の結合にも対応
                </td>
              </tr>
              <tr>
                <td className={styles.td}>濁点付きカナ</td>
                <td className={styles.tdMono}>ｶﾞ ｷﾞ … ﾎﾞ（2文字）</td>
                <td className={styles.tdMono}>ガ ギ … ボ（1文字）</td>
                <td className={styles.td}>
                  半角では濁点（ﾞ
                  U+FF9E）が独立した文字のため、隣接する文字と結合して変換
                </td>
              </tr>
              <tr>
                <td className={styles.td}>半濁点付きカナ</td>
                <td className={styles.tdMono}>ﾊﾟ ﾋﾟ … ﾎﾟ（2文字）</td>
                <td className={styles.tdMono}>パ ピ … ポ（1文字）</td>
                <td className={styles.td}>
                  半角では半濁点（ﾟ
                  U+FF9F）が独立した文字のため、隣接する文字と結合して変換
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          ※
          ひらがな・漢字はこのツールの変換対象外です。これらの文字は変換されずにそのまま出力されます。
        </p>
      </section>
    </div>
  );
}
