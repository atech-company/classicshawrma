"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [introEn, setIntroEn] = useState("");
  const [introAr, setIntroAr] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneSecondary, setPhoneSecondary] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [addressAr, setAddressAr] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [takeawayEnabled, setTakeawayEnabled] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [currency, setCurrency] = useState("LBP");
  const [currencyDecimals, setCurrencyDecimals] = useState("0");
  const [defaultLocale, setDefaultLocale] = useState("ar");
  const [hours, setHours] = useState<Record<string, string>>({});
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [removeHero, setRemoveHero] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    Promise.all([api.adminMe(token), api.adminRestaurant(token)])
      .then(([me, r]) => {
        setAdminName(me.name);
        setAdminEmail(me.email);
        setNameEn(r.name_en);
        setNameAr(r.name_ar);
        setIntroEn(r.intro_en ?? "");
        setIntroAr(r.intro_ar ?? "");
        setPhone(r.phone ?? "");
        setPhoneSecondary(r.phone_secondary ?? "");
        setAddressEn(r.address_en ?? "");
        setAddressAr(r.address_ar ?? "");
        setFacebookUrl(r.facebook_url ?? "");
        setInstagramUrl(r.instagram_url ?? "");
        setDeliveryEnabled(r.delivery_enabled);
        setTakeawayEnabled(r.takeaway_enabled);
        setDeliveryFee(String(r.delivery_fee));
        setCurrency(r.currency);
        setCurrencyDecimals(String(r.currency_decimals));
        setDefaultLocale(r.default_locale);
        setHours(r.hours ?? {});
        setHeroPreview(r.hero_image_url);
      })
      .catch(() => setError("Could not load restaurant settings."))
      .finally(() => setLoading(false));
  }, []);

  async function onAccountSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAdminToken();
    if (!token) return;
    setAccountMessage("");
    setAccountError("");

    if (newPassword && newPassword !== newPasswordConfirm) {
      setAccountError("New password confirmation does not match.");
      return;
    }

    if (newPassword && !currentPassword) {
      setAccountError("Enter your current password to set a new one.");
      return;
    }

    setAccountSaving(true);
    try {
      const payload: {
        name: string;
        email: string;
        current_password?: string;
        password?: string;
        password_confirmation?: string;
      } = {
        name: adminName.trim(),
        email: adminEmail.trim(),
      };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.password = newPassword;
        payload.password_confirmation = newPasswordConfirm;
      }
      const updated = await api.adminUpdateProfile(token, payload);
      setAdminName(updated.name);
      setAdminEmail(updated.email);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setAccountMessage(
        newPassword
          ? "Account updated. Use your new email/password next time you sign in."
          : "Account updated."
      );
    } catch (err) {
      const apiErr = err as Error & { errors?: Record<string, string[]> };
      const firstFieldError = apiErr.errors
        ? Object.values(apiErr.errors).flat()[0]
        : undefined;
      setAccountError(firstFieldError || apiErr.message || "Could not update account.");
    } finally {
      setAccountSaving(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAdminToken();
    if (!token) return;
    setMessage("");
    setError("");
    try {
      const form = new FormData();
      form.append("name_en", nameEn);
      form.append("name_ar", nameAr);
      form.append("intro_en", introEn);
      form.append("intro_ar", introAr);
      form.append("phone", phone);
      form.append("phone_secondary", phoneSecondary);
      form.append("address_en", addressEn);
      form.append("address_ar", addressAr);
      form.append("facebook_url", facebookUrl);
      form.append("instagram_url", instagramUrl);
      form.append("delivery_enabled", deliveryEnabled ? "1" : "0");
      form.append("takeaway_enabled", takeawayEnabled ? "1" : "0");
      form.append("delivery_fee", String(Math.round(Number(deliveryFee) || 0)));
      form.append("currency", currency);
      form.append("currency_decimals", String(Number(currencyDecimals) || 0));
      form.append("default_locale", defaultLocale);
      form.append("hours", JSON.stringify(hours));
      if (removeHero) form.append("remove_hero_image", "1");
      if (heroImage) form.append("hero_image", heroImage);
      const res = await api.adminSaveRestaurant(token, form);
      const data = "data" in (res as object) ? (res as { data: { hero_image_url?: string } }).data : res;
      setHeroPreview((data as { hero_image_url?: string }).hero_image_url ?? null);
      setHeroImage(null);
      setRemoveHero(false);
      setMessage("Settings saved. Public site will reflect changes immediately.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <p className="text-sm text-[var(--admin-muted)]">Loading settings…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">Settings</h1>
      <p className="mt-1 text-sm text-[var(--admin-muted)]">
        Admin login details and restaurant info shown on the customer site.
      </p>

      <form onSubmit={onAccountSubmit} className="mt-6">
        <Card className="admin-card grid gap-3 border-[var(--admin-border)] bg-[rgba(255,255,255,.62)] p-5 shadow-[var(--admin-shadow)] md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="font-semibold">Admin account</h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              Change your display name, login email (username), and password.
            </p>
          </div>
          <label className="grid gap-1 text-sm text-[var(--admin-muted)]">
            Display name
            <Input
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Admin name"
              autoComplete="name"
            />
          </label>
          <label className="grid gap-1 text-sm text-[var(--admin-muted)]">
            Login email / username
            <Input
              required
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
              dir="ltr"
            />
          </label>
          <label className="grid gap-1 text-sm text-[var(--admin-muted)] md:col-span-2">
            Current password
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required only when changing password"
              autoComplete="current-password"
            />
          </label>
          <label className="grid gap-1 text-sm text-[var(--admin-muted)]">
            New password
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
            />
          </label>
          <label className="grid gap-1 text-sm text-[var(--admin-muted)]">
            Confirm new password
            <Input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </label>
          {accountMessage && <p className="md:col-span-2 text-sm text-green-700">{accountMessage}</p>}
          {accountError && <p className="md:col-span-2 text-sm text-red-700">{accountError}</p>}
          <div className="md:col-span-2">
            <Button type="submit" disabled={accountSaving}>
              {accountSaving ? "Saving account…" : "Save account"}
            </Button>
          </div>
        </Card>
      </form>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <Card className="admin-card grid gap-3 border-[var(--admin-border)] bg-[rgba(255,255,255,.62)] p-5 shadow-[var(--admin-shadow)] md:grid-cols-2">
          <h2 className="md:col-span-2 font-semibold">Branding & intro</h2>
          <Input required value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Name EN" />
          <Input required value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="Name AR" dir="rtl" />
          <Textarea value={introEn} onChange={(e) => setIntroEn(e.target.value)} placeholder="Intro EN" rows={3} />
          <Textarea value={introAr} onChange={(e) => setIntroAr(e.target.value)} placeholder="Intro AR" rows={3} dir="rtl" />
          <div className="md:col-span-2 space-y-2">
            <p className="text-sm font-medium">Hero image</p>
            {heroPreview && !removeHero && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroPreview} alt="Hero" className="h-32 w-full max-w-md rounded-xl object-cover" />
            )}
            <Input type="file" accept="image/*" onChange={(e) => setHeroImage(e.target.files?.[0] ?? null)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={removeHero} onChange={(e) => setRemoveHero(e.target.checked)} />
              Remove current hero image
            </label>
          </div>
        </Card>

        <Card className="admin-card grid gap-3 border-[var(--admin-border)] bg-[rgba(255,255,255,.62)] p-5 shadow-[var(--admin-shadow)] md:grid-cols-2">
          <h2 className="md:col-span-2 font-semibold">Contact & social</h2>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" dir="ltr" />
          <Input value={phoneSecondary} onChange={(e) => setPhoneSecondary(e.target.value)} placeholder="Secondary phone" dir="ltr" />
          <Input value={addressEn} onChange={(e) => setAddressEn(e.target.value)} placeholder="Address EN" />
          <Input value={addressAr} onChange={(e) => setAddressAr(e.target.value)} placeholder="Address AR" dir="rtl" />
          <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="Facebook URL" />
          <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="Instagram URL" />
        </Card>

        <Card className="admin-card grid gap-3 border-[var(--admin-border)] bg-[rgba(255,255,255,.62)] p-5 shadow-[var(--admin-shadow)] md:grid-cols-2">
          <h2 className="md:col-span-2 font-semibold">Ordering</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={takeawayEnabled} onChange={(e) => setTakeawayEnabled(e.target.checked)} />
            Takeaway enabled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={deliveryEnabled} onChange={(e) => setDeliveryEnabled(e.target.checked)} />
            Delivery enabled
          </label>
          <Input type="number" min={0} value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="Delivery fee" />
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" />
          <Input type="number" min={0} max={4} value={currencyDecimals} onChange={(e) => setCurrencyDecimals(e.target.value)} placeholder="Decimals" />
          <select
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value)}
            className="admin-select"
          >
            <option value="ar">Default locale: Arabic</option>
            <option value="en">Default locale: English</option>
          </select>
        </Card>

        <Card className="admin-card grid gap-3 border-[var(--admin-border)] bg-[rgba(255,255,255,.62)] p-5 shadow-[var(--admin-shadow)] md:grid-cols-2">
          <h2 className="md:col-span-2 font-semibold">Opening hours</h2>
          <p className="md:col-span-2 text-sm text-[var(--admin-muted)]">
            Leave blank to hide hours on the site. Example: 12:00 – 00:00
          </p>
          {DAY_KEYS.map((day) => (
            <label key={day} className="space-y-1 text-sm capitalize">
              <span>{day}</span>
              <Input
                value={hours[day] ?? ""}
                onChange={(e) =>
                  setHours((prev) => ({ ...prev, [day]: e.target.value }))
                }
                placeholder="Closed or 12:00 – 00:00"
              />
            </label>
          ))}
        </Card>

        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit">Save settings</Button>
      </form>
    </AdminShell>
  );
}
