import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useRef } from "react";

import { ReviewCard } from "@/components/site/reviews";
import { CountUp, Reveal } from "@/components/site/motion";
import { rub } from "@/lib/clinic/format";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/")({
  component: Home,
});

const FACTS = [
  { value: 20, suffix: "", label: "лет сети, первая клиника — 2007" },
  { value: 61140, suffix: "", label: "имплантатов установили" },
  { value: 75483, suffix: "", label: "коронок изготовили" },
  { value: 15794, suffix: "", label: "зуба сохранили от удаления" },
];

const PATH = [
  { n: "01", title: "Осмотр", text: "Слушаем, смотрим, не лечим «заодно», если вы пришли только познакомиться." },
  { n: "02", title: "Снимок", text: "Прицельный — по показаниям. КТ — хирургу и ортодонту, не каждому визиту." },
  { n: "03", title: "Смета", text: "Вилка цены уходит с вами. Точная смета — до начала, не после чека." },
  { n: "04", title: "Работа", text: "Отдельный слот. Занятое время второму пациенту не отдаём." },
];

function Home() {
  const catalog = rootApi.useLoaderData();
  const scroller = useRef<HTMLDivElement>(null);
  const featured = catalog.services.find((item) => item.slug === "implantaciya") ?? catalog.services[0];
  const rest = catalog.services.filter((item) => item.slug !== featured?.slug);
  const reviews = catalog.reviews;
  const maxPrice = Math.max(...catalog.services.map((item) => item.priceFrom));

  return (
    <main>
      <section className="shell grid items-end gap-10 pb-6 pt-8 lg:grid-cols-12 lg:pt-12">
        <div className="lg:col-span-6 lg:pb-4">
          <p className="eyebrow">Санкт-Петербург · Васильевский остров</p>
          <h1 className="display mt-4 text-hero">Стоматология, в которой смета приходит раньше бормашины.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            NEO DENT на Среднем проспекте — у метро Василеостровская. Терапия, детский приём, виниры, импланты и
            элайнеры. Смету присылаем до визита, занятое время второму пациенту не отдаём.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/booking" className="btn btn-solid">
              Записаться
            </Link>
            <Link to="/prices" className="btn btn-line">
              Смотреть цены
            </Link>
          </div>
          <p className="mt-6 text-sm text-ink">
            {catalog.settings.metro}. {catalog.settings.hours}. {catalog.settings.phone}.
          </p>
        </div>
        <figure className="lg:col-span-6">
          <img
            src="/media/reception.jpg"
            alt="Ресепшен клиники «NEO DENT»"
            width={1792}
            height={1008}
            className="aspect-video w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-3 flex justify-between gap-4 text-sm text-muted">
            <span>Средний проспект В.О., 36/40</span>
            <span>{catalog.settings.hours}</span>
          </figcaption>
        </figure>
      </section>

      <section className="shell pb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact, index) => (
            <Reveal key={fact.label} delay={index * 80} className="rounded-2xl border border-line bg-surface px-4 py-5">
              <p className="display text-3xl text-primary">
                <CountUp to={fact.value} suffix={fact.suffix} />
              </p>
              <p className="mt-2 text-sm leading-snug text-ink">{fact.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell py-16 lg:py-20">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Как устроен визит</p>
            <h2 className="display mt-3 text-display">Четыре шага, без «пока вы здесь — давайте ещё»</h2>
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {PATH.map((step, index) => (
              <Reveal key={step.n} delay={index * 90}>
                <li className="h-full rounded-2xl bg-bg-deep/70 p-5">
                  <p className="display text-2xl text-accent">{step.n}</p>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="shell grid gap-10 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-5">
            <p className="eyebrow">Услуги</p>
            <h2 className="display mt-3 text-display">Пять направлений, на которые можно записаться отсюда</h2>
            <p className="mt-4 text-muted">
              Не прайс на сорок строк «для объёма». Ниже то, что есть в расписании. Остальное скажем на осмотре,
              если оно вам нужно.
            </p>
            <div className="mt-8 space-y-4">
              {catalog.services.map((service) => (
                <div key={service.slug}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span>{service.title}</span>
                    <span className="text-muted">от {rub(service.priceFrom)}</span>
                  </div>
                  <div className="stat-bar" aria-hidden="true">
                    <span style={{ ["--w" as string]: `${Math.max(12, (service.priceFrom / maxPrice) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Полоски — ориентир «от», не длительность лечения.</p>
          </div>
          {featured ? (
            <Link to="/services/$slug" params={{ slug: featured.slug }} className="group block lg:col-span-7">
              <img
                src="/media/crown.jpg"
                alt="Керамическая коронка"
                width={1600}
                height={1200}
                className="aspect-video w-full rounded-2xl object-cover"
              />
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">{featured.category}</p>
                  <h3 className="display text-3xl transition-colors group-hover:text-primary">{featured.title}</h3>
                </div>
                <p className="text-sm">от {rub(featured.priceFrom)}</p>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{featured.excerpt}</p>
            </Link>
          ) : null}
        </div>
        <div className="shell pb-12">
          <ol className="border-t border-line">
            {rest.map((service, index) => (
              <li key={service.slug} className="border-b border-line">
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="grid gap-2 py-5 transition-colors hover:text-primary md:grid-cols-12 md:items-baseline"
                >
                  <span className="display text-xl text-accent md:col-span-1">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <span className="text-ink md:col-span-3">{service.category}</span>
                  <span className="display text-2xl md:col-span-5">{service.title}</span>
                  <span className="text-sm text-muted md:col-span-3 md:text-right">от {rub(service.priceFrom)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Врачи</p>
            <h2 className="display mt-3 text-display">Кто принимает на Среднем</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Ортопед не ставит имплант между коронками, хирург не «подлечит кариес заодно», ортодонт не обещает
              капы там, где они не сработают. Детский приём — у терапевта.
            </p>
            <Link to="/doctors" className="btn btn-line mt-6">
              Все врачи
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {catalog.doctors.map((doctor, index) => (
              <li key={doctor.id}>
                <Reveal delay={index * 70}>
                  <Link
                    to="/doctors/$slug"
                    params={{ slug: doctor.slug }}
                    className="grid h-full gap-3 rounded-2xl border border-line bg-surface p-4 transition-transform hover:-translate-y-0.5 sm:grid-cols-12 sm:items-center"
                  >
                    <span className="display grid size-14 place-items-center rounded-full bg-primary text-lg text-on-primary sm:col-span-3">
                      {doctor.initials}
                    </span>
                    <span className="sm:col-span-9">
                      <span className="block text-lg">{doctor.name}</span>
                      <span className="text-sm text-muted">{doctor.role}</span>
                      <span className="mt-1 block text-sm text-ink">{doctor.experienceYears} лет практики</span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bg-deep/80 py-16">
        <div className="shell">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Отзывы</p>
              <h2 className="display mt-2 text-display">С именами, не «аноним, всё понравилось»</h2>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                className="btn btn-line px-3"
                onClick={() => scroller.current?.scrollBy({ left: -320, behavior: "smooth" })}
              >
                Назад
              </button>
              <button
                type="button"
                className="btn btn-line px-3"
                onClick={() => scroller.current?.scrollBy({ left: 320, behavior: "smooth" })}
              >
                Дальше
              </button>
            </div>
          </div>
          <div ref={scroller} className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2">
            {reviews.slice(0, 8).map((review) => (
              <div key={review.id} className="w-72 shrink-0 snap-start">
                <ReviewCard review={review} catalog={catalog} />
              </div>
            ))}
          </div>
          <div className="mt-8 columns-1 gap-4 md:columns-2 lg:columns-3">
            {reviews.map((review) => (
              <div key={review.id} className="mb-4 break-inside-avoid">
                <ReviewCard review={review} catalog={catalog} />
              </div>
            ))}
          </div>
          <Link to="/reviews" className="btn btn-quiet mt-2">
            Все отзывы и фильтр →
          </Link>
        </div>
      </section>

      <section className="shell grid items-center gap-8 py-16 lg:grid-cols-12">
        <img
          src="/media/street.jpg"
          alt="Улица у клиники на Васильевском острове"
          width={1200}
          height={1600}
          className="aspect-3/4 w-full rounded-2xl object-cover lg:col-span-5"
        />
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="eyebrow">Как добраться</p>
          <h2 className="display mt-3 text-display">Средний, 36/40. От Василеостровской пешком.</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Вход с проспекта, второй этаж. Если опаздываете больше чем на десять минут, наберите: следующий
            человек не должен ждать из-за чужой задержки.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contacts" className="btn btn-line">
              Контакты
            </Link>
            <Link to="/booking" className="btn btn-solid">
              Выбрать время
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
