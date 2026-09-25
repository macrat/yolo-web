import ChoiceRow, { type ChoiceRowProps } from "@/components/ChoiceRow";

type CheckboxProps = Omit<ChoiceRowProps, "type">;

/**
 * チェックボックス（DESIGN.md §6）。太い線で描く 20px の四角で、選択済みは内側を塗る。
 * `label` を除く属性は、そのまま `<input type="checkbox">` に渡る。
 *
 * @example
 * <Checkbox label="記号を含める" checked={on} onChange={(e) => setOn(e.target.checked)} />
 */
export default function Checkbox(props: CheckboxProps) {
  return <ChoiceRow type="checkbox" {...props} />;
}
