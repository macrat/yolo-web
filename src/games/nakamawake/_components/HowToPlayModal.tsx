"use client";

import GameDialog from "@/games/shared/_components/GameDialog";
import styles from "./HowToPlayModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal explaining how to play the game.
 * Uses the shared GameDialog component for consistent dialog behavior.
 */
export default function HowToPlayModal({ open, onClose }: Props) {
  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="nakamawake-howtoplay-title"
      title={"\u30CA\u30AB\u30DE\u30EF\u30B1\u306E\u904A\u3073\u65B9"}
    >
      <div className={styles.content}>
        <p>
          16
          {
            "\u500B\u306E\u8A00\u8449\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002"
          }
        </p>
        <p>
          {
            "\u5171\u901A\u306E\u30C6\u30FC\u30DE\u3092\u6301\u30644\u3064\u306E\u30B0\u30EB\u30FC\u30D7\u306B\u5206\u3051\u3066\u304F\u3060\u3055\u3044\u3002"
          }
        </p>
        <p>
          4
          {
            "\u3064\u306E\u8A00\u8449\u3092\u9078\u3093\u3067\u300C\u30C1\u30A7\u30C3\u30AF\u300D\u30DC\u30BF\u30F3\u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
          }
        </p>
        <p>
          {
            "\u6B63\u89E3\u3059\u308B\u3068\u30B0\u30EB\u30FC\u30D7\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002"
          }
        </p>
        <p>
          4
          {
            "\u56DE\u9593\u9055\u3048\u308B\u3068\u30B2\u30FC\u30E0\u30AA\u30FC\u30D0\u30FC\u3067\u3059\u3002"
          }
        </p>
        <ul className={styles.colorLegend}>
          <li>
            <span className={`${styles.colorSwatch} ${styles.swatchYellow}`} />{" "}
            {"\u9EC4"} = {"\u6613\u3057\u3044"}
          </li>
          <li>
            <span className={`${styles.colorSwatch} ${styles.swatchGreen}`} />{" "}
            {"\u7DD1"} = {"\u666E\u901A"}
          </li>
          <li>
            <span className={`${styles.colorSwatch} ${styles.swatchBlue}`} />{" "}
            {"\u9752"} = {"\u96E3\u3057\u3044"}
          </li>
          <li>
            <span className={`${styles.colorSwatch} ${styles.swatchPurple}`} />{" "}
            {"\u7D2B"} = {"\u3068\u3066\u3082\u96E3\u3057\u3044"}
          </li>
        </ul>
        <p>
          {
            "\u6BCE\u65E5\u65B0\u3057\u3044\u30D1\u30BA\u30EB\u304C\u51FA\u984C\u3055\u308C\u307E\u3059\u3002"
          }
        </p>
      </div>
    </GameDialog>
  );
}
