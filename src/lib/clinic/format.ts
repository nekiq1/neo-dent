export function rub(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

/** Only http(s), mailto and tel. Blocks javascript: and protocol-relative links. */
export function safeHref(value: string | undefined, fallback = "#"): string {
  if (!value) return fallback;
  const raw = value.trim();
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
    if (url.protocol === "mailto:" && url.pathname.includes("@")) return url.toString();
    if (url.protocol === "tel:" && /^[0-9+().\-\s]{6,22}$/.test(url.pathname)) return url.toString();
  } catch {
    return fallback;
  }
  return fallback;
}
