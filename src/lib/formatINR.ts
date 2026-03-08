/**
 * Format a number in Indian numbering system (lakhs/crores).
 * e.g. 1234567 → "₹12,34,567"
 */
export function formatINR(num: number, showSymbol = true): string {
  const prefix = showSymbol ? "₹" : "";
  const isNegative = num < 0;
  const abs = Math.abs(num);

  // Handle decimals
  const parts = abs.toFixed(2).split(".");
  const intPart = parts[0];
  const decPart = parts[1];

  // Indian grouping: last 3 digits, then groups of 2
  let formatted: string;
  if (intPart.length <= 3) {
    formatted = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formatted = grouped + "," + last3;
  }

  // Drop .00 for whole numbers
  const result = decPart === "00" ? formatted : `${formatted}.${decPart}`;
  return `${isNegative ? "-" : ""}${prefix}${result}`;
}

/**
 * Compact INR format for dashboards/KPIs.
 * e.g. 1500000 → "₹15L", 25000000 → "₹2.5Cr"
 */
export function formatINRCompact(num: number): string {
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 10000000) {
    const cr = abs / 10000000;
    return `${sign}₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    const l = abs / 100000;
    return `${sign}₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
  }
  if (abs >= 1000) {
    const k = abs / 1000;
    return `${sign}₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}
