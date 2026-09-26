import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import StarRating from "../StarRating";

describe("StarRating", () => {
  test("reads the rating as one name instead of each star", () => {
    render(<StarRating rating={3.5} />);
    expect(
      screen.getByRole("img", { name: "5つ星のうち3.5" }),
    ).toBeInTheDocument();
  });

  test.each([
    [5, "★★★★★"],
    [4.4, "★★★★☆"],
    [3.5, "★★★☆☆"],
    [2.3, "★★☆☆☆"],
    [1, "★☆☆☆☆"],
  ])(
    "shows the integer part of %s as ★ and the rest of five as ☆",
    (rating, stars) => {
      render(<StarRating rating={rating} />);
      const image = screen.getByRole("img");
      expect(image.textContent).toBe(`${stars}(${rating})`);
    },
  );

  test("shows the rating as a number, since a half star looks the same as ☆", () => {
    render(<StarRating rating={2.7} />);
    expect(screen.getByText("(2.7)")).toBeInTheDocument();
  });
});
