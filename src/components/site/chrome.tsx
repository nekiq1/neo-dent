import { Star } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { logCookie } from "@/lib/data/fns";
import { safeHref } from "@/lib/clinic/format";
import type { Settings } from "@/lib/clinic/types";

const ClinicContext = createContext<Settings | null>(null);

export function ClinicProvider({
  value,
  children,
}: {
  value: Settings;
  children: ReactNode;
}) {
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): Settings {
  const value = useContext(ClinicContext);
  if (!value) throw new Error("Настройки клиники не загружены");
  return value;
}

const NAV = [
  { to: "/services" as const, label: "Услуги" },
  { to: "/doctors" as const, label: "Врачи" },
  { to: "/prices" as const, label: "Цены" },
  { to: "/reviews" as const, label: "Отзывы" },
  { to: "/blog" as const, label: "Журнал" },
  { to: "/about" as const, label: "О клинике" },
  { to: "/contacts" as const, label: "Контакты" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      {NAV.map((item) => {
        const active = path === item.to || path.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`nav-link ${active ? "is-active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Header() {
  const clinic = useClinic();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-header text-header-fg">
      <div className="shell flex items-center justify-between gap-4 py-3">
        <Link to="/" className="flex min-h-11 items-center gap-3 leading-none">
          <span className="logo-mark" aria-hidden="true">
            ND
          </span>
          <span>
            <span className="display block text-[1.35rem] tracking-normal">NEO DENT</span>
            <span className="text-xs text-header-muted">Васильевский остров · Санкт-Петербург</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 lg:flex" aria-label="Основное меню">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-2">
          <a className="hidden text-sm text-header-fg xl:inline" href={safeHref(clinic.phoneHref, "tel:+78124182640")}>
            {clinic.phone}
          </a>
          <Link to="/booking" className="btn btn-accent hidden sm:inline-flex">
            Запись
          </Link>
          <button
            type="button"
            className="btn btn-line-light min-w-11 px-3 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="shell flex flex-col border-t border-white/10 pb-4 lg:hidden" aria-label="Мобильное меню">
          <NavLinks onNavigate={() => setOpen(false)} />
          <Link to="/booking" className="btn btn-accent mt-3">
            Запись
          </Link>
          <a className="mt-3 min-h-11 text-sm text-header-fg" href={safeHref(clinic.phoneHref, "tel:+78124182640")}>
            {clinic.phone}
          </a>
        </nav>
      ) : null}
    </header>
  );
}

export function Footer() {
  const clinic = useClinic();
  return (
    <footer className="mt-16 bg-header text-header-fg">
      <div className="shell grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="display text-3xl">NEO DENT</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-header-muted">
            Частный кабинет на Среднем проспекте. Терапия, гигиена, виниры, импланты и элайнеры.
            Смету называем до работы.
          </p>
          <p className="mt-4 flex gap-4 text-sm">
            <a className="underline decoration-white/30 underline-offset-4" href={safeHref(clinic.telegram)}>
              Telegram
            </a>
            <a className="underline decoration-white/30 underline-offset-4" href={safeHref(clinic.vk)}>
              ВКонтакте
            </a>
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="text-sm font-semibold">Разделы</p>
          <ul className="mt-3 space-y-2 text-sm text-header-muted">
            <li><Link to="/services">Услуги</Link></li>
            <li><Link to="/doctors">Врачи</Link></li>
            <li><Link to="/prices">Цены</Link></li>
            <li><Link to="/reviews">Отзывы</Link></li>
            <li><Link to="/blog">Журнал</Link></li>
            <li><Link to="/booking">Запись</Link></li>
            <li><Link to="/about">О клинике</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-sm font-semibold">Документы</p>
          <ul className="mt-3 space-y-2 text-sm text-header-muted">
            <li><Link to="/legal/$doc" params={{ doc: "privacy" }}>Политика ПДн</Link></li>
            <li><Link to="/legal/$doc" params={{ doc: "consent" }}>Согласие</Link></li>
            <li><Link to="/legal/$doc" params={{ doc: "cookies" }}>Cookie</Link></li>
            <li><Link to="/legal/$doc" params={{ doc: "offer" }}>Оферта на запись</Link></li>
            <li><Link to="/legal/$doc" params={{ doc: "requisites" }}>Сведения об организации</Link></li>
            <li><a href="/sitemap.xml">Карта сайта</a></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-semibold">Контакты</p>
          <p className="mt-3 text-sm leading-relaxed text-header-muted">
            {clinic.addressShort}
            <br />
            {clinic.metro}
            <br />
            <a href={safeHref(clinic.phoneHref, "tel:+78124182640")}>{clinic.phone}</a>
            <br />
            <a href={safeHref(`mailto:${clinic.email}`)}>{clinic.email}</a>
            <br />
            {clinic.hours}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-4 text-xs leading-relaxed text-header-muted md:flex-row md:items-start md:justify-between">
          <p>© 2026 NEO DENT. Все права защищены.</p>
          <p className="max-w-xl text-center">
            {clinic.legalName}, ИНН {clinic.inn}, ОГРН {clinic.ogrn}, {clinic.address}. Лицензия:{" "}
            {clinic.license}, {clinic.licenseBy}.
          </p>
          <a className="md:text-right" href={safeHref(clinic.ceoUrl)}>
            {clinic.ceoName}
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Crumbs({ items }: { items: ReactNode[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
      <Link to="/" className="hover:text-ink">
        Главная
      </Link>
      {items.map((item, index) => (
        <span key={index} className="contents">
          <span aria-hidden="true">/</span>
          <span className="text-ink">{item}</span>
        </span>
      ))}
    </nav>
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("dd-cookie");
    setVisible(stored !== "accepted" && stored !== "rejected");
  }, []);

  if (!visible) return null;

  async function choose(accepted: boolean) {
    window.localStorage.setItem("dd-cookie", accepted ? "accepted" : "rejected");
    setVisible(false);
    try {
      await logCookie({ data: { accepted } });
    } catch {
      /* журнал согласий не блокирует закрытие полосы */
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface p-4 shadow-[0_-8px_30px_rgba(21,32,51,0.08)]">
      <div className="shell flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-ink">
          Сайт запоминает только ваш выбор в этой полосе и, для сотрудников, вход в кабинет. Рекламных
          счётчиков нет. Подробности — в{" "}
          <Link to="/legal/$doc" params={{ doc: "cookies" }} className="text-primary underline">
            политике cookie
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-line" onClick={() => void choose(false)}>
            Отклонить
          </button>
          <button type="button" className="btn btn-solid" onClick={() => void choose(true)}>
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}

export function Prose({ text }: { text: string }) {
  const parts = text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return (
    <div className="space-y-4">
      {parts.map((part) => (
        <p key={part.slice(0, 48)} className="leading-relaxed">
          {part}
        </p>
      ))}
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5 text-accent" aria-label={`Оценка ${value} из 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className="size-3.5"
          fill={index < value ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
