import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "gray";

/**
 * Semantic color buckets for type-coded badges (e.g. submission-type tags).
 * `color` is a convenience alias that maps onto the same token families as
 * `variant`; when both are passed, `color` wins. Kept separate from `variant`
 * so callers reading as "the kind of thing" stay legible at the call site.
 */
type BadgeColor =
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-brand-light text-brand",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  gray: "bg-gray-100 text-gray-700",
};

const colorStyles: Record<BadgeColor, string> = {
  brand: "bg-brand-light text-brand",
  // accent-light is a legacy violet token; tint from the green accent instead.
  accent: "bg-accent/15 text-accent",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  neutral: "bg-gray-100 text-gray-700",
};

function Badge({
  variant = "default",
  color,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      data-testid="badge"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        color ? colorStyles[color] : variantStyles[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant, type BadgeColor };
