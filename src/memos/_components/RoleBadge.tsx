import {
  ROLE_DISPLAY,
  capitalize,
  type RoleSlug,
} from "@/memos/_lib/memos-shared";
import styles from "./RoleBadge.module.css";

interface RoleBadgeProps {
  role: string;
}

/** Default display for unknown roles */
const DEFAULT_DISPLAY = {
  color: "#6b7280",
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  const knownDisplay = ROLE_DISPLAY[role as RoleSlug];
  const color = knownDisplay?.color ?? DEFAULT_DISPLAY.color;
  const label = knownDisplay?.label ?? capitalize(role);

  return (
    <span
      className={styles.badge}
      style={{
        borderColor: color,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
