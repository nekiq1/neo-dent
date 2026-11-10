import { createFileRoute, getRouteApi, Link, notFound } from "@tanstack/react-router";

import { Crumbs } from "@/components/site/chrome";
import { ReviewCard } from "@/components/site/reviews";
import { getCatalog } from "@/lib/data/fns";
import { DOW_LONG } from "@/lib/clinic/time";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/doctors/$slug")({
  loader: async ({ params }) => {
    const catalog = await getCatalog();
    const doctor = catalog.doctors.find((item) => item.slug === params.slug);
    if (!doctor) throw notFound();
    return doctor;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — NEO DENT` : "Врач — NEO DENT" },
      { name: "description", content: loaderData?.bio.slice(0, 180) ?? "" },
    ],
  }),
  component: DoctorPage,
});

function DoctorPage() {
  const doctor = Route.useLoaderData();
  const catalog = rootApi.useLoaderData();
  const services = catalog.services.filter((service) => doctor.serviceSlugs.includes(service.slug));
  const reviews = catalog.reviews.filter((review) => review.doctorId === doctor.id);
  const primary = services[0];

  return (
    <main className="shell py-10">
      <Crumbs
        items={[
          <Link key="d" to="/doctors">Врачи</Link>,
          <span key="n">{doctor.name}</span>,
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow">Стаж {doctor.experienceYears} лет</p>
          <h1 className="display mt-3 text-display">{doctor.name}</h1>
          <p className="mt-2 text-lg text-muted">{doctor.role}</p>
          <p className="mt-6 max-w-2xl leading-relaxed">{doctor.bio}</p>
          <h2 className="mt-10 text-sm font-semibold">Образование</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {doctor.education.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <aside className="border border-line bg-surface p-5 lg:col-span-4">
          <p className="display text-4xl">{doctor.initials}</p>
          <h2 className="mt-6 text-sm font-semibold">Когда принимает</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {doctor.hours.map((hour) => (
              <li key={hour.dow}>
                {DOW_LONG[hour.dow]} {hour.from}–{hour.to}
              </li>
            ))}
          </ul>
          {doctor.daysOff.length > 0 ? (
            <p className="mt-3 text-sm text-muted">Не принимает: {doctor.daysOff.join(", ")}</p>
          ) : null}
          {primary ? (
            <Link
              to="/booking"
              search={{ service: primary.slug, doctor: doctor.id }}
              className="btn btn-solid mt-6 w-full"
            >
              Записаться к врачу
            </Link>
          ) : null}
        </aside>
      </div>
      <section className="mt-12">
        <h2 className="display text-2xl">Что ведёт</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug}>
              <Link to="/services/$slug" params={{ slug: service.slug }} className="block border border-line p-4">
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-12">
        <h2 className="display text-2xl">Отзывы</h2>
        <div className="mt-4 columns-1 gap-4 md:columns-2">
          {reviews.map((review) => (
            <div key={review.id} className="mb-4">
              <ReviewCard review={review} catalog={catalog} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
