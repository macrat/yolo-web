"use client";

import GameDialog from "@/components/games/shared/GameDialog";
import styles from "./HowToPlayModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal explaining how to play the Irodori game.
 * Uses the shared GameDialog component for consistent dialog behavior.
 */
export default function HowToPlayModal({ open, onClose }: Props) {
  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="irodori-howtoplay-title"
      title={"\u30A4\u30ED\u30C9\u30EA\u306E\u904A\u3073\u65B9"}
    >
      <div className={styles.content}>
        <p>
          {
            "\u6BCE\u65E55\u554F\u306E\u8272\u5F69\u30C1\u30E3\u30EC\u30F3\u30B8\u304C\u51FA\u984C\u3055\u308C\u307E\u3059\u3002"
          }
        </p>
        <p>
          {
            "\u753B\u9762\u306B\u8868\u793A\u3055\u308C\u308B\u30BF\u30FC\u30B2\u30C3\u30C8\u30AB\u30E9\u30FC\u3092\u898B\u3066\u3001H\uFF08\u8272\u76F8\uFF09\u30FBS\uFF08\u5F69\u5EA6\uFF09\u30FBL\uFF08\u660E\u5EA6\uFF09\u306E3\u3064\u306E\u30B9\u30E9\u30A4\u30C0\u30FC\u3067\u3067\u304D\u308B\u3060\u3051\u8FD1\u3044\u8272\u3092\u4F5C\u3063\u3066\u304F\u3060\u3055\u3044\u3002"
          }
        </p>
        <p>
          {
            "\u300C\u6C7A\u5B9A\u300D\u30DC\u30BF\u30F3\u3067\u56DE\u7B54\u3092\u78BA\u5B9A\u3057\u307E\u3059\u3002\u30BF\u30FC\u30B2\u30C3\u30C8\u3068\u306E\u8272\u5DEE\u304C\u5C0F\u3055\u3044\u307B\u3069\u9AD8\u5F97\u70B9\u3067\u3059\u3002"
          }
        </p>
        <p>
          {
            "\u5168\u554F\u7D42\u4E86\u5F8C\u3001\u7DCF\u5408\u30B9\u30B3\u30A2\uFF080-100\u70B9\uFF09\u3068\u30E9\u30F3\u30AF\uFF08S/A/B/C/D\uFF09\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002"
          }
        </p>
        <p>
          {
            "\u65E5\u672C\u306E\u4F1D\u7D71\u8272\u304C\u767B\u5834\u3059\u308B\u3053\u3068\u3082\u3042\u308A\u307E\u3059\u3002\u8272\u540D\u306F\u56DE\u7B54\u5F8C\u306B\u516C\u958B\u3055\u308C\u307E\u3059\u3002"
          }
        </p>
        <p className={styles.note}>
          {
            "\u203B \u30C7\u30A3\u30B9\u30D7\u30EC\u30A4\u306E\u8A2D\u5B9A\u306B\u3088\u308A\u8272\u306E\u898B\u3048\u65B9\u304C\u7570\u306A\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002"
          }
        </p>
      </div>
    </GameDialog>
  );
}
