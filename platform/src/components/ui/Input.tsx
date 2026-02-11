import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id: externalId, ...rest }, ref) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700"
            data-testid="input-label"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          data-testid="input"
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400",
            "transition-colors",
            "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
            error &&
              "border-danger focus:border-danger focus:ring-danger/20",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {error && (
          <p
            id={`${id}-error`}
            className="text-xs text-danger"
            data-testid="input-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
