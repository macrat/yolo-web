/**
 * サイトの外に出る画像（OGP 画像と、来訪者が保存する結果の画像）の枠の寸法と字の段（DESIGN.md §10）。
 *
 * 枠はサイトの画面の頭と同じ形で、上端のサイト名とその下の全幅の太い罫線、下端の上の全幅の太い罫線、それを上端から
 * 下端まで貫くコンテナの左右の太い線から成る。中身は罫線とコンテナの線のあいだに置く。
 *
 * サーバーで描く画像（`share-image.tsx`）と、来訪者の端末の Canvas で描く画像の両方がここから取り、2つの枠が
 * 同じ寸法になる。`next/og` を読まないので、クライアントの部品からも import できる。
 */

/**
 * 描き方の版。画像の URL の版（`?v=`）は、中身とこのモジュールの値から作る。描き方のコード（書体・字の組み方）だけを
 * 変えたときは、この値を1つ上げて、SNS に画像を取り直させる。
 */
export const SHARE_IMAGE_VERSION = 1;

/** 画像の大きさ。カードがふつうに見られる幅（500〜600px）のおよそ2倍。 */
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

/** 線の太さ。§5 の2種類の線（3px と 1px）の2倍で、縮めたカードで画面の線と同じ太さに見える。 */
export const THICK_RULE = 6;
export const THIN_RULE = 2;

/**
 * SNS が画像を 2:1 に切るときに落ちうる、上下の端からの幅。ここには字も横の罫線も置かない。
 */
export const CROP_BAND = 15;

/** 上端の全幅の罫線の上端の y。サイト名はこの上、切り取りの帯の下に置く。 */
export const TOP_RULE_Y = 84;
/** 下端の上の全幅の罫線の上端の y。 */
export const BOTTOM_RULE_Y = 576;

/** コンテナの左の線の左端の x と、右の線の左端の x。画像の左右の端から同じだけ離す。 */
export const LEFT_RULE_X = 56;
export const RIGHT_RULE_X = SHARE_IMAGE_WIDTH - LEFT_RULE_X - THICK_RULE;

/** コンテナの線の内側から字までの左右の余白。 */
export const CONTENT_INSET_X = 40;
/** 罫線の内側から中身までの上下の余白の下限。中身はこの内側で上下の中央に置く。 */
export const CONTENT_INSET_Y = 32;

/** 中身の枠。サイト名もこの左端から置く。 */
export const CONTENT_LEFT = LEFT_RULE_X + THICK_RULE + CONTENT_INSET_X;
export const CONTENT_WIDTH = RIGHT_RULE_X - CONTENT_INSET_X - CONTENT_LEFT;
export const CONTENT_TOP = TOP_RULE_Y + THICK_RULE;
export const CONTENT_HEIGHT = BOTTOM_RULE_Y - CONTENT_TOP;
/** 中身を置ける縦の幅。 */
export const CONTENT_MAX_HEIGHT = CONTENT_HEIGHT - CONTENT_INSET_Y * 2;

/** サイト名の字の大きさと、それを置く帯（切り取りの帯の下から上端の罫線まで）。 */
export const SITE_NAME_SIZE = 36;
export const SITE_NAME_TOP = CROP_BAND;
export const SITE_NAME_HEIGHT = TOP_RULE_Y - CROP_BAND;

/** 補助情報の大きさで組む字（補助情報・読み・副題）の大きさと行の高さ。 */
export const AUX_SIZE = 36;
export const AUX_LINE_HEIGHT = 50;

/**
 * 名前を組む段。いちばん上が 96px、いちばん下が 42px で、そのあいだを約 1.14 倍ずつ刻む。大きい方から試し、
 * 名前が3行以内に収まり、中身が枠の縦に収まるいちばん大きい段を選ぶ。
 */
export const NAME_SIZES = [96, 84, 72, 64, 56, 48, 42] as const;
/** 名前が収まる行の数の上限。 */
export const NAME_MAX_LINES = 3;
/** 見出しの行間（§4 の見出しは 1.25 以下）。 */
export const NAME_LINE_HEIGHT_RATIO = 1.25;

/**
 * 数字の結果（クイズの点数・ゲームの合計点）の大きさ。名前の段のいちばん上の約 1.4 倍で、名前がどの段で組まれても
 * 名前より大きい。
 */
export const NUMERIC_SIZE = 134;
export const NUMERIC_LINE_HEIGHT_RATIO = 1.1;

/** 色見本の1辺と、見本と名前のあいだ。 */
export const SWATCH_SIZE = 200;
export const SWATCH_GAP = 40;

/** 中身の段どうしのあいだ。 */
export const GAP_AFTER_AUX = 12;
export const GAP_AFTER_NUMERIC = 8;
export const GAP_AFTER_NAME = 12;
export const GAP_AFTER_READING = 8;

/** 名前の段 size の1行の高さ。 */
export function nameLineHeight(size: number): number {
  return Math.round(size * NAME_LINE_HEIGHT_RATIO);
}

/** 数字の結果の1行の高さ。 */
export const NUMERIC_LINE_HEIGHT = Math.round(
  NUMERIC_SIZE * NUMERIC_LINE_HEIGHT_RATIO,
);
