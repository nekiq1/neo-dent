import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { adminLogout } from "@/lib/data/fns";

const LINKS = [
  { to: "/admin" as const, label: "Сводка" },
  { to: "/admin/appointments" as const, label: "Записи" },
  { to: "/admin/schedule" as const, label: "Расписание" },
  { to: "/admin/services" as const, label: "Услуги" },
  { to: "/admin/doctors" as const, label: "Врачи" },
  { to: "/admin/reviews" as const, label: "Отзывы" },
  { to: "/admin/settings" as const, label: "Настройки" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-4">
          <Link to="/" className="display text-2xl">
            NEO DENT
          </Link>
          <button
            type="button"
            className="btn btn-line"
            onClick={() => {
              void adminLogout().then(() => {
                window.location.href = "/admin/login";
              });
            }}
          >
            Выйти
          </button>
        </div>
        <nav className="shell flex gap-4 overflow-x-auto pb-3 text-sm" aria-label="Кабинет">
          {LINKS.map((link) => {
            const active = path === link.to;
            return (
              <Link key={link.to} to={link.to} className={`min-h-11 py-2 ${active ? "text-primary" : ""}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="shell py-8">{children}</div>
    </div>
  );
}
