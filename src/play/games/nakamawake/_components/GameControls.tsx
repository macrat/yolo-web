import type { Ref } from "react";
import Button from "@/components/Button";
import styles from "./GameControls.module.css";

interface Props {
  onCheck: () => void;
  onShuffle: () => void;
  onDeselectAll: () => void;
  canCheck: boolean;
  /** チェックのボタン。4つ目の語を選んだとき、このボタンを画面に入れるのに使う。 */
  checkRef?: Ref<HTMLButtonElement>;
}

/**
 * 語の格子の下に並べる操作。並べ替えと選び直しはプライマリでないボタン、選んだ4語の答え合わせは
 * プライマリボタン（DESIGN.md §6）。
 */
export default function GameControls({
  onCheck,
  onShuffle,
  onDeselectAll,
  canCheck,
  checkRef,
}: Props) {
  return (
    <div className={styles.controls}>
      <Button onClick={onShuffle}>シャッフル</Button>
      <Button onClick={onDeselectAll}>選択解除</Button>
      <Button
        ref={checkRef}
        variant="primary"
        onClick={onCheck}
        disabled={!canCheck}
        disabledReason="言葉を4つ選ぶとチェックできます"
      >
        チェック
      </Button>
    </div>
  );
}
