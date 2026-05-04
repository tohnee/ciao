import type { PropsWithChildren } from "react";
import clsx from "clsx";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}
