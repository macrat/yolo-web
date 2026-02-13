import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import AiDisclaimer from "../AiDisclaimer";

test("AiDisclaimer renders the disclaimer text", () => {
  render(<AiDisclaimer />);
  expect(
    screen.getByText(/AIによる実験的プロジェクトの一部です/),
  ).toBeInTheDocument();
});

test("AiDisclaimer has note role", () => {
  render(<AiDisclaimer />);
  expect(screen.getByRole("note")).toBeInTheDocument();
});
