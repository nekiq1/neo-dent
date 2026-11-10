import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";

import { Crumbs } from "@/components/site/chrome";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Контакты — NEO DENT" },
      { name: "description", content: "NEO DENT на Среднем проспекте Васильевского острова: телефон, часы, как дойти." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { settings } = rootApi.useLoaderData();
  return (
    <main className="shell py-10">
      <Crumbs items={[<span key="c">Контакты</span>]} />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">Васильевский остров</p>
          <h1 className="display mt-3 text-display">Контакты</h1>
          <p className="mt-6 text-lg">{settings.address}</p>
          <p className="mt-2 text-muted">{settings.metro}</p>
          <p className="mt-6">
            <a className="display text-3xl" href={settings.phoneHref}>
              {settings.phone}
            </a>
          </p>
          <p className="mt-2">
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </p>
          <p className="mt-4 text-sm text-ink">{settings.hours}</p>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            От метро «Василеостровская» по Среднему проспекту в сторону Тучкова моста. Если опаздываете больше
            чем на десять минут, наберите: следующий пациент не должен ждать из-за чужой задержки.
          </p>
          <Link to="/booking" className="btn btn-solid mt-8">
            Записаться
          </Link>
        </div>
        <figure className="lg:col-span-6 lg:col-start-7">
          <img
            src="/media/street.jpg"
            alt="Средний проспект Васильевского острова"
            width={1200}
            height={1600}
            className="aspect-3/4 w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-3 text-sm text-muted">
            {settings.address}. Карту стороннего сервиса не встраиваем — адреса достаточно для такси и 2ГИС.
          </figcaption>
        </figure>
      </div>
    </main>
  );
}
