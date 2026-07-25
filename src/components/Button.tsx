import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The one button in the app. Enforces a deliberate hierarchy so every button
 * reads at the right level:
 *   - primary   → the single most important action on a screen/section
 *   - secondary → supporting actions (outline)
 *   - ghost     → low-emphasis / inline actions (no chrome until hover)
 *   - danger    → destructive actions (delete, reset)
 * Everything shares the same shape, motion, and focus treatment.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-brand hover:bg-brand-deep",
  secondary:
    "border border-line bg-surface text-dusk shadow-soft hover:border-line2 hover:text-night",
  ghost: "text-dusk hover:bg-surface2 hover:text-night",
  danger: "border border-berry/40 bg-surface text-berry-deep hover:bg-berry-soft",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-lg px-3 py-1.5 text-xs",
  md: "gap-1.5 rounded-xl px-4 py-2 text-sm",
  lg: "gap-2 rounded-xl px-5 py-2.5 text-[15px]",
};

export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  block,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center font-semibold transition duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${
        VARIANT[variant]
      } ${SIZE[size]} ${block ? "w-full" : ""} ${className}`}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
