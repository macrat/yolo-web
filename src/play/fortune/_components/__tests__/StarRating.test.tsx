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
    [5, "★★★★★", "5.0"],
    [4.8, "★★★★★", "4.8"],
    [4.4, "★★★★☆", "4.4"],
    [4, "★★★★☆", "4.0"],
    [2.9, "★★★☆☆", "2.9"],
    [2.5, "★★★☆☆", "2.5"],
    [2.3, "★★☆☆☆", "2.3"],
    [1, "★☆☆☆☆", "1.0"],
  ])(
    "shows %s as the nearest number of ★ out of five, with the value to one decimal place",
    (rating, stars, value) => {
      render(<StarRating rating={rating} />);
      const image = screen.getByRole("img", { name: `5つ星のうち${value}` });
      expect(image.textContent).toBe(`${stars}(${value})`);
    },
  );
});
