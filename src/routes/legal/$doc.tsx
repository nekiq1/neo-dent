import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Crumbs } from "@/components/site/chrome";
import { getLegal } from "@/lib/data/fns";

export const Route = createFileRoute("/legal/$doc")({
  loader: async ({ params }) => {
    const doc = await getLegal({ data: params.doc });
    if (!doc) throw notFound();
    return doc;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — NEO DENT` : "Документ — NEO DENT" },
      { name: "description", content: loaderData?.description ?? "" },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  const doc = Route.useLoaderData();
  const others = [
    ["privacy", "Политика ПДн"],
    ["consent", "Согласие"],
    ["cookies", "Cookie"],
    ["offer", "Оферта"],
    ["requisites", "Сведения"],
  ] as const;
  return (
    <main className="shell py-10">
      <Crumbs
        items={[
          <span key="l">Документы</span>,
          <span key="t">{doc.title}</span>,
        ]}
      />
      <article className="max-w-2xl">
        <p className="text-sm text-muted">Редакция от {doc.updated}</p>
        <h1 className="display mt-3 text-display">{doc.title}</h1>
        <p className="mt-4 text-muted">{doc.description}</p>
        {doc.sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="text-xl">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
      <ul className="mt-12 flex flex-wrap gap-4 text-sm">
        {others
          .filter(([slug]) => slug !== doc.slug)
          .map(([slug, label]) => (
            <li key={slug}>
              <Link to="/legal/$doc" params={{ doc: slug }} className="underline">
                {label}
              </Link>
            </li>
          ))}
      </ul>
    </main>
  );
}
