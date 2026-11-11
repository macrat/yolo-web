import { Fragment } from "react";
import styles from "./GroupWords.module.css";

interface Props {
  /** 組の4つの語。 */
  words: string[];
}

/**
 * 組の語の並び（「あさり、はまぐり、しじみ、ほたて」）。行は語の切れ目（読点のあと）で折り、語の途中では
 * 折らない。1語が行に入らないときだけ、その語の中で折る。
 */
export default function GroupWords({ words }: Props) {
  return (
    <p className={styles.words}>
      {words.map((word, index) => (
        <Fragment key={word}>
          {index > 0 && (
            <>
              、<wbr />
            </>
          )}
          {word}
        </Fragment>
      ))}
    </p>
  );
}
