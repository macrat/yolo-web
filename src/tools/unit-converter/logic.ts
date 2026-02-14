export type UnitCategory = "length" | "weight" | "temperature" | "area" | "speed";

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

export interface UnitCategoryDefinition {
  id: UnitCategory;
  name: string;
  baseUnit: string;
  units: UnitDefinition[];
}

function linearUnit(
  id: string,
  name: string,
  symbol: string,
  factor: number,
): UnitDefinition {
  return {
    id,
    name,
    symbol,
    toBase: (v) => v * factor,
    fromBase: (v) => v / factor,
  };
}

const LENGTH_UNITS: UnitDefinition[] = [
  linearUnit("millimeter", "ミリメートル", "mm", 0.001),
  linearUnit("centimeter", "センチメートル", "cm", 0.01),
  linearUnit("meter", "メートル", "m", 1),
  linearUnit("kilometer", "キロメートル", "km", 1000),
  linearUnit("inch", "インチ", "in", 0.0254),
  linearUnit("foot", "フィート", "ft", 0.3048),
  linearUnit("yard", "ヤード", "yd", 0.9144),
  linearUnit("mile", "マイル", "mi", 1609.344),
  linearUnit("shaku", "尺", "尺", 10 / 33),
  linearUnit("sun", "寸", "寸", 10 / 330),
  linearUnit("ken", "間", "間", 20 / 11),
];

const WEIGHT_UNITS: UnitDefinition[] = [
  linearUnit("milligram", "ミリグラム", "mg", 0.001),
  linearUnit("gram", "グラム", "g", 1),
  linearUnit("kilogram", "キログラム", "kg", 1000),
  linearUnit("ton", "トン", "t", 1000000),
  linearUnit("ounce", "オンス", "oz", 28.349523125),
  linearUnit("pound", "ポンド", "lb", 453.59237),
  linearUnit("monme", "匁", "匁", 3.75),
  linearUnit("kan", "貫", "貫", 3750),
];

const TEMPERATURE_UNITS: UnitDefinition[] = [
  {
    id: "celsius",
    name: "摂氏",
    symbol: "\u00B0C",
    toBase: (v) => v,
    fromBase: (v) => v,
  },
  {
    id: "fahrenheit",
    name: "華氏",
    symbol: "\u00B0F",
    toBase: (v) => ((v - 32) * 5) / 9,
    fromBase: (v) => (v * 9) / 5 + 32,
  },
  {
    id: "kelvin",
    name: "ケルビン",
    symbol: "K",
    toBase: (v) => v - 273.15,
    fromBase: (v) => v + 273.15,
  },
];

const AREA_UNITS: UnitDefinition[] = [
  linearUnit("sqmillimeter", "平方ミリメートル", "mm\u00B2", 0.000001),
  linearUnit("sqcentimeter", "平方センチメートル", "cm\u00B2", 0.0001),
  linearUnit("sqmeter", "平方メートル", "m\u00B2", 1),
  linearUnit("sqkilometer", "平方キロメートル", "km\u00B2", 1000000),
  linearUnit("hectare", "ヘクタール", "ha", 10000),
  linearUnit("are", "アール", "a", 100),
  linearUnit("acre", "エーカー", "ac", 4046.8564224),
  linearUnit("tsubo", "坪", "坪", 400 / 121),
  linearUnit("jou", "畳", "畳", 200 / 121),
];

const SPEED_UNITS: UnitDefinition[] = [
  linearUnit("mps", "メートル毎秒", "m/s", 1),
  linearUnit("kmph", "キロメートル毎時", "km/h", 1 / 3.6),
  linearUnit("mph", "マイル毎時", "mph", 0.44704),
  linearUnit("knot", "ノット", "kn", 1852 / 3600),
  linearUnit("fps", "フィート毎秒", "ft/s", 0.3048),
];

const CATEGORIES: UnitCategoryDefinition[] = [
  { id: "length", name: "長さ", baseUnit: "meter", units: LENGTH_UNITS },
  { id: "weight", name: "重さ", baseUnit: "gram", units: WEIGHT_UNITS },
  {
    id: "temperature",
    name: "温度",
    baseUnit: "celsius",
    units: TEMPERATURE_UNITS,
  },
  { id: "area", name: "面積", baseUnit: "sqmeter", units: AREA_UNITS },
  { id: "speed", name: "速度", baseUnit: "mps", units: SPEED_UNITS },
];

export function getAllCategories(): UnitCategoryDefinition[] {
  return CATEGORIES;
}

export function convert(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory,
): number {
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) throw new Error(`Unknown category: ${category}`);

  const from = cat.units.find((u) => u.id === fromUnit);
  const to = cat.units.find((u) => u.id === toUnit);
  if (!from) throw new Error(`Unknown unit: ${fromUnit}`);
  if (!to) throw new Error(`Unknown unit: ${toUnit}`);

  const baseValue = from.toBase(value);
  return to.fromBase(baseValue);
}
