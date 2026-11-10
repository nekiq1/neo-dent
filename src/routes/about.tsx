import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";

import { Crumbs } from "@/components/site/chrome";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О клинике — NEO DENT" },
      {
        name: "description",
        content: "Сеть «NEO DENT» в Санкт-Петербурге: Средний проспект В.О., 36/40, с 2007 года.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { settings, doctors } = rootApi.useLoaderData();
  const chief = doctors.find((doctor) => doctor.id === "pismyanik");
  return (
    <main className="shell py-10">
      <Crumbs items={[<span key="a">О клинике</span>]} />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow">Васильевский остров</p>
          <h1 className="display mt-3 text-display">Кабинет на Среднем, не сеть с одинаковыми холлами</h1>
          <div className="mt-6 space-y-4 leading-relaxed">
            <p>
              NEO DENT принимает на Среднем проспекте Васильевского острова, {settings.metro.toLowerCase()},{" "}
              {settings.hours.toLowerCase()}. Без ночного стационара и без обещания «любой врач в любую минуту».
            </p>
            <p>
              Главный врач — {chief?.name}, ортопед. Терапию и детский приём ведёт Кира Волгина,
              импланты — Глеб Рыбаков, элайнеры — Ева Сазонова. Карта не пересказывается «ещё одной смене»,
              если врач в этот день не ваш.
            </p>
            <p>
              На первом визите, если ничего не болит, вас не обязаны лечить в тот же час. Список работ и вилка
              цены уходят с вами. Лечение начинается, когда есть отдельная запись и понятная смета.
            </p>
            <p>
              Юридически это {settings.legalName}, ИНН {settings.inn}, ОГРН {settings.ogrn}. Лицензия и реквизиты
              продублированы внизу каждой страницы и в сведениях об организации.
            </p>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-5 lg:col-start-8">
          <img src="/media/room.jpg" alt="Кабинет лечения" width={1728} height={1152} className="w-full rounded-2xl object-cover" />
          <img
            src="/media/street.jpg"
            alt="Фасад на Васильевском острове"
            width={1200}
            height={1600}
            className="aspect-3/4 w-full rounded-2xl object-cover"
          />
        </div>
      </div>
      <dl className="mt-14 grid gap-6 border-t border-line pt-8 md:grid-cols-3">
        <div>
          <dt className="text-sm text-muted">Лицензия</dt>
          <dd className="mt-1">{settings.license}</dd>
          <dd className="text-sm text-muted">{settings.licenseBy}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Адрес</dt>
          <dd className="mt-1">{settings.address}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Связь</dt>
          <dd className="mt-1">
            <a href={settings.phoneHref}>{settings.phone}</a>
            <br />
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </dd>
        </div>
      </dl>
      <Link to="/contacts" className="btn btn-line mt-8">
        Как дойти
      </Link>
    </main>
  );
}
