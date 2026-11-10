import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { getAdmin, updateDoctor } from "@/lib/data/fns";
import { DOW_LONG } from "@/lib/clinic/time";
import type { WeekHours } from "@/lib/clinic/types";

export const Route = createFileRoute("/admin/schedule")({
  loader: () => getAdmin(),
  head: () => ({ meta: [{ title: "Расписание — кабинет NEO DENT" }] }),
  component: SchedulePage,
});

function SchedulePage() {
  const db = Route.useLoaderData();
  const router = useRouter();
  const [message, setMessage] = useState("");

  return (
    <main className="space-y-10">
      <h1 className="display text-display">Расписание</h1>
      <p className="text-sm text-muted">
        Часы врача закрывают лишние дни в календаре записи. Даты отпуска убирают конкретные числа, даже если
        день недели рабочий.
      </p>
      {db.doctors.map((doctor) => (
        <DoctorSchedule
          key={doctor.id}
          id={doctor.id}
          name={doctor.name}
          hours={doctor.hours}
          daysOff={doctor.daysOff}
          role={doctor.role}
          bio={doctor.bio}
          onSaved={(text) => {
            setMessage(text);
            void router.invalidate();
          }}
        />
      ))}
      {message ? <p className="text-sm">{message}</p> : null}
    </main>
  );
}

function DoctorSchedule({
  id,
  name,
  hours,
  daysOff,
  role,
  bio,
  onSaved,
}: {
  id: string;
  name: string;
  hours: WeekHours[];
  daysOff: string[];
  role: string;
  bio: string;
  onSaved: (text: string) => void;
}) {
  const [rows, setRows] = useState(() =>
    [1, 2, 3, 4, 5, 6, 0].map((dow) => {
      const found = hours.find((hour) => hour.dow === dow);
      return { dow, on: Boolean(found), from: found?.from ?? "09:00", to: found?.to ?? "18:00" };
    }),
  );
  const [off, setOff] = useState(daysOff.join("\n"));

  return (
    <form
      className="border border-line bg-surface p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const nextHours = rows.filter((row) => row.on).map(({ dow, from, to }) => ({ dow, from, to }));
        const nextOff = off
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean);
        void updateDoctor({ data: { id, role, bio, hours: nextHours, daysOff: nextOff } })
          .then(() => onSaved(`Сохранили график: ${name}`))
          .catch(() => onSaved("Не удалось сохранить график"));
      }}
    >
      <h2 className="text-xl">{name}</h2>
      <div className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <div key={row.dow} className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex min-w-36 items-center gap-2">
              <input
                type="checkbox"
                checked={row.on}
                onChange={(e) =>
                  setRows((current) =>
                    current.map((item, i) => (i === index ? { ...item, on: e.target.checked } : item)),
                  )
                }
              />
              {DOW_LONG[row.dow]}
            </label>
            <input
              className="field w-auto"
              type="time"
              value={row.from}
              onChange={(e) =>
                setRows((current) =>
                  current.map((item, i) => (i === index ? { ...item, from: e.target.value } : item)),
                )
              }
            />
            <input
              className="field w-auto"
              type="time"
              value={row.to}
              onChange={(e) =>
                setRows((current) =>
                  current.map((item, i) => (i === index ? { ...item, to: e.target.value } : item)),
                )
              }
            />
          </div>
        ))}
      </div>
      <label className="mt-4 block text-sm">
        Отпуск и разовые выходные, по дате в строке (ГГГГ-ММ-ДД)
        <textarea className="field mt-1" value={off} onChange={(e) => setOff(e.target.value)} />
      </label>
      <button className="btn btn-solid mt-3" type="submit">
        Сохранить график
      </button>
    </form>
  );
}
