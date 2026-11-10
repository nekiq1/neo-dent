import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";

import { Crumbs } from "@/components/site/chrome";
import { DOW_SHORT } from "@/lib/clinic/time";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/doctors/")({
  head: () => ({
    meta: [
      { title: "Врачи — NEO DENT" },
      { name: "description", content: "Илья Нестеров, Кира Волгина, Глеб Рыбаков и Ева Сазонова — врачи «NEO DENT»." },
    ],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const { doctors, services } = rootApi.useLoaderData();
  return (
    <main className="shell py-10">
      <Crumbs items={[<span key="d">Врачи</span>]} />
      <h1 className="display max-w-2xl text-display">Четверо врачей, у каждого своё окно</h1>
      <p className="mt-4 max-w-2xl text-muted">
        График на сайте совпадает с тем, что видит запись. Отпуск и выходной закрывают слоты, а не висят
        мелкой сноской.
      </p>
      <ul className="mt-12 space-y-12">
        {doctors.map((doctor, index) => (
          <li key={doctor.id} className="grid gap-6 border-t border-line pt-8 lg:grid-cols-12">
            <p className="display text-5xl text-accent lg:col-span-2">{String(index + 1).padStart(2, "0")}</p>
            <div className="lg:col-span-6">
              <h2 className="display text-4xl">
                <Link to="/doctors/$slug" params={{ slug: doctor.slug }}>
                  {doctor.name}
                </Link>
              </h2>
              <p className="mt-2 text-muted">{doctor.role}</p>
              <p className="mt-4 leading-relaxed">{doctor.bio}</p>
              <p className="mt-4 text-sm">
                {doctor.serviceSlugs
                  .map((slug) => services.find((service) => service.slug === slug)?.title)
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="text-sm lg:col-span-4">
              <p className="font-semibold">Приём</p>
              <ul className="mt-2 space-y-1 text-muted">
                {doctor.hours.map((hour) => (
                  <li key={`${doctor.id}-${hour.dow}`}>
                    {DOW_SHORT[hour.dow]} {hour.from}–{hour.to}
                  </li>
                ))}
              </ul>
              <Link to="/doctors/$slug" params={{ slug: doctor.slug }} className="btn btn-line mt-5">
                Карточка врача
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
