import { expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CodeBlock from "../CodeBlock";

test("CodeBlock renders code content", () => {
  render(<CodeBlock code="console.log('hello')" />);
  expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
});

test("CodeBlock renders language label when provided", () => {
  render(<CodeBlock code="const x = 1;" language="javascript" />);
  expect(screen.getByText("javascript")).toBeInTheDocument();
});

test("CodeBlock copy button works", async () => {
  const writeTextMock = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, {
    clipboard: { writeText: writeTextMock },
  });

  render(<CodeBlock code="test code" />);
  const button = screen.getByRole("button", { name: "コードをコピー" });
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(writeTextMock).toHaveBeenCalledWith("test code");
});
