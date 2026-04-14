import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      data-testid="card"
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps };
