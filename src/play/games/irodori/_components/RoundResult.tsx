import Link from "next/link";
import type { IrodoriRound } from "@/play/games/irodori/_lib/types";
import styles from "./RoundResult.module.css";

interface Props {
  round: IrodoriRound;
  /** 次の問へ進むボタンが、この問の点数を説明として読ませるための id */
  id: string;
}

/**
 * 決めた色への判定。その問の点数と、お題との色差と、お題が伝統色ならその名前を言う。お題と決めた色の見本は、
 * 上の見本の並びがそのまま見せている。
 */
export default function RoundResult({ round, id }: Props) {
  return (
    <div id={id} className={styles.roundResult}>
      <p className={styles.score}>{round.score ?? 0}点</p>
      {round.deltaE !== null && <p>お題との色差 {round.deltaE.toFixed(1)}</p>}
      {round.target.name && (
        <p>
          お題は伝統色の「
          {round.target.slug ? (
            <Link
              href={`/dictionary/colors/${round.target.slug}`}
              className={styles.colorName}
            >
              {round.target.name}
            </Link>
          ) : (
            <span className={styles.colorName}>{round.target.name}</span>
          )}
          」でした
        </p>
      )}
    </div>
  );
}
