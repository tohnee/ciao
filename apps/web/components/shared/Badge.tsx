import type { PropsWithChildren } from "react";
import clsx from "clsx";

type BadgeProps = PropsWithChildren<{
  tone?: "neutral" | "success" | "warning" | "danger";
}>;

const tones = {
  neutral: "bg-stone-100 text-stone-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
