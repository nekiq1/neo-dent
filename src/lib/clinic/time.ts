const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export const DOW_SHORT = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"] as const;
export const DOW_LONG = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
] as const;

export function clinicToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(n: number): string {
  const [y, m, d] = clinicToday().split("-").map(Number);
  const utc = new Date(Date.UTC(y!, (m ?? 1) - 1, (d ?? 1) + n));
  return utc.toISOString().slice(0, 10);
}

export function dowOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1)).getUTCDay();
}

export function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function fromMin(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function moscowNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const month = MONTHS[(m ?? 1) - 1] ?? "";
  return `${d} ${month} ${y}`;
}

export function nextDow(dow: number, minAhead: number): string {
  for (let i = minAhead; i < 40; i += 1) {
    const iso = addDays(i);
    if (dowOf(iso) === dow) return iso;
  }
  return addDays(minAhead);
}

export function prevDow(dow: number): string {
  for (let i = 1; i < 21; i += 1) {
    const iso = addDays(-i);
    if (dowOf(iso) === dow) return iso;
  }
  return addDays(-1);
}
