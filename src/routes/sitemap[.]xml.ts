import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { readDb } = await import("@/lib/data/repository.server");
        const { getRequestUrl } = await import("@tanstack/react-start/server");
        const db = await readDb();
        const origin = getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;
        const paths = [
          "/",
          "/services",
          "/doctors",
          "/prices",
          "/reviews",
          "/booking",
          "/about",
          "/contacts",
          "/blog",
          ...db.services.map((service) => `/services/${service.slug}`),
          ...db.doctors.map((doctor) => `/doctors/${doctor.slug}`),
          ...db.posts.map((post) => `/blog/${post.slug}`),
          ...db.legal.map((doc) => `/legal/${doc.slug}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
