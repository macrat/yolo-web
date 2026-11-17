import ChoiceRow, { type ChoiceRowProps } from "@/components/ChoiceRow";

type CheckboxProps = Omit<ChoiceRowProps, "type">;

/**
 * チェックボックス（DESIGN.md §6）。太い線で描く 20px の四角で、選択済みは内側を塗る。
 * `label` を除く属性は、そのまま `<input type="checkbox">` に渡る。ラベルは文字列か区切りの並びなら文節で折る。
 *
 * @example
 * <Checkbox label="記号を含める" checked={on} onChange={(e) => setOn(e.target.checked)} />
 * <Checkbox label={["連続する", "改行を", "1つに", "まとめる"]} checked={on} onChange={onChange} />
 */
export default function Checkbox(props: CheckboxProps) {
  return <ChoiceRow type="checkbox" {...props} />;
}
