import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Crumbs, Prose } from "@/components/site/chrome";
import { getCatalog } from "@/lib/data/fns";
import { formatDay } from "@/lib/clinic/time";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const catalog = await getCatalog();
    const post = catalog.posts.find((item) => item.slug === params.slug);
    if (!post) throw notFound();
    const more = catalog.posts.filter((item) => item.slug !== post.slug).slice(0, 2);
    return { post, more };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.post.title} — NEO DENT` : "Заметка — NEO DENT" },
      { name: "description", content: loaderData?.post.excerpt ?? "" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { post, more } = Route.useLoaderData();
  return (
    <main className="shell py-10">
      <Crumbs
        items={[
          <Link key="b" to="/blog">Журнал</Link>,
          <span key="t">{post.title}</span>,
        ]}
      />
      <article className="max-w-2xl">
        <p className="text-sm text-muted">
          {formatDay(post.date)} · {post.readingMin} мин чтения
        </p>
        <h1 className="display mt-3 text-display">{post.title}</h1>
        <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
        <div className="mt-8">
          <Prose text={post.body} />
        </div>
      </article>
      {more.length > 0 ? (
        <aside className="mt-14 border-t border-line pt-6">
          <h2 className="text-sm font-semibold">Ещё в журнале</h2>
          <ul className="mt-3 space-y-2">
            {more.map((item) => (
              <li key={item.slug}>
                <Link to="/blog/$slug" params={{ slug: item.slug }}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </main>
  );
}
