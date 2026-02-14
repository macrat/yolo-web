import { describe, it, expect } from "vitest";
import { calculateBmi, getTargetWeight } from "../logic";

describe("calculateBmi", () => {
  it("returns null for zero height", () => {
    expect(calculateBmi(0, 70)).toBeNull();
  });

  it("returns null for negative height", () => {
    expect(calculateBmi(-170, 70)).toBeNull();
  });

  it("returns null for zero weight", () => {
    expect(calculateBmi(170, 0)).toBeNull();
  });

  it("returns null for negative weight", () => {
    expect(calculateBmi(170, -60)).toBeNull();
  });

  it("calculates normal BMI correctly", () => {
    // 170cm, 65kg -> BMI = 65 / (1.7^2) = 65 / 2.89 = 22.49...
    const result = calculateBmi(170, 65);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(22.5);
    expect(result!.category).toBe("普通体重");
    expect(result!.categoryLevel).toBe(1);
  });

  it("calculates underweight correctly", () => {
    // 170cm, 50kg -> BMI = 50 / 2.89 = 17.3
    const result = calculateBmi(170, 50);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(17.3);
    expect(result!.category).toBe("低体重（やせ）");
    expect(result!.categoryLevel).toBe(0);
  });

  it("calculates obesity level 1 correctly", () => {
    // 170cm, 80kg -> BMI = 80 / 2.89 = 27.7
    const result = calculateBmi(170, 80);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(27.7);
    expect(result!.category).toBe("肥満（1度）");
    expect(result!.categoryLevel).toBe(2);
  });

  it("calculates obesity level 2 correctly", () => {
    // 170cm, 95kg -> BMI = 95 / 2.89 = 32.9
    const result = calculateBmi(170, 95);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(32.9);
    expect(result!.category).toBe("肥満（2度）");
    expect(result!.categoryLevel).toBe(3);
  });

  it("calculates obesity level 3 correctly", () => {
    // 170cm, 110kg -> BMI = 110 / 2.89 = 38.1
    const result = calculateBmi(170, 110);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(38.1);
    expect(result!.category).toBe("肥満（3度）");
    expect(result!.categoryLevel).toBe(4);
  });

  it("calculates obesity level 4 correctly", () => {
    // 170cm, 120kg -> BMI = 120 / 2.89 = 41.5
    const result = calculateBmi(170, 120);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(41.5);
    expect(result!.category).toBe("肥満（4度）");
    expect(result!.categoryLevel).toBe(5);
  });

  it("handles boundary at BMI 18.5", () => {
    // height=100cm, weight=18.5kg -> BMI = 18.5 / (1.0^2) = 18.5
    const result = calculateBmi(100, 18.5);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(18.5);
    expect(result!.category).toBe("普通体重");
    expect(result!.categoryLevel).toBe(1);
  });

  it("handles boundary just below BMI 18.5", () => {
    // height=100cm, weight=18.4kg -> BMI = 18.4
    const result = calculateBmi(100, 18.4);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(18.4);
    expect(result!.category).toBe("低体重（やせ）");
    expect(result!.categoryLevel).toBe(0);
  });

  it("handles boundary at BMI 25", () => {
    // height=100cm, weight=25kg -> BMI = 25.0
    const result = calculateBmi(100, 25);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(25);
    expect(result!.category).toBe("肥満（1度）");
    expect(result!.categoryLevel).toBe(2);
  });

  it("handles boundary at BMI 30", () => {
    const result = calculateBmi(100, 30);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(30);
    expect(result!.category).toBe("肥満（2度）");
    expect(result!.categoryLevel).toBe(3);
  });

  it("handles boundary at BMI 35", () => {
    const result = calculateBmi(100, 35);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(35);
    expect(result!.category).toBe("肥満（3度）");
    expect(result!.categoryLevel).toBe(4);
  });

  it("handles boundary at BMI 40", () => {
    const result = calculateBmi(100, 40);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(40);
    expect(result!.category).toBe("肥満（4度）");
    expect(result!.categoryLevel).toBe(5);
  });

  it("calculates ideal weight correctly", () => {
    // 170cm -> ideal = 22 * 1.7^2 = 22 * 2.89 = 63.58 -> 63.6
    const result = calculateBmi(170, 65);
    expect(result).not.toBeNull();
    expect(result!.idealWeight).toBe(63.6);
  });

  it("calculates BMI 18.5 weight correctly", () => {
    // 170cm -> 18.5 * 2.89 = 53.465 -> 53.5
    const result = calculateBmi(170, 65);
    expect(result).not.toBeNull();
    expect(result!.bmi18_5Weight).toBe(53.5);
  });

  it("calculates BMI 25 weight correctly", () => {
    // 170cm -> 25 * (1.7)^2 = 72.25 -> 72.2 (floating point: 1.7*1.7=2.8899..., *25=72.249...)
    const result = calculateBmi(170, 65);
    expect(result).not.toBeNull();
    expect(result!.bmi25Weight).toBe(72.2);
  });

  it("handles very small height", () => {
    const result = calculateBmi(1, 1);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(10000);
  });

  it("handles very large values", () => {
    const result = calculateBmi(300, 500);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBe(55.6);
  });
});

describe("getTargetWeight", () => {
  it("calculates weight for BMI 22 at 170cm", () => {
    // 22 * 1.7^2 = 22 * 2.89 = 63.58 -> 63.6
    const w = getTargetWeight(170, 22);
    expect(w).toBe(63.6);
  });

  it("calculates weight for BMI 18.5 at 170cm", () => {
    // 18.5 * 2.89 = 53.465 -> 53.5
    const w = getTargetWeight(170, 18.5);
    expect(w).toBe(53.5);
  });

  it("calculates weight for BMI 25 at 170cm", () => {
    // 25 * 1.7 * 1.7 = 72.25 -> 72.3 (left-to-right: 25*1.7=42.5, 42.5*1.7=72.25, rounds to 72.3)
    const w = getTargetWeight(170, 25);
    expect(w).toBe(72.3);
  });

  it("calculates weight for short height", () => {
    // 150cm -> 22 * 1.5^2 = 22 * 2.25 = 49.5
    const w = getTargetWeight(150, 22);
    expect(w).toBe(49.5);
  });

  it("calculates weight for tall height", () => {
    // 190cm -> 22 * 1.9^2 = 22 * 3.61 = 79.42 -> 79.4
    const w = getTargetWeight(190, 22);
    expect(w).toBe(79.4);
  });

  it("calculates weight for BMI 30 at 160cm", () => {
    // 30 * 1.6^2 = 30 * 2.56 = 76.8
    const w = getTargetWeight(160, 30);
    expect(w).toBe(76.8);
  });
});
