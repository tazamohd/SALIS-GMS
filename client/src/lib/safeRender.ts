/**
 * Safe render / display utilities.
 *
 * Prevents the "Objects are not valid as a React child" crash class by
 * coercing any value to a displayable string, plus Saudi-localised helpers for
 * dates, currency (SAR) and phone numbers. Use `safeDisplay` anywhere a value
 * of uncertain shape is rendered (e.g. an API field that is sometimes an object
 * and sometimes a string).
 *
 *   <td>{safeDisplay(appointment.vehicle)}</td>
 *   <span>{safeCurrency(invoice.totalAmount)}</span>
 *   <span>{safePhone(customer.phone)}</span>
 *
 * Vetted from the platform audit fix package; dependency-free.
 */

/** Coerce any value to a safe display string (never returns an object). */
export function safeDisplay(value: any, fallback: string = "—"): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (value instanceof Date) return value.toLocaleDateString();

  if (typeof value === "object") {
    if (value.displayName) return value.displayName;
    if (value.name) return value.name;
    if (value.make && value.model) return `${value.year || ""} ${value.make} ${value.model}`.trim();
    if (value.label) return value.label;
    if (value.title) return value.title;
    if (value.fullName) return value.fullName;
    if (value.firstName && value.lastName) return `${value.firstName} ${value.lastName}`;
    try {
      const json = JSON.stringify(value);
      return json.length > 50 ? json.substring(0, 47) + "..." : json;
    } catch {
      return "[Object]";
    }
  }

  return String(value) || fallback;
}

/** Format a date value (string | Date | timestamp) for display. */
export function safeDate(
  value: any,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
  fallback: string = "—",
): string {
  if (!value) return fallback;
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return fallback;
    return new Intl.DateTimeFormat("en-SA", options).format(date);
  } catch {
    return fallback;
  }
}

/** Format a currency value (defaults to SAR). */
export function safeCurrency(value: any, currency: string = "SAR", fallback: string = "SAR 0.00"): string {
  if (value === null || value === undefined) return fallback;
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return fallback;
  try {
    return new Intl.NumberFormat("en-SA", { style: "currency", currency, minimumFractionDigits: 2 }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

/** Format a phone number, with Saudi (+966) grouping. */
export function safePhone(value: any, fallback: string = "—"): string {
  if (!value) return fallback;
  const phone = String(value).replace(/[^\d+]/g, "");
  if (phone.length < 7) return fallback;
  if (phone.startsWith("+966") || phone.startsWith("966")) {
    const digits = phone.replace(/^\+?966/, "");
    return `+966 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
  }
  return phone;
}

/** Safely read a nested property: safeGet(appointment, "vehicle.make", "Unknown"). */
export function safeGet(obj: any, path: string, fallback: any = undefined): any {
  return path.split(".").reduce((acc, key) => {
    if (acc === null || acc === undefined) return fallback;
    return acc[key] ?? fallback;
  }, obj);
}

export default { safeDisplay, safeDate, safeCurrency, safePhone, safeGet };
