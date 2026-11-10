import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";

import { Crumbs } from "@/components/site/chrome";
import { rub } from "@/lib/clinic/format";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/prices")({
  head: () => ({
    meta: [
      { title: "Цены — NEO DENT" },
      { name: "description", content: "Ориентир цен NEO DENT. Точная смета — до начала лечения, не после." },
    ],
  }),
  component: PricesPage,
});

function PricesPage() {
  const { services } = rootApi.useLoaderData();
  return (
    <main className="shell py-10">
      <Crumbs items={[<span key="p">Цены</span>]} />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="display text-display">Цены, которые не прячут коронку в сноске</h1>
          <p className="mt-4 text-muted">
            Это ориентир. После осмотра цифра может сдвинуться — и мы говорим об этом до того, как включили
            бормашину. Консультация в день лечения повторно не тарифицируется у терапевта.
          </p>
        </div>
        <p className="text-sm text-muted lg:col-span-4 lg:col-start-9">
          Полное описание, противопоказания и этапы — на странице услуги. Запись подставит её в первый шаг.
        </p>
      </div>
      <div className="mt-12 space-y-12">
        {services.map((service) => (
          <section key={service.slug}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="display text-3xl">
                <Link to="/services/$slug" params={{ slug: service.slug }}>
                  {service.title}
                </Link>
              </h2>
              <Link to="/booking" search={{ service: service.slug }} className="text-sm text-primary">
                Записаться
              </Link>
            </div>
            <table className="mt-4 w-full text-left text-sm">
              <tbody>
                {service.prices.map((price) => (
                  <tr key={price.name} className="border-t border-line">
                    <th className="py-3 pr-4 font-normal">
                      {price.name}
                      {price.note ? <span className="mt-1 block text-muted">{price.note}</span> : null}
                    </th>
                    <td className="py-3 text-right align-top">{rub(price.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </main>
  );
}
