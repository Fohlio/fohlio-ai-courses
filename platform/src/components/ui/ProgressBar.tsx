import { cn } from "@/lib/utils";

type ProgressBarSize = "sm" | "md";
type ProgressBarColor = "brand" | "success" | "warning";

interface ProgressBarProps {
  /** Progress value between 0 and 100 */
  value: number;
  size?: ProgressBarSize;
  color?: ProgressBarColor;
  className?: string;
}

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
};

const colorStyles: Record<ProgressBarColor, string> = {
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
};

function ProgressBar({
  value,
  size = "md",
  color = "brand",
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      data-testid="progress-bar"
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-gray-100",
        sizeStyles[size],
        className
      )}
    >
      <div
        data-testid="progress-bar-fill"
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          colorStyles[color]
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

export {
  ProgressBar,
  type ProgressBarProps,
  type ProgressBarSize,
  type ProgressBarColor,
};
