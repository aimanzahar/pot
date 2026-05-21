import type { Currency } from "./types";

const SYMBOLS: Record<Currency, string> = {
  MYR: "RM",
  SGD: "S$",
  USD: "$",
  EUR: "€",
  GBP: "£",
  IDR: "Rp",
  THB: "฿",
};

export const CURRENCY_OPTIONS: Currency[] = [
  "MYR",
  "SGD",
  "USD",
  "EUR",
  "GBP",
  "IDR",
  "THB",
];

export function currencySymbol(c: Currency): string {
  return SYMBOLS[c] ?? c;
}

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = currencySymbol(currency);
  const value = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${value}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return formatDate(iso);
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export function dueLabel(iso: string | null | undefined): string {
  const days = daysUntil(iso);
  if (days === null) return "";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days}d`;
}
