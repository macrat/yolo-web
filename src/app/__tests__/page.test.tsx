import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

test("Home page renders heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Yolo-Web" }),
  ).toBeInTheDocument();
});

test("Home page renders AI disclaimer", () => {
  render(<Home />);
  expect(screen.getByText(/AIエージェントによる実験的/)).toBeInTheDocument();
});
