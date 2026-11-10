import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { toCatalog } from "@/lib/clinic/query";
import { slotIsFree } from "@/lib/clinic/slots";
import { clinicToday } from "@/lib/clinic/time";
import type { AppointmentStatus, Database, Review, Service, WeekHours } from "@/lib/clinic/types";
import { CONSENT_VERSION } from "@/lib/clinic/types";

const COOKIE = "neo_admin";

async function gate() {
  const [{ getCookie }, { sessionValid }] = await Promise.all([
    import("@tanstack/react-start/server"),
    import("./repository.server"),
  ]);
  if (!sessionValid(getCookie(COOKIE))) {
    throw new Error("Нужна авторизация");
  }
}

async function meta() {
  const { getRequestHeader, getRequestIP } = await import("@tanstack/react-start/server");
  return {
    ip: getRequestIP({ xForwardedFor: true }) ?? "не определён",
    ua: (getRequestHeader("user-agent") ?? "").slice(0, 180),
  };
}

function plusDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function nextNumber(db: Database): string {
  const year = clinicToday().slice(0, 4);
  let max = 0;
  for (const item of db.appointments) {
    const match = /-(\d+)$/.exec(item.number);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `ND-${year}-${String(max + 1).padStart(4, "0")}`;
}

const bookingSchema = z.object({
  serviceSlug: z.string().regex(/^[a-z0-9-]{1,64}$/),
  doctorId: z.string().regex(/^[a-z0-9-]{1,64}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9+()\-\s]{10,22}$/),
  email: z.string().trim().max(120).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  comment: z.string().trim().max(500).optional().default(""),
  pdConsent: z.literal(true),
  marketingConsent: z.boolean(),
});

const reviewSchema = z.object({
  name: z.string().trim().min(2).max(80),
  text: z.string().trim().min(40).max(1200),
  rating: z.number().int().min(1).max(5),
  serviceSlug: z.string().regex(/^[a-z0-9-]{1,64}$/),
  doctorId: z.string().regex(/^[a-z0-9-]{1,64}$/),
  pdConsent: z.literal(true),
});

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { readDb } = await import("./repository.server");
  return toCatalog(await readDb());
});

export const getLegal = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (typeof slug !== "string" || slug.length > 40) throw new Error("Неизвестный документ");
    return slug;
  })
  .handler(async ({ data }) => {
    const { readDb } = await import("./repository.server");
    const db = await readDb();
    return db.legal.find((doc) => doc.slug === data) ?? null;
  });

export const getSlots = createServerFn({ method: "POST" })
  .validator((input: { doctorId: string; serviceSlug: string; date: string }) => {
    if (
      !input ||
      typeof input.doctorId !== "string" ||
      typeof input.serviceSlug !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.date ?? "")
    ) {
      throw new Error("Некорректный запрос времени");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { readDb } = await import("./repository.server");
    const { listSlots } = await import("@/lib/clinic/slots");
    const db = await readDb();
    return listSlots(db, data);
  });

