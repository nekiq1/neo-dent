import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getAdmin, updateService } from "@/lib/data/fns";
import type { Service } from "@/lib/clinic/types";

export const Route = createFileRoute("/admin/services")({
  loader: () => getAdmin(),
  head: () => ({ meta: [{ title: "Услуги — кабинет NEO DENT" }] }),
  component: ServicesAdmin,
});

function ServicesAdmin() {
  const db = Route.useLoaderData();
  const router = useRouter();
  const [slug, setSlug] = useState(db.services[0]?.slug ?? "");
  const current = db.services.find((service) => service.slug === slug) ?? db.services[0];
  const [draft, setDraft] = useState<Service | undefined>(current);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft(db.services.find((service) => service.slug === slug));
  }, [db.services, slug]);

  if (!draft) return null;

  function patch(partial: Partial<Service>) {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  return (
    <main>
      <h1 className="display text-display">Услуги</h1>
      <label className="mt-4 block text-sm">
        Карточка
        <select className="field mt-1" value={slug} onChange={(e) => setSlug(e.target.value)}>
          {db.services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.title}
            </option>
          ))}
        </select>
      </label>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void updateService({ data: draft })
            .then(() => {
              setMessage("Сохранили услугу");
              return router.invalidate();
            })
            .catch(() => setMessage("Не удалось сохранить"));
        }}
      >
        <label className="block text-sm">
          Кратко для админки и карточек
          <textarea className="field mt-1" value={draft.summary} onChange={(e) => patch({ summary: e.target.value })} />
        </label>
        <label className="block text-sm">
          Короткий абзац на сайт
          <textarea className="field mt-1" value={draft.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} />
        </label>
        <label className="block text-sm">
          Полное описание
          <textarea className="field mt-1 min-h-64" value={draft.body} onChange={(e) => patch({ body: e.target.value })} />
        </label>
        <label className="block text-sm">
          Показания, по строке
          <textarea
            className="field mt-1"
            value={draft.indications.join("\n")}
            onChange={(e) => patch({ indications: e.target.value.split("\n").filter(Boolean) })}
          />
        </label>
        <label className="block text-sm">
          Противопоказания, по строке
          <textarea
            className="field mt-1"
            value={draft.contraindications.join("\n")}
            onChange={(e) => patch({ contraindications: e.target.value.split("\n").filter(Boolean) })}
          />
        </label>
        {draft.steps.map((step, index) => (
          <div key={`${draft.slug}-step-${index}`} className="grid gap-2 md:grid-cols-4">
            <input
              className="field md:col-span-1"
              value={step.title}
              onChange={(e) => {
                const steps = draft.steps.map((item, i) => (i === index ? { ...item, title: e.target.value } : item));
                patch({ steps });
              }}
            />
            <textarea
              className="field md:col-span-3"
              value={step.text}
              onChange={(e) => {
                const steps = draft.steps.map((item, i) => (i === index ? { ...item, text: e.target.value } : item));
                patch({ steps });
              }}
            />
          </div>
        ))}
        <label className="block text-sm">
          Результат
          <textarea className="field mt-1" value={draft.result} onChange={(e) => patch({ result: e.target.value })} />
        </label>
        <label className="block text-sm">
          Срок службы
          <textarea className="field mt-1" value={draft.lifespan} onChange={(e) => patch({ lifespan: e.target.value })} />
        </label>
        {draft.faq.map((item, index) => (
          <div key={`${draft.slug}-faq-${index}`} className="space-y-2">
            <input
              className="field"
              value={item.q}
              onChange={(e) => {
                const faq = draft.faq.map((faqItem, i) => (i === index ? { ...faqItem, q: e.target.value } : faqItem));
                patch({ faq });
              }}
            />
            <textarea
              className="field"
              value={item.a}
              onChange={(e) => {
                const faq = draft.faq.map((faqItem, i) => (i === index ? { ...faqItem, a: e.target.value } : faqItem));
                patch({ faq });
              }}
            />
          </div>
        ))}
        <button className="btn btn-solid" type="submit">
          Сохранить услугу
        </button>
        {message ? <p className="text-sm">{message}</p> : null}
      </form>
    </main>
  );
}
