import { createFileRoute, Link } from "@tanstack/react-router";

import { getAdmin } from "@/lib/data/fns";
import { clinicToday, formatDay } from "@/lib/clinic/time";

export const Route = createFileRoute("/admin/")({
  loader: () => getAdmin(),
  head: () => ({ meta: [{ title: "Сводка — кабинет NEO DENT" }] }),
  component: Dashboard,
});

function Dashboard() {
  const db = Route.useLoaderData();
  const today = clinicToday();
  const fresh = db.appointments.filter((item) => item.status === "new");
  const todayItems = db.appointments.filter((item) => item.date === today && item.status !== "cancelled");
  const pending = db.reviews.filter((item) => item.status === "pending");
  return (
    <main>
      <h1 className="display text-display">Сводка</h1>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="bg-bg-deep p-4">
          <dt className="text-sm text-muted">Новые заявки</dt>
          <dd className="display text-4xl">{fresh.length}</dd>
        </div>
        <div className="border border-line p-4 sm:col-span-1">
          <dt className="text-sm text-muted">Сегодня, {formatDay(today)}</dt>
          <dd className="display text-4xl">{todayItems.length}</dd>
        </div>
        <div className="border border-line p-4">
          <dt className="text-sm text-muted">Отзывы на модерации</dt>
          <dd className="display text-4xl">{pending.length}</dd>
        </div>
      </dl>
      <h2 className="mt-10 text-lg">Ближайшие записи</h2>
      <ul className="mt-3 divide-y divide-line">
        {db.appointments
          .filter((item) => item.status !== "cancelled" && item.date >= today)
          .slice(0, 6)
          .map((item) => {
            const service = db.services.find((s) => s.slug === item.serviceSlug);
            const doctor = db.doctors.find((d) => d.id === item.doctorId);
            return (
              <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span>
                  {item.number} · {formatDay(item.date)} {item.time}
                  <span className="block text-muted">
                    {item.name} · {service?.title} · {doctor?.name}
                  </span>
                </span>
                <span>{item.status}</span>
              </li>
            );
          })}
      </ul>
      <Link to="/admin/appointments" className="btn btn-line mt-4">
        Все записи
      </Link>
    </main>
  );
}
