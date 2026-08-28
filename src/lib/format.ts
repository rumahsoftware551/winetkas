export const formatCurrency = (value: number | string | { toString(): string }) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));

export const formatNumber = (value: number | string | { toString(): string }) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(Number(value));

export const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

export const humanize = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
