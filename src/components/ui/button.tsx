import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full text-sm font-semibold transition disabled:opacity-60",
        variant === "default" && "bg-accent text-white hover:bg-accent-dark",
        variant === "outline" && "border border-border bg-surface hover:border-accent",
        variant === "ghost" && "hover:bg-[#f6f3ee]",
        variant === "destructive" && "bg-red-700 text-white hover:bg-red-800",
        size === "default" && "px-5 py-2.5",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "lg" && "px-7 py-3",
        className
      )}
      {...props}
    />
  );
}
