import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";

import { Crumbs } from "@/components/site/chrome";
import { formatDay } from "@/lib/clinic/time";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Журнал — NEO DENT" },
      { name: "description", content: "Заметки врачей NEO DENT: первый визит, имплант или мост, ретейнеры." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { posts } = rootApi.useLoaderData();
  const [first, ...rest] = posts;
  return (
    <main className="shell py-10">
      <Crumbs items={[<span key="b">Журнал</span>]} />
      <h1 className="display text-display">Журнал</h1>
      {first ? (
        <article className="mt-10 grid gap-6 border-t border-line pt-8 lg:grid-cols-12">
          <p className="text-sm text-muted lg:col-span-3">
            {formatDay(first.date)} · {first.readingMin} мин
          </p>
          <div className="lg:col-span-8">
            <h2 className="display text-4xl">
              <Link to="/blog/$slug" params={{ slug: first.slug }}>
                {first.title}
              </Link>
            </h2>
            <p className="mt-4 max-w-2xl text-muted">{first.excerpt}</p>
          </div>
        </article>
      ) : null}
      <ul className="mt-8">
        {rest.map((post) => (
          <li key={post.slug} className="grid gap-2 border-t border-line py-6 md:grid-cols-12">
            <p className="text-sm text-muted md:col-span-3">{formatDay(post.date)}</p>
            <div className="md:col-span-8">
              <h2 className="text-2xl">
                <Link to="/blog/$slug" params={{ slug: post.slug }}>
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
