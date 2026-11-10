import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { createSeed } from "@/lib/clinic/seed";
import type { Database } from "@/lib/clinic/types";
import { SEED_VERSION } from "@/lib/clinic/types";

const FILE = process.env.DATA_FILE || join(process.cwd(), "data", "db.json");
const SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "";
const buckets = new Map<string, number[]>();

function resolvedPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (fromEnv.length >= 12) return fromEnv;
  if (process.env.NODE_ENV === "production") return null;
  return "neodent-preview";
}

function sessionSecret(): string {
  if (SECRET.length >= 16) return SECRET;
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (password.length >= 12) {
    return createHash("sha256").update(`neo-session:${password}`).digest("hex");
  }
  if (process.env.NODE_ENV === "production") return "";
  return "neodent-preview-session";
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const prev = (buckets.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  if (prev.length >= limit) {
    buckets.set(key, prev);
    return false;
  }
  prev.push(now);
  buckets.set(key, prev);
  if (buckets.size > 4000) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  return true;
}

let chain: Promise<unknown> = Promise.resolve();
let memory: Database | null = null;
let fsOk = true;

function lock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function writeAtomic(db: Database): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await rename(tmp, FILE);
}

function usable(value: unknown): value is Database {
  if (!value || typeof value !== "object") return false;
  const db = value as Database;
  return db.version === SEED_VERSION && Array.isArray(db.services) && Array.isArray(db.doctors);
}

async function load(): Promise<Database> {
  if (!fsOk && memory) return memory;
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!usable(parsed)) {
      const fresh = createSeed();
      await writeAtomic(fresh);
      memory = fresh;
      return fresh;
    }
    memory = parsed;
    return parsed;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    const fresh = memory ?? createSeed();
    if (code === "ENOENT") {
      try {
        await writeAtomic(fresh);
        fsOk = true;
      } catch {
        fsOk = false;
      }
      memory = fresh;
      return fresh;
    }
    if (code === "EACCES" || code === "EROFS" || code === "EPERM" || code === "ENOTSUP") {
      fsOk = false;
      memory = fresh;
      console.warn("[data] диск только для чтения, записи держатся в памяти процесса. На Railway смонтируйте том и задайте DATA_FILE.");
      return fresh;
    }
    try {
      await writeAtomic(fresh);
    } catch {
      fsOk = false;
    }
    memory = fresh;
    return fresh;
  }
}

export function readDb(): Promise<Database> {
  return lock(() => load());
}

export function updateDb<T>(mutator: (db: Database) => T | Promise<T>): Promise<T> {
  return lock(async () => {
    const db = await load();
    const result = await mutator(db);
    memory = db;
    if (fsOk) {
      try {
        await writeAtomic(db);
      } catch {
        fsOk = false;
      }
    }
    return result;
  });
}

export function passwordOk(input: string): boolean {
  const expected = resolvedPassword();
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected ?? randomBytes(32)).digest();
  const match = timingSafeEqual(a, b);
  return expected !== null && match;
}

export function makeSessionToken(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET не задан");
  const exp = String(Date.now() + 1000 * 60 * 60 * 12);
  const nonce = randomBytes(16).toString("hex");
  const body = `${exp}.${nonce}`;
  const sig = createHmac("sha256", secret).update(body).digest("hex");
  return `${body}.${sig}`;
}

export function sessionValid(token: string | undefined): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!exp || !nonce || !sig) return false;
  if (!/^\d{10,16}$/.test(exp) || !/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(sig)) return false;
  const expected = createHmac("sha256", secret).update(`${exp}.${nonce}`).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now();
}

export async function notifyBooking(text: string): Promise<{ telegram: boolean; vk: boolean }> {
  let telegram = false;
  let vk = false;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text }),
      });
      telegram = res.ok;
    } catch {
      telegram = false;
    }
  }
  const vkToken = process.env.VK_ACCESS_TOKEN;
  const peers = process.env.VK_PEER_IDS;
  const peer = peers?.split(",")[0]?.trim();
  if (vkToken && peer && !telegram) {
    try {
      const url = new URL("https://api.vk.com/method/messages.send");
      url.searchParams.set("access_token", vkToken);
      url.searchParams.set("v", "5.199");
      url.searchParams.set("peer_id", peer);
      url.searchParams.set("random_id", String(Date.now()));
      url.searchParams.set("message", text);
      const res = await fetch(url);
      vk = res.ok;
    } catch {
      vk = false;
    }
  }
  return { telegram, vk };
}
