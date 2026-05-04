import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-hover active:scale-[0.97] transition-all duration-150",
  secondary:
    "border border-border bg-white text-stone-700 shadow-sm hover:bg-stone-50 hover:border-stone-300 active:scale-[0.97] transition-all duration-150",
  ghost: "bg-transparent text-muted hover:bg-stone-100 hover:text-stone-700 transition-all duration-150",
};

export function Button({
  className,
  variant = "secondary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
        styles[variant],
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
