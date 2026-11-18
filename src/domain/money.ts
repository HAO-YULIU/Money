export function formatTWD(n: number): string {
  const s = '$' + Math.abs(n).toLocaleString('en-US');
  return n < 0 ? '−' + s : s;
}

/** Positive integer amount, or null. Allows surrounding spaces and thousands commas. */
export function parseAmount(input: string): number | null {
  const s = input.trim().replace(/,/g, '');
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n > 0 && Number.isSafeInteger(n) ? n : null;
}
