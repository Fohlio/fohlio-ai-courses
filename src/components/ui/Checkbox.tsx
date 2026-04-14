import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id: externalId, ...rest }, ref) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          data-testid="checkbox"
          className={cn(
            "h-4 w-4 rounded border-gray-300",
            "text-brand focus:ring-brand/30 focus:ring-2 focus:ring-offset-1",
            "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            "accent-brand",
            className
          )}
          {...rest}
        />
        {label && (
          <label
            htmlFor={id}
            className="cursor-pointer select-none text-sm text-gray-700"
            data-testid="checkbox-label"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox, type CheckboxProps };
