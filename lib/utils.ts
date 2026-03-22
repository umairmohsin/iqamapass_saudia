import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "--";
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB").format(value);
}

export function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
