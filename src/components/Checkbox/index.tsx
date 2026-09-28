import ChoiceRow, { type ChoiceRowProps } from "@/components/ChoiceRow";
import { renderPhrasedName } from "@/components/PhrasedText";

type CheckboxProps = Omit<ChoiceRowProps, "type" | "label"> & {
  /** 四角の右に本文の大きさで組むラベル。区切りの並び（文字列の配列）を渡すと文節で折る（PhrasedText）。 */
  label: ChoiceRowProps["label"] | readonly string[];
};

/**
 * チェックボックス（DESIGN.md §6）。太い線で描く 20px の四角で、選択済みは内側を塗る。
 * `label` を除く属性は、そのまま `<input type="checkbox">` に渡る。
 *
 * @example
 * <Checkbox label="記号を含める" checked={on} onChange={(e) => setOn(e.target.checked)} />
 * <Checkbox label={["連続する", "改行を", "1つに", "まとめる"]} checked={on} onChange={onChange} />
 */
export default function Checkbox({ label, ...rest }: CheckboxProps) {
  return (
    <ChoiceRow type="checkbox" label={renderPhrasedName(label)} {...rest} />
  );
}
