import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { getAdmin, updateAppointment } from "@/lib/data/fns";
import { formatDay } from "@/lib/clinic/time";
import type { AppointmentStatus } from "@/lib/clinic/types";

export const Route = createFileRoute("/admin/appointments")({
  loader: () => getAdmin(),
  head: () => ({ meta: [{ title: "Записи — кабинет NEO DENT" }] }),
  component: AppointmentsPage,
});

const STATUSES: AppointmentStatus[] = ["new", "confirmed", "done", "cancelled", "moved"];

function AppointmentsPage() {
  const db = Route.useLoaderData();
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <main>
      <h1 className="display text-display">Записи</h1>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <ul className="mt-6 space-y-4">
        {db.appointments
          .slice()
          .reverse()
          .map((item) => {
            const service = db.services.find((s) => s.slug === item.serviceSlug);
            const doctor = db.doctors.find((d) => d.id === item.doctorId);
            return (
              <li key={item.id} className="border border-line bg-surface p-4 text-sm">
                <p className="font-semibold">
                  {item.number} · {item.status}
                </p>
                <p className="mt-1">
                  {formatDay(item.date)} {item.time} · {service?.title} · {doctor?.name}
                </p>
                <p className="text-muted">
                  {item.name}, {item.phone}, {item.email}
                  {item.comment ? ` · ${item.comment}` : ""}
                  {item.marketingConsent ? " · рассылка да" : " · рассылка нет"}
                </p>
                <form
                  className="mt-3 flex flex-wrap items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const status = String(form.get("status"));
                    const date = String(form.get("date") || "");
                    const time = String(form.get("time") || "");
                    setError("");
                    void updateAppointment({
                      data: {
                        id: item.id,
                        status: status as AppointmentStatus,
                        date: date || undefined,
                        time: time || undefined,
                      },
                    })
                      .then((result) => {
                        if (!result.ok) {
                          setError(result.error);
                          return;
                        }
                        return router.invalidate();
                      })
                      .catch(() => setError("Не удалось сохранить."));
                  }}
                >
                  <label>
                    Статус
                    <select className="field" name="status" defaultValue={item.status}>
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Дата
                    <input className="field" type="date" name="date" defaultValue={item.date} />
                  </label>
                  <label>
                    Время
                    <input className="field" type="time" name="time" defaultValue={item.time} />
                  </label>
                  <button className="btn btn-solid" type="submit">
                    Сохранить
                  </button>
                </form>
              </li>
            );
          })}
      </ul>
    </main>
  );
}
