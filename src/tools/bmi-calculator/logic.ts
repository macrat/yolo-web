export interface BmiResult {
  bmi: number; // rounded to 1 decimal
  category: string; // Japanese category name
  categoryLevel: number; // 0-5 for styling
  idealWeight: number; // BMI 22 ideal weight
  bmi18_5Weight: number; // weight at BMI 18.5
  bmi25Weight: number; // weight at BMI 25
}

// Japan Obesity Society categories:
// < 18.5: 低体重（やせ） level 0
// 18.5-25: 普通体重 level 1
// 25-30: 肥満（1度） level 2
// 30-35: 肥満（2度） level 3
// 35-40: 肥満（3度） level 4
// >= 40: 肥満（4度） level 5

function getCategory(bmi: number): { category: string; categoryLevel: number } {
  if (bmi < 18.5) {
    return { category: "低体重（やせ）", categoryLevel: 0 };
  }
  if (bmi < 25) {
    return { category: "普通体重", categoryLevel: 1 };
  }
  if (bmi < 30) {
    return { category: "肥満（1度）", categoryLevel: 2 };
  }
  if (bmi < 35) {
    return { category: "肥満（2度）", categoryLevel: 3 };
  }
  if (bmi < 40) {
    return { category: "肥満（3度）", categoryLevel: 4 };
  }
  return { category: "肥満（4度）", categoryLevel: 5 };
}

export function calculateBmi(
  heightCm: number,
  weightKg: number,
): BmiResult | null {
  if (heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const heightMSquared = heightM * heightM;
  const bmi = Math.round((weightKg / heightMSquared) * 10) / 10;

  const { category, categoryLevel } = getCategory(bmi);

  const idealWeight = Math.round(22 * heightMSquared * 10) / 10;
  const bmi18_5Weight = Math.round(18.5 * heightMSquared * 10) / 10;
  const bmi25Weight = Math.round(25 * heightMSquared * 10) / 10;

  return {
    bmi,
    category,
    categoryLevel,
    idealWeight,
    bmi18_5Weight,
    bmi25Weight,
  };
}

export function getTargetWeight(heightCm: number, targetBmi: number): number {
  const heightM = heightCm / 100;
  return Math.round(targetBmi * heightM * heightM * 10) / 10;
}
