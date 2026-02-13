import { ROLE_DISPLAY, type RoleSlug } from "@/lib/memos-shared";
import styles from "./RoleBadge.module.css";

interface RoleBadgeProps {
  role: RoleSlug;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const display = ROLE_DISPLAY[role] || ROLE_DISPLAY.owner;

  return (
    <span
      className={styles.badge}
      style={{
        borderColor: display.color,
        color: display.color,
      }}
    >
      {display.label}
    </span>
  );
}
