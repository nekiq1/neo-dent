import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { CookieBanner, ClinicProvider, Footer, Header } from "@/components/site/chrome";
import { NotFoundPage } from "@/components/site/pending";
import { getCatalog } from "@/lib/data/fns";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: () => getCatalog(),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.settings.seoTitle ?? "NEO DENT" },
      {
        name: "description",
        content: loaderData?.settings.seoDescription ?? "Стоматология NEO DENT в Санкт-Петербурге",
      },
      { name: "theme-color", content: "#152033" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});

function RootComponent() {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Shell />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function Shell() {
  const catalog = Route.useLoaderData();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const admin = path.includes("/admin");
  return (
    <ClinicProvider value={catalog.settings}>
      {admin ? (
        <Outlet />
      ) : (
        <>
          <Header />
          <div key={path} className="page-rise">
            <Outlet />
          </div>
          <Footer />
          <CookieBanner />
        </>
      )}
    </ClinicProvider>
  );
}
