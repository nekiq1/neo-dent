import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";

import { Crumbs } from "@/components/site/chrome";
import { rub } from "@/lib/clinic/format";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Услуги — NEO DENT" },
      {
        name: "description",
        content: "Гигиена, лечение кариеса, виниры, имплантация и элайнеры в NEO DENT на Васильевском острове.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { services } = rootApi.useLoaderData();
  return (
    <main className="shell py-10">
      <Crumbs items={[<span key="s">Услуги</span>]} />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="display text-display">Услуги</h1>
          <p className="mt-4 text-muted">
            Каждая карточка — отдельная страница: кому подходит, кому нет, этапы, цены и врачи. Запись
            открывается с уже выбранной услугой.
          </p>
        </div>
        <img
          src="/media/room.jpg"
          alt="Кабинет приёма: дуб, дневной свет, без больничного белого"
          width={1728}
          height={1152}
          className="aspect-video w-full object-cover lg:col-span-7"
        />
      </div>
      <ul className="mt-12">
        {services.map((service) => (
          <li key={service.slug} className="border-t border-line py-8">
            <div className="grid gap-4 lg:grid-cols-12">
              <p className="text-sm text-muted lg:col-span-3">{service.category}</p>
              <div className="lg:col-span-6">
                <h2 className="display text-3xl">
                  <Link to="/services/$slug" params={{ slug: service.slug }}>
                    {service.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{service.excerpt}</p>
              </div>
              <div className="lg:col-span-3 lg:text-right">
                <p>от {rub(service.priceFrom)}</p>
                <p className="text-sm text-muted">{service.durationMin} минут на визит</p>
                <Link to="/services/$slug" params={{ slug: service.slug }} className="btn btn-quiet mt-2">
                  Подробнее
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
