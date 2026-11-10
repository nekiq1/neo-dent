import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { BookingWizard } from "@/components/booking/wizard";
import { Crumbs } from "@/components/site/chrome";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/booking")({
  validateSearch: (search: Record<string, unknown>): { service?: string; doctor?: string } => ({
    ...(typeof search.service === "string" ? { service: search.service } : {}),
    ...(typeof search.doctor === "string" ? { doctor: search.doctor } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Запись — NEO DENT" },
      { name: "description", content: "Онлайн-запись в NEO DENT: услуга, врач, время и подтверждение номера." },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  const catalog = rootApi.useLoaderData();
  const search = Route.useSearch();
  return (
    <main className="shell py-10">
      <Crumbs items={[<span key="b">Запись</span>]} />
      <h1 className="display text-display">Запись</h1>
      <p className="mt-3 mb-8 max-w-2xl text-muted">
        Пять шагов. Занятые окна не нажимаются. Перед подтверждением слот проверяется ещё раз, чтобы два
        человека не сели на одно время.
      </p>
      <BookingWizard catalog={catalog} initialService={search.service} initialDoctor={search.doctor} />
    </main>
  );
}
