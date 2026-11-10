import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getAdmin, updateDoctor } from "@/lib/data/fns";

export const Route = createFileRoute("/admin/doctors")({
  loader: () => getAdmin(),
  head: () => ({ meta: [{ title: "Врачи — кабинет NEO DENT" }] }),
  component: DoctorsAdmin,
});

function DoctorsAdmin() {
  const db = Route.useLoaderData();
  const router = useRouter();
  const [id, setId] = useState(db.doctors[0]?.id ?? "");
  const doctor = db.doctors.find((item) => item.id === id) ?? db.doctors[0];
  const [role, setRole] = useState(doctor?.role ?? "");
  const [bio, setBio] = useState(doctor?.bio ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const next = db.doctors.find((item) => item.id === id);
    if (!next) return;
    setRole(next.role);
    setBio(next.bio);
  }, [db.doctors, id]);

  if (!doctor) return null;

  return (
    <main>
      <h1 className="display text-display">Врачи</h1>
      <p className="mt-2 text-sm text-muted">Часы и отпуск правятся в расписании. Здесь — роль и текст о враче.</p>
      <label className="mt-4 block text-sm">
        Врач
        <select className="field mt-1" value={id} onChange={(e) => setId(e.target.value)}>
          {db.doctors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void updateDoctor({
            data: { id: doctor.id, role, bio, hours: doctor.hours, daysOff: doctor.daysOff },
          })
            .then(() => {
              setMessage("Сохранили");
              return router.invalidate();
            })
            .catch(() => setMessage("Не удалось сохранить"));
        }}
      >
        <label className="block text-sm">
          Роль
          <input className="field mt-1" value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <label className="block text-sm">
          О враче
          <textarea className="field mt-1" value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <button className="btn btn-solid" type="submit">
          Сохранить
        </button>
        {message ? <p className="text-sm">{message}</p> : null}
      </form>
    </main>
  );
}
