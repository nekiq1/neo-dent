import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useState } from "react";

import { Crumbs } from "@/components/site/chrome";
import { ReviewCard } from "@/components/site/reviews";
import { submitReview } from "@/lib/data/fns";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Отзывы — NEO DENT" },
      { name: "description", content: "Отзывы пациентов NEO DENT с именами, датами и ответами клиники." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const catalog = rootApi.useLoaderData();
  const [rating, setRating] = useState<number | "all">("all");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [score, setScore] = useState(5);
  const [serviceSlug, setServiceSlug] = useState(catalog.services[0]?.slug ?? "");
  const [pd, setPd] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const visible = catalog.reviews.filter((review) => rating === "all" || review.rating === rating);
  const service = catalog.services.find((item) => item.slug === serviceSlug);
  const doctorId = service?.doctorIds[0] ?? "";

  return (
    <main className="shell py-10">
      <Crumbs items={[<span key="r">Отзывы</span>]} />
      <h1 className="display text-display">Отзывы</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Публикуем с именем и после модерации. «Всё понравилось» без деталей не проходит. Ответ клиники, если он
        есть, стоит под текстом.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", 5, 4, 3] as const).map((value) => (
          <button
            key={String(value)}
            type="button"
            className={`btn ${rating === value ? "btn-solid" : "btn-line"}`}
            onClick={() => setRating(value)}
          >
            {value === "all" ? "Все" : `${value} и эта оценка`}
          </button>
        ))}
      </div>
      <div className="mt-8 columns-1 gap-4 md:columns-2 lg:columns-3">
        {visible.map((review) => (
          <div key={review.id} className="mb-4">
            <ReviewCard review={review} catalog={catalog} />
          </div>
        ))}
      </div>

      <section className="mt-16 max-w-2xl border border-line bg-surface p-5">
        <h2 className="display text-3xl">Оставить отзыв</h2>
        <p className="mt-2 text-sm text-muted">Он появится на сайте после проверки, не сразу.</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!pd) {
              setMessage("Нужно согласие на обработку имени и текста отзыва.");
              return;
            }
            setPending(true);
            setMessage("");
            void submitReview({
              data: {
                name,
                text,
                rating: score,
                serviceSlug,
                doctorId,
                pdConsent: true,
              },
            })
              .then(() => {
                setMessage("Спасибо. Отзыв у модератора, на стену он попадёт после проверки.");
                setText("");
                setPd(false);
              })
              .catch(() => setMessage("Напишите чуть подробнее: нужно хотя бы несколько предложений."))
              .finally(() => setPending(false));
          }}
        >
          <label className="block text-sm">
            Имя
            <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="block text-sm">
            Услуга
            <select
              className="field mt-1"
              value={serviceSlug}
              onChange={(e) => setServiceSlug(e.target.value)}
            >
              {catalog.services.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Оценка
            <select
              className="field mt-1"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Текст
            <textarea className="field mt-1" value={text} onChange={(e) => setText(e.target.value)} required />
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-4" checked={pd} onChange={(e) => setPd(e.target.checked)} />
            <span>Согласен на публикацию имени и текста отзыва и обработку этих данных.</span>
          </label>
          <button className="btn btn-solid" type="submit" disabled={pending}>
            Отправить на модерацию
          </button>
          {message ? <p className="text-sm">{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
