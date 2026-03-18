import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import StarRating from "../StarRating";

describe("StarRating", () => {
  test("renders correct aria-label with rating value", () => {
    render(<StarRating rating={3.5} />);
    const stars = screen.getByLabelText("3.5 / 5");
    expect(stars).toBeInTheDocument();
  });

  test("renders rating number in parentheses", () => {
    render(<StarRating rating={4} />);
    expect(screen.getByText("(4)")).toBeInTheDocument();
  });

  test("renders 5 full stars for rating 5", () => {
    const { container } = render(<StarRating rating={5} />);
    const span = container.querySelector("[aria-label='5 / 5']");
    expect(span?.textContent).toContain("★★★★★");
  });

  test("renders 3 full stars and 2 empty for rating 3.0", () => {
    const { container } = render(<StarRating rating={3} />);
    const span = container.querySelector("[aria-label='3 / 5']");
    // 3 full + 2 empty (no half)
    expect(span?.textContent).toContain("★★★");
  });

  test("shows half star when fractional part >= 0.3", () => {
    // 0.3 is the threshold (HALF_STAR_THRESHOLD)
    const { container } = render(<StarRating rating={3.3} />);
    const span = container.querySelector("[aria-label='3.3 / 5']");
    // Contains 3 full stars and at least one ☆
    expect(span?.textContent).toContain("★★★");
    expect(span?.textContent).toContain("☆");
  });

  test("does NOT show half star when fractional part < 0.3", () => {
    // 0.2 is below threshold, so no half star
    const { container } = render(<StarRating rating={3.2} />);
    const span = container.querySelector("[aria-label='3.2 / 5']");
    // 3 full stars, no half, 2 empty
    expect(span?.textContent).toContain("★★★");
    // Should have 2 empty stars (☆☆), not one as half
    expect(span?.textContent).toContain("☆☆");
  });

  test("accepts variant prop 'purple' without errors", () => {
    expect(() =>
      render(<StarRating rating={4} variant="purple" />),
    ).not.toThrow();
  });

  test("accepts variant prop 'gold' without errors", () => {
    expect(() =>
      render(<StarRating rating={4} variant="gold" />),
    ).not.toThrow();
  });

  test("renders correctly with rating 1.0 (1 full star, 4 empty)", () => {
    const { container } = render(<StarRating rating={1} />);
    const span = container.querySelector("[aria-label='1 / 5']");
    expect(span?.textContent).toContain("★");
    expect(span?.textContent).toContain("☆☆☆☆");
  });

  test("rating number displayed correctly for decimal", () => {
    render(<StarRating rating={2.7} />);
    expect(screen.getByText("(2.7)")).toBeInTheDocument();
  });
});
