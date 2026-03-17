"use client";

import GameDialog from "@/play/games/shared/_components/GameDialog";
import styles from "./styles/KanjiKanaru.module.css";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal explaining how to play the game.
 * Uses the shared GameDialog component for consistent dialog behavior.
 */
export default function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="kanji-kanaru-howtoplay-title"
      title="\u904A\u3073\u65B9"
    >
      <div className={styles.howToPlayContent}>
        <p>
          {
            "\u6BCE\u65E51\u3064\u306E\u6F22\u5B57\u3092\u5F53\u3066\u308B\u30B2\u30FC\u30E0\u3067\u3059\u30026\u56DE\u4EE5\u5185\u306B\u6B63\u89E3\u3092\u898B\u3064\u3051\u307E\u3057\u3087\u3046\u3002"
          }
        </p>
        <p>
          {
            "\u6F22\u5B57\u3092\u5165\u529B\u3059\u308B\u3068\u30016\u3064\u306E\u5C5E\u6027\u306B\u3064\u3044\u3066\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u304C\u8868\u793A\u3055\u308C\u307E\u3059:"
          }
        </p>
        <ul className={styles.feedbackLegend}>
          <li>
            {"\u{1F7E9}"} = {"\u4E00\u81F4"}
          </li>
          <li>
            {"\u{1F7E8}"} = {"\u8FD1\u3044"}
          </li>
          <li>
            {"\u2B1C"} = {"\u4E0D\u4E00\u81F4"}
          </li>
        </ul>
        <p className={styles.attributeList}>
          {
            "\u5C5E\u6027: \u90E8\u9996 / \u753B\u6570 / \u5B66\u5E74 / \u97F3\u8AAD\u307F / \u610F\u5473 / \u8A13\u8AAD\u307F\u6570"
          }
        </p>
        <p>
          {
            "\u5B66\u5E74\u306E\u5217\u306B\u306F\u2191/\u2193\u306E\u77E2\u5370\u304C\u8868\u793A\u3055\u308C\u3001\u6B63\u89E3\u306E\u5B66\u5E74\u304C\u4E0A\u304B\u4E0B\u304B\u3092\u793A\u3057\u307E\u3059\u3002"
          }
        </p>
        <p>
          {
            "\u8A13\u8AAD\u307F\u6570: \u63A8\u6E2C\u3057\u305F\u6F22\u5B57\u306E\u8A13\u8AAD\u307F\u306E\u6570\u3068\u6B63\u89E3\u306E\u8A13\u8AAD\u307F\u306E\u6570\u3092\u6BD4\u8F03\u3057\u307E\u3059\u3002"
          }
        </p>
        <p>
          {
            "\u610F\u5473: \u63A8\u6E2C\u3057\u305F\u6F22\u5B57\u3068\u6B63\u89E3\u306E\u6F22\u5B57\u306E\u610F\u5473\u304C\u3069\u308C\u304F\u3089\u3044\u8FD1\u3044\u304B\u3092\u8868\u3057\u307E\u3059\u3002\u610F\u5473\u304C\u975E\u5E38\u306B\u8FD1\u3051\u308C\u3070\u7DD1\u3001\u3084\u3084\u95A2\u9023\u304C\u3042\u308C\u3070\u9EC4\u8272\u3001\u95A2\u9023\u304C\u8584\u3051\u308C\u3070\u767D\u3067\u8868\u793A\u3055\u308C\u307E\u3059\u3002"
          }
        </p>
        <p>
          <strong>{"\u96E3\u6613\u5EA6:"}</strong>
        </p>
        <ul className={styles.feedbackLegend}>
          <li>
            {
              "\u521D\u7D1A: \u5C0F\u5B661-2\u5E74\u306E\u6F22\u5B57\uFF08\u7D04240\u5B57\uFF09"
            }
          </li>
          <li>
            {
              "\u4E2D\u7D1A: \u5C0F\u5B661-6\u5E74\u306E\u6F22\u5B57\uFF08\u7D041,026\u5B57\uFF09"
            }
          </li>
          <li>
            {
              "\u4E0A\u7D1A: \u5168\u5E38\u7528\u6F22\u5B57\uFF08\u7D042,136\u5B57\uFF09"
            }
          </li>
        </ul>
        <p className={styles.licenseAttribution}>
          {
            "本アプリケーションはKANJIDIC2およびJMdict辞書ファイルを使用しています。これらのファイルはElectronic Dictionary Research and Development Groupの所有物であり、同グループのライセンスに準拠して使用しています。"
          }
        </p>
      </div>
    </GameDialog>
  );
}
