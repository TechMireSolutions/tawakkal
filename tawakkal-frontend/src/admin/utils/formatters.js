/**
 * Format currency with locale and currency code
 */
export function formatCurrency(
  amount,
  currency = "PKR",
  locale = "en-PK"
) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "PKR" ? 0 : 2,
    maximumFractionDigits: currency === "PKR" ? 0 : 2,
  }).format(Number(amount));
}


/**
 * Convert amount using exchange rate
 * Base currency: PKR
 */
export function convertCurrency(amount, rate = 1) {
  if (!amount || isNaN(amount)) {
    return 0;
  }

  return Number(amount) * Number(rate);
}


/**
 * Format a number with commas and abbreviations
 */
export function formatNumber(num) {
  if (!num) return "0";

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }

  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat().format(num);
}


/**
 * Format date relative to now
 */
export function formatRelativeDate(date) {
  const now = new Date();
  const d = new Date(date);

  const diffMs = now - d;

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);


  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date);
}


/**
 * Format date
 */
export function formatDate(date, options = {}) {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}


/**
 * Format date and time
 */
export function formatDateTime(date) {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


/**
 * Format percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) {
    return "0%";
  }

  return `${Number(value).toFixed(decimals)}%`;
}


/**
 * Truncate text
 */
export function truncate(str, maxLength = 50) {
  if (!str) return "";

  if (str.length <= maxLength) {
    return str;
  }

  return str.substring(0, maxLength) + "…";
}


/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return "";

  return (
    str.charAt(0).toUpperCase() +
    str.slice(1).toLowerCase()
  );
}


/**
 * Generate initials
 */
export function getInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (!bytes) return "0 Bytes";

  const k = 1024;

  const sizes = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const i = Math.floor(
    Math.log(bytes) / Math.log(k)
  );

  return (
    parseFloat(
      (bytes / Math.pow(k, i)).toFixed(2)
    ) +
    " " +
    sizes[i]
  );
}


/**
 * Generate slug
 */
export function slugify(str) {
  if (!str) return "";

  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}