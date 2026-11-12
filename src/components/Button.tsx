import type { ButtonHTMLAttributes } from "react";

const styles = {
  primary: "bg-brand text-white disabled:bg-brand/40",
  white: "bg-white text-brand",
  soft: "bg-brand-soft text-brand",
  ghost: "text-sub",
} as const;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof styles;
}

export default function Button({ variant = "primary", className = "", ...rest }: Props) {
  return (
    <button
      className={`h-14 w-full rounded-2xl text-base font-semibold transition active:scale-[0.98] ${styles[variant]} ${className}`}
      {...rest}
    />
  );
}
