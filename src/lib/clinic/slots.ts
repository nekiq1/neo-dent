import type { Database } from "@/lib/clinic/types";
import { clinicToday, dowOf, fromMin, moscowNowMinutes, toMin } from "@/lib/clinic/time";

export type Slot = { time: string; free: boolean };

function overlaps(aStart: number, aDur: number, bStart: number, bDur: number): boolean {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

export function listSlots(
  db: Database,
  q: { doctorId: string; serviceSlug: string; date: string },
): Slot[] {
  const doctor = db.doctors.find((d) => d.id === q.doctorId);
  const service = db.services.find((s) => s.slug === q.serviceSlug);
  if (!doctor || !service) return [];
  if (!doctor.serviceSlugs.includes(service.slug)) return [];
  if (doctor.daysOff.includes(q.date)) return [];
  const today = clinicToday();
  if (q.date < today) return [];
  const shift = doctor.hours.find((h) => h.dow === dowOf(q.date));
  if (!shift) return [];

  const duration = service.durationMin;
  const start = toMin(shift.from);
  const end = toMin(shift.to);
  const nowMin = q.date === today ? moscowNowMinutes() + 60 : -1;
  const busy = db.appointments.filter(
    (a) => a.doctorId === doctor.id && a.date === q.date && a.status !== "cancelled",
  );

  const slots: Slot[] = [];
  for (let t = start; t + duration <= end; t += 30) {
    if (t < nowMin) continue;
    const free = !busy.some((a) => overlaps(t, duration, toMin(a.time), a.durationMin));
    slots.push({ time: fromMin(t), free });
  }
  return slots;
}

export function slotIsFree(
  db: Database,
  q: { doctorId: string; serviceSlug: string; date: string; time: string },
): boolean {
  return listSlots(db, q).some((s) => s.time === q.time && s.free);
}
