import ChoiceRow, { type ChoiceRowProps } from "@/components/ChoiceRow";

type RadioProps = Omit<ChoiceRowProps, "type">;

/**
 * ラジオボタン（DESIGN.md §6）。太い線で描く 20px の円で、選択済みは内側を塗る。
 * 同じ `name` を持つものが1組になる。組には `<fieldset>` と `<legend>` で名前を付ける。
 * `label` を除く属性は、そのまま `<input type="radio">` に渡る。
 *
 * @example
 * <fieldset>
 *   <legend>並び順</legend>
 *   <Radio name="order" value="new" label="新しい順" checked={order === "new"} onChange={...} />
 *   <Radio name="order" value="old" label="古い順" checked={order === "old"} onChange={...} />
 * </fieldset>
 */
export default function Radio(props: RadioProps) {
  return <ChoiceRow type="radio" {...props} />;
}