export const createAppointment = createServerFn({ method: "POST" })
  .validator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data }) => {
    const { readDb, updateDb, notifyBooking, rateLimit } = await import("./repository.server");
    const info = await meta();
    if (!rateLimit(`book:${info.ip}`, 5, 60 * 60 * 1000) || !rateLimit("book:global", 40, 60 * 60 * 1000)) {
      return { ok: false as const, error: "Слишком много заявок с этого адреса. Позвоните в клинику." };
    }
    const db = await readDb();
    const service = db.services.find((item) => item.slug === data.serviceSlug);
    const doctor = db.doctors.find((item) => item.id === data.doctorId);
    if (!service || !doctor || !doctor.serviceSlugs.includes(service.slug)) {
      return { ok: false as const, error: "Этот врач не ведёт выбранную услугу." };
    }
    if (data.date < clinicToday() || data.date > plusDays(clinicToday(), 120)) {
      return { ok: false as const, error: "Эта дата недоступна для записи." };
    }
    const comment = data.comment.replace(/[<>]/g, "").replace(/\u0000/g, "");
    const saved = await updateDb((draft) => {
      if (!slotIsFree(draft, data)) return null;
      const id = crypto.randomUUID();
      const appointment = {
        id,
        number: nextNumber(draft),
        serviceSlug: data.serviceSlug,
        doctorId: data.doctorId,
        date: data.date,
        time: data.time,
        durationMin: service.durationMin,
        name: data.name,
        phone: data.phone,
        email: data.email,
        comment,
        status: "new" as const,
        marketingConsent: data.marketingConsent,
        createdAt: new Date().toISOString(),
      };
      draft.appointments.push(appointment);
      draft.consents.push(
        {
          id: crypto.randomUUID(),
          kind: "pd",
          accepted: true,
          version: CONSENT_VERSION,
          at: appointment.createdAt,
          ip: info.ip,
          userAgent: info.ua,
          appointmentId: id,
        },
        {
          id: crypto.randomUUID(),
          kind: "marketing",
          accepted: data.marketingConsent,
          version: CONSENT_VERSION,
          at: appointment.createdAt,
          ip: info.ip,
          userAgent: info.ua,
          appointmentId: id,
        },
      );
      return appointment;
    });
    if (!saved) {
      return { ok: false as const, error: "Это время только что заняли. Выберите другое." };
    }
    const text = [
      `Запись ${saved.number}`,
      `Услуга: ${service.title}`,
      `Врач: ${doctor.name}`,
      `Когда: ${saved.date} ${saved.time}`,
      `Имя: ${saved.name}`,
      `Телефон: ${saved.phone}`,
      saved.comment ? `Комментарий: ${saved.comment}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const notified = await notifyBooking(text);
    return { ok: true as const, number: saved.number, notified };
  });

export const submitReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data }) => {
    const { updateDb, rateLimit } = await import("./repository.server");
    const info = await meta();
    if (!rateLimit(`review:${info.ip}`, 3, 60 * 60 * 1000)) {
      throw new Error("Слишком много отзывов. Попробуйте позже.");
    }
    const rating = data.rating as Review["rating"];
    const name = data.name.replace(/[<>]/g, "");
    const text = data.text.replace(/[<>]/g, "");
    await updateDb((draft) => {
      const service = draft.services.find((s) => s.slug === data.serviceSlug);
      const doctor = draft.doctors.find((d) => d.id === data.doctorId);
      if (!service || !doctor || !doctor.serviceSlugs.includes(service.slug)) {
        throw new Error("Неизвестная услуга или врач");
      }
      draft.reviews.unshift({
        id: crypto.randomUUID(),
        name,
        rating,
        text,
        date: clinicToday(),
        serviceSlug: data.serviceSlug,
        doctorId: data.doctorId,
        status: "pending",
        verified: false,
        reply: "",
      });
      draft.consents.push({
        id: crypto.randomUUID(),
        kind: "pd",
        accepted: true,
        version: CONSENT_VERSION,
        at: new Date().toISOString(),
        ip: info.ip,
        userAgent: info.ua,
      });
    });
    return { ok: true as const };
  });

export const logCookie = createServerFn({ method: "POST" })
  .validator((input: { accepted: boolean }) => {
    if (!input || typeof input.accepted !== "boolean") throw new Error("Нет выбора");
    return input;
  })
  .handler(async ({ data }) => {
    const { updateDb, rateLimit } = await import("./repository.server");
    const info = await meta();
    if (!rateLimit(`cookie:${info.ip}`, 12, 60 * 60 * 1000)) return { ok: true as const };
    await updateDb((draft) => {
      draft.consents.push({
        id: crypto.randomUUID(),
        kind: "cookies",
        accepted: data.accepted,
        version: CONSENT_VERSION,
        at: new Date().toISOString(),
        ip: info.ip,
        userAgent: info.ua,
      });
    });
    return { ok: true as const };
  });

export const adminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { sessionValid } = await import("./repository.server");
  return { ok: sessionValid(getCookie(COOKIE)) };
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input: { password: string }) => {
    if (!input || typeof input.password !== "string" || input.password.length > 80) {
      throw new Error("Введите пароль");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { passwordOk, makeSessionToken, rateLimit } = await import("./repository.server");
    const info = await meta();
    if (!rateLimit(`login:${info.ip}`, 5, 15 * 60 * 1000) || !rateLimit("login:global", 30, 60 * 1000)) {
      return { ok: false as const };
    }
    if (!passwordOk(data.password)) return { ok: false as const };
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie(COOKIE, makeSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true as const };
});

export const getAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await gate();
  const { readDb } = await import("./repository.server");
  return readDb();
});

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "confirmed", "done", "cancelled", "moved"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const updateAppointment = createServerFn({ method: "POST" })
  .validator((input: unknown) => statusSchema.parse(input))
  .handler(async ({ data }) => {
    await gate();
    const { updateDb } = await import("./repository.server");
    const result = await updateDb((draft) => {
      const item = draft.appointments.find((a) => a.id === data.id);
      if (!item) return { ok: false as const, error: "Запись не найдена" };
      if (data.date && data.time && (data.date !== item.date || data.time !== item.time)) {
        const probe = draft.appointments.map((a) =>
          a.id === item.id ? { ...a, status: "cancelled" as const } : a,
        );
        const shadow: Database = { ...draft, appointments: probe };
        if (
          !slotIsFree(shadow, {
            doctorId: item.doctorId,
            serviceSlug: item.serviceSlug,
            date: data.date,
            time: data.time,
          })
        ) {
          return { ok: false as const, error: "Новое время уже занято" };
        }
        item.date = data.date;
        item.time = data.time;
        item.status = "moved";
      } else {
        item.status = data.status as AppointmentStatus;
      }
      return { ok: true as const };
    });
    return result;
  });

export const updateService = createServerFn({ method: "POST" })
  .validator((input: Service) => {
    if (!input || typeof input.slug !== "string" || !/^[a-z0-9-]{1,64}$/.test(input.slug)) {
      throw new Error("Некорректная услуга");
    }
    if (JSON.stringify(input).length > 80000) throw new Error("Слишком большой объём");
    if (typeof input.title !== "string" || input.title.length > 160) throw new Error("Заголовок");
    if (typeof input.body !== "string" || input.body.length > 20000) throw new Error("Описание");
    return input;
  })
  .handler(async ({ data }) => {
    await gate();
    const { updateDb } = await import("./repository.server");
    await updateDb((draft) => {
      const index = draft.services.findIndex((s) => s.slug === data.slug);
      if (index < 0) throw new Error("Услуга не найдена");
      draft.services[index] = data;
    });
    return { ok: true as const };
  });

export const updateDoctor = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      role: string;
      bio: string;
      hours: WeekHours[];
      daysOff: string[];
    }) => {
      if (!input || !/^[a-z0-9-]{1,64}$/.test(input.id ?? "")) throw new Error("Врач");
      if (typeof input.role !== "string" || input.role.length > 160) throw new Error("Роль");
      if (typeof input.bio !== "string" || input.bio.length > 4000) throw new Error("Биография");
      if (!Array.isArray(input.hours) || input.hours.length > 14) throw new Error("Часы");
      if (!Array.isArray(input.daysOff) || input.daysOff.length > 60) throw new Error("Отпуск");
      return input;
    },
  )
  .handler(async ({ data }) => {
    await gate();
    const { updateDb } = await import("./repository.server");
    await updateDb((draft) => {
      const doctor = draft.doctors.find((d) => d.id === data.id);
      if (!doctor) throw new Error("Врач не найден");
      doctor.role = data.role;
      doctor.bio = data.bio;
      doctor.hours = data.hours.filter(
        (h) =>
          Number.isInteger(h.dow) &&
          h.dow >= 0 &&
          h.dow <= 6 &&
          /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(h.from) &&
          /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(h.to) &&
          h.from < h.to,
      );
      doctor.daysOff = data.daysOff.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    });
    return { ok: true as const };
  });

export const moderateReview = createServerFn({ method: "POST" })
  .validator((input: { id: string; status: Review["status"]; reply: string; verified: boolean }) => {
    if (!input || typeof input.id !== "string" || input.id.length > 80) throw new Error("Отзыв");
    if (!["pending", "approved", "rejected"].includes(input.status)) throw new Error("Статус");
    if (typeof input.reply !== "string" || input.reply.length > 800) throw new Error("Ответ");
    if (typeof input.verified !== "boolean") throw new Error("Метка");
    return input;
  })
  .handler(async ({ data }) => {
    await gate();
    const { updateDb } = await import("./repository.server");
    await updateDb((draft) => {
      const review = draft.reviews.find((r) => r.id === data.id);
      if (!review) throw new Error("Отзыв не найден");
      review.status = data.status;
      review.reply = data.reply.slice(0, 800);
      review.verified = data.verified;
    });
    return { ok: true as const };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .validator((input: Database["settings"]) => {
    if (!input || typeof input !== "object") throw new Error("Настройки");
    const urlFields = ["telegram", "vk", "ceoUrl"] as const;
    for (const key of urlFields) {
      const value = input[key];
      if (typeof value !== "string" || value.length > 200) throw new Error("Ссылка");
      if (!value) continue;
      let url: URL;
      try {
        url = new URL(value);
      } catch {
        throw new Error("Ссылка");
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Ссылка");
    }
    if (typeof input.phoneHref === "string" && input.phoneHref && !input.phoneHref.startsWith("tel:")) {
      throw new Error("Телефон");
    }
    const blob = JSON.stringify(input);
    if (blob.length > 8000) throw new Error("Слишком большой объём");
    return input;
  })
  .handler(async ({ data }) => {
    await gate();
    const { updateDb } = await import("./repository.server");
    await updateDb((draft) => {
      draft.settings = data;
    });
    return { ok: true as const };
  });
