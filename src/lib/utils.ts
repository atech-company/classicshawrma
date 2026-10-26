import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(
  amount: number,
  currency = "LBP",
  decimals = 0
): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(decimals > 0 ? amount / 10 ** decimals : amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export function localized<T extends Record<string, unknown>>(
  obj: T,
  locale: string,
  field: string
): string {
  const key = `${field}_${locale}` as keyof T;
  const fallback = `${field}_en` as keyof T;
  const value = (obj[key] ?? obj[fallback] ?? "") as string;
  return value;
}
