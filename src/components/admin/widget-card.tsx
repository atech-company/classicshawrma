import { cn } from "@/lib/utils";

const accents = {
  green: "var(--admin-accent-green)",
  teal: "var(--admin-accent-teal)",
  red: "var(--admin-accent-red)",
  purple: "var(--admin-accent-purple)",
  yellow: "#f5b82e",
  blue: "var(--admin-blue)",
} as const;

export type WidgetAccent = keyof typeof accents;

export function WidgetCard({
  title,
  accent = "green",
  headerRight,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  accent?: WidgetAccent;
  headerRight?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("admin-widget", className)}
      style={{ ["--widget-accent" as string]: accents[accent] }}
    >
      <header className="admin-widget-header">
        <h2 className="admin-widget-title">{title}</h2>
        {headerRight ? <div className="shrink-0 text-sm text-[var(--admin-muted)]">{headerRight}</div> : null}
      </header>
      <div className={cn("admin-widget-body", bodyClassName)}>{children}</div>
    </section>
  );
}
