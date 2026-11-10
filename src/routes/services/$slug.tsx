import { createFileRoute, getRouteApi, Link, notFound } from "@tanstack/react-router";

import { Crumbs, Prose } from "@/components/site/chrome";
import { DoctorMini, ReviewCard } from "@/components/site/reviews";
import { rub } from "@/lib/clinic/format";
import { getCatalog } from "@/lib/data/fns";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const catalog = await getCatalog();
    const service = catalog.services.find((item) => item.slug === params.slug);
    if (!service) throw notFound();
    return service;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — NEO DENT` : "Услуга — NEO DENT" },
      { name: "description", content: loaderData?.excerpt ?? "" },
    ],
  }),
  component: ServicePage,
});

function ServicePage() {
  const service = Route.useLoaderData();
  const catalog = rootApi.useLoaderData();
  const doctors = catalog.doctors.filter((doctor) => service.doctorIds.includes(doctor.id));
  const related = catalog.services.filter((item) => service.related.includes(item.slug));
  const reviews = catalog.reviews.filter((review) => review.serviceSlug === service.slug);

  return (
    <main className="shell py-10">
      <Crumbs
        items={[
          <Link key="s" to="/services">Услуги</Link>,
          <span key="t">{service.title}</span>,
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-12">
        <article className="lg:col-span-7">
          <p className="eyebrow">{service.category}</p>
          <h1 className="display mt-3 text-display">{service.title}</h1>
          <p className="mt-4 text-lg text-muted">{service.excerpt}</p>
          <div className="mt-8">
            <Prose text={service.body} />
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <h2 className="display text-2xl">Показания</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                {service.indications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-bg-deep p-4 md:col-span-2">
              <h2 className="text-sm font-semibold">Когда не берёмся или переносим</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                {service.contraindications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <h2 className="display mt-12 text-2xl">Как проходит</h2>
          <ol className="mt-4">
            {service.steps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-12 gap-3 border-t border-line py-4">
                <span className="display col-span-2 text-xl text-accent md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="col-span-10 md:col-span-11">
                  <h3>{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <h2 className="display mt-12 text-2xl">Результат и срок</h2>
          <p className="mt-3 leading-relaxed">{service.result}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{service.lifespan}</p>
        </article>
        <aside className="h-fit border border-line bg-surface p-5 lg:sticky lg:top-24 lg:col-span-5">
          <p className="text-sm text-muted">Ориентир</p>
          <p className="display text-4xl">от {rub(service.priceFrom)}</p>
          <p className="mt-1 text-sm text-muted">Визит около {service.durationMin} минут</p>
          <ul className="mt-5 divide-y divide-line text-sm">
            {service.prices.map((price) => (
              <li key={price.name} className="flex items-baseline justify-between gap-3 py-2">
                <span>
                  {price.name}
                  {price.note ? <span className="block text-muted">{price.note}</span> : null}
                </span>
                <span className="shrink-0">{rub(price.price)}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/booking"
            search={{ service: service.slug }}
            className="btn btn-solid mt-6 w-full"
          >
            Записаться на {service.title.toLowerCase()}
          </Link>
          <p className="mt-4 text-sm text-muted">Врачи</p>
          <div className="mt-2 space-y-2">
            {doctors.map((doctor) => (
              <DoctorMini key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="display text-2xl">Рядом по смыслу</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link to="/services/$slug" params={{ slug: item.slug }} className="block border border-line p-4">
                  <span className="text-sm text-muted">{item.category}</span>
                  <span className="mt-1 block text-lg">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-16">
        <h2 className="display text-2xl">Отзывы по этой услуге</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Пока нет опубликованных отзывов именно об этой услуге.</p>
        ) : (
          <div className="mt-4 columns-1 gap-4 md:columns-2">
            {reviews.map((review) => (
              <div key={review.id} className="mb-4">
                <ReviewCard review={review} catalog={catalog} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="display text-2xl">Вопросы</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {service.faq.map((item) => (
            <details key={item.q} className="py-3">
              <summary className="cursor-pointer text-base">{item.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
