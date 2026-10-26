import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-[0_8px_30px_rgba(26,23,20,0.04)]",
        className
      )}
      {...props}
    />
  );
}
