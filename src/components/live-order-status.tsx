"use client";

import { Check, CircleAlert, Radio, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { OrderStatusHistory } from "@/lib/types";

type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "completed" | "cancelled";

export function LiveOrderStatus({
  reference,
  initialStatus,
  initialHistory,
  orderType,
}: {
  reference: string;
  initialStatus: string;
  initialHistory: OrderStatusHistory[];
  orderType: "takeaway" | "delivery";
}) {
  const locale = useLocale();
  const t = useTranslations("order");
  const ts = useTranslations("status");
  const [status, setStatus] = useState(initialStatus);
  const [history, setHistory] = useState(initialHistory);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function refreshStatus() {
      try {
        const order = await api.getOrder(reference);
        if (!disposed) {
          setStatus(order.status);
          setHistory(order.status_histories ?? []);
          setLastChecked(new Date());
          setConnectionError(false);
        }
      } catch {
        if (!disposed) {
          setConnectionError(true);
        }
      }
    }

    void refreshStatus();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshStatus();
      }
    }, 12000);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [reference]);

  const steps: OrderStatus[] = orderType === "delivery"
    ? ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed"]
    : ["pending", "confirmed", "preparing", "ready", "completed"];
  const currentIndex = steps.indexOf(status as OrderStatus);
  const cancelled = status === "cancelled";
  const latestHistory = history.length ? history[history.length - 1] : null;

  return (
    <section aria-live="polite" className="mt-8 rounded-[1.75rem] border border-white/80 bg-white/55 p-5 shadow-[0_14px_42px_rgba(72,47,28,.06)] backdrop-blur-xl md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">{t("liveStatus")}</p>
          <h2 className="mt-1 font-display text-2xl">{ts(status as OrderStatus)}</h2>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${connectionError ? "bg-amber-100 text-amber-800" : cancelled ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
          {connectionError ? <CircleAlert className="h-3.5 w-3.5" /> : <Radio className={`h-3.5 w-3.5 ${!cancelled && "animate-pulse"}`} />}
          {connectionError ? t("reconnecting") : t("autoRefresh")}
        </span>
      </div>

      {!cancelled ? (
        <div className="mt-8 overflow-x-auto pb-2">
        <ol className="flex min-w-[540px]">
          {steps.map((step, index) => {
            const complete = currentIndex >= index;
            const current = currentIndex === index;

            return (
              <li key={step} className="relative flex flex-1 flex-col items-center text-center">
                {index > 0 && <span className={`absolute top-4 h-0.5 w-1/2 ${complete ? "bg-accent" : "bg-border"} ltr:left-0 rtl:right-0`} aria-hidden="true" />}
                {index < steps.length - 1 && <span className={`absolute top-4 h-0.5 w-1/2 ${currentIndex > index ? "bg-accent" : "bg-border"} ltr:left-1/2 rtl:right-1/2`} aria-hidden="true" />}
                <span className={`relative z-[1] flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${complete ? "border-accent bg-accent text-white" : "border-border bg-white text-muted"} ${current ? "ring-4 ring-accent/15" : ""}`}>
                  {complete ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                </span>
                <span className={`mt-2 max-w-20 text-[10px] leading-4 sm:text-xs ${current ? "font-bold text-accent" : complete ? "font-medium text-foreground" : "text-muted"}`}>{ts(step)}</span>
              </li>
            );
          })}
        </ol>
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{ts("cancelled")}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-black/[.06] pt-4 text-xs text-muted">
        <span className="inline-flex items-center gap-2"><RefreshCw className={`h-3.5 w-3.5 ${connectionError ? "text-amber-700" : ""}`} />{connectionError ? t("statusOffline") : t("autoRefreshHint")}</span>
        {lastChecked && <span>{t("lastChecked")} {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(lastChecked)}</span>}
      </div>
      {latestHistory?.note && <p className="mt-3 rounded-xl bg-accent/[.06] px-4 py-3 text-sm text-muted">{latestHistory.note}</p>}
    </section>
  );
}
