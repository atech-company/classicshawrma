const FALLBACK_PHONE = "96170886095";

export function whatsappDigits(phone?: string | null): string {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return FALLBACK_PHONE;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("961")) return digits;
  if (digits.startsWith("0")) return `961${digits.slice(1)}`;
  if (digits.length === 8) return `961${digits}`;
  return digits;
}

export function whatsappUrl(phone: string | null | undefined, message: string): string {
  return `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(message)}`;
}
