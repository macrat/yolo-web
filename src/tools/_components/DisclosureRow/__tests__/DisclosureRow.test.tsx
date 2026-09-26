import { describe, expect, it } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import DisclosureRow from "@/tools/_components/DisclosureRow";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <DisclosureRow
      name="一期一会"
      description="いちごいちえ"
      open={open}
      onToggle={() => setOpen((value) => !value)}
    >
      <p>詳細</p>
    </DisclosureRow>
  );
}

describe("DisclosureRow", () => {
  it("読み上げの名前は語だけで、続く字は説明になる", () => {
    render(<Harness />);
    const button = screen.getByRole("button", { name: "一期一会" });
    expect(button).toHaveAccessibleDescription("いちごいちえ");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("aria-controls");
  });

  it("押すと中身が開き、開いた中身を aria-controls で指す", () => {
    render(<Harness />);
    const button = screen.getByRole("button", { name: "一期一会" });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByText("詳細").parentElement;
    expect(button).toHaveAttribute("aria-controls", panel?.id);
    fireEvent.click(button);
    expect(screen.queryByText("詳細")).toBeNull();
  });
});
