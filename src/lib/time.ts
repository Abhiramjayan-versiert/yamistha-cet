/* Times in the content file are written in Indian Standard Time (UTC+05:30). */
export function parseIst(value?: string): number | null {
  if (!value) return null;
  const t = Date.parse(`${value.length === 16 ? `${value}:00` : value}+05:30`);
  return Number.isNaN(t) ? null : t;
}
