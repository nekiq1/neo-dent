import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ru } from "date-fns/locale";
import { Link } from "@tanstack/react-router";

import { createAppointment, getSlots } from "@/lib/data/fns";
import type { Slot } from "@/lib/clinic/slots";
import { rub } from "@/lib/clinic/format";
import { clinicToday, dowOf, formatDay } from "@/lib/clinic/time";
import type { Catalog } from "@/lib/clinic/query";

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const STEPS = ["Услуга", "Врач", "Время", "Данные", "Подтверждение"];

export function BookingWizard({
  catalog,
  initialService,
  initialDoctor,
}: {
  catalog: Catalog;
  initialService?: string;
  initialDoctor?: string;
}) {
  const service0 = catalog.services.find((item) => item.slug === initialService);
  const doctorOk = Boolean(
    service0 &&
      initialDoctor &&
      catalog.doctors.some((item) => item.id === initialDoctor && item.serviceSlugs.includes(service0.slug)),
  );
  const [step, setStep] = useState(service0 ? (doctorOk ? 2 : 1) : 0);
  const [serviceSlug, setServiceSlug] = useState(service0?.slug ?? "");
  const [doctorId, setDoctorId] = useState(doctorOk ? (initialDoctor ?? "") : "");
  const [iso, setIso] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "ready">("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [pd, setPd] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ number: string; telegram: boolean; vk: boolean } | null>(null);

  const service = catalog.services.find((item) => item.slug === serviceSlug);
  const doctors = useMemo(
    () => catalog.doctors.filter((doctor) => (service ? doctor.serviceSlugs.includes(service.slug) : false)),
    [catalog.doctors, service],
  );
  const doctor = doctors.find((item) => item.id === doctorId);

  useEffect(() => {
    if (!serviceSlug || !doctorId || !iso) return;
    let cancel = false;
    setSlotsState("loading");
    setTime("");
    void getSlots({ data: { serviceSlug, doctorId, date: iso } })
      .then((next) => {
        if (cancel) return;
        setSlots(next);
        setSlotsState("ready");
      })
      .catch(() => {
        if (!cancel) {
          setSlots([]);
          setSlotsState("ready");
          setError("Не удалось загрузить свободное время. Обновите страницу.");
        }
      });
    return () => {
      cancel = true;
    };
  }, [serviceSlug, doctorId, iso]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof catalog.services>();
    for (const item of catalog.services) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [catalog.services]);

  function pickService(slug: string) {
    setServiceSlug(slug);
    const nextDoctors = catalog.doctors.filter((item) => item.serviceSlugs.includes(slug));
    if (!nextDoctors.some((item) => item.id === doctorId)) setDoctorId("");
    setIso("");
    setTime("");
    setError("");
    setStep(1);
  }

  async function confirm() {
    if (!pd) {
      setError("Нужно отдельное согласие на обработку персональных данных. Рассылка — по желанию.");
      return;
    }
    if (!service || !doctor) return;
    setPending(true);
    setError("");
    try {
      const result = await createAppointment({
        data: {
          serviceSlug,
          doctorId,
          date: iso,
          time,
          name,
          phone,
          email,
          comment,
          pdConsent: true,
          marketingConsent: marketing,
        },
      });
      if (!result.ok) {
        setError(result.error);
        if (result.error.includes("заняли")) setStep(2);
        return;
      }
      setDone({ number: result.number, telegram: result.notified.telegram, vk: result.notified.vk });
    } catch {
      setError("Проверьте имя, телефон и почту. Согласие на данные должно быть отмечено вами.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <section className="border border-line bg-surface px-5 py-10 md:px-10">
        <p className="eyebrow">Заявка принята</p>
        <h2 className="display mt-3 text-display">{done.number}</h2>
        <p className="mt-4 max-w-xl text-muted">
          Время держим за вами. Если планы изменятся, позвоните за три часа: {catalog.settings.phone}.
          {done.telegram
            ? " Копия ушла администратору в Telegram."
            : done.vk
              ? " Копия ушла администратору во ВКонтакте."
              : " Уведомление в Telegram включится, когда в кабинете клиники будут заданы токен бота и chat id. Заявка уже в журнале записей."}
        </p>
        <Link to="/" className="btn btn-line mt-8">
          На главную
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <ol className="flex gap-4 overflow-x-auto lg:col-span-3 lg:flex-col lg:overflow-visible">
        {STEPS.map((label, index) => (
          <li key={label} className="min-w-28">
            <button
              type="button"
              className={`text-left ${index === step ? "text-ink" : "text-muted"}`}
              onClick={() => {
                if (index < step) setStep(index);
              }}
              disabled={index > step}
            >
              <span className="display block text-2xl">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-sm">{label}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="lg:col-span-9">
        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

        {step === 0 ? (
          <div className="space-y-8">
            {groups.map(([category, items]) => (
              <div key={category}>
                <h2 className="text-sm font-semibold text-muted">{category}</h2>
                <ul className="mt-2 divide-y divide-line border-y border-line">
                  {items.map((item) => (
                    <li key={item.slug}>
                      <button
                        type="button"
                        className="flex w-full items-baseline justify-between gap-4 py-4 text-left"
                        onClick={() => pickService(item.slug)}
                      >
                        <span>
                          <span className="block text-lg">{item.title}</span>
                          <span className="text-sm text-muted">{item.summary}</span>
                        </span>
                        <span className="shrink-0 text-sm">от {rub(item.priceFrom)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <p className="text-sm text-muted">Услуга: {service?.title}</p>
            <ul className="mt-4 space-y-3">
              {doctors.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`flex w-full items-start gap-4 border px-4 py-4 text-left ${
                      doctorId === item.id ? "border-primary bg-surface" : "border-line"
                    }`}
                    onClick={() => {
                      setDoctorId(item.id);
                      setIso("");
                      setTime("");
                      setStep(2);
                    }}
                  >
                    <span className="display grid size-12 shrink-0 place-items-center bg-bg-deep text-lg">
                      {item.initials}
                    </span>
                    <span>
                      <span className="block text-lg">{item.name}</span>
                      <span className="text-sm text-muted">
                        {item.role}. Стаж {item.experienceYears} лет.
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 2 && doctor ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="neo-cal border border-line bg-surface p-3">
              <DayPicker
                mode="single"
                locale={ru}
                weekStartsOn={1}
                selected={iso ? new Date(`${iso}T12:00:00`) : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  setIso(toIso(date));
                  setError("");
                }}
                disabled={(date) => {
                  const day = toIso(date);
                  if (day < clinicToday()) return true;
                  if (doctor.daysOff.includes(day)) return true;
                  return !doctor.hours.some((hour) => hour.dow === dowOf(day));
                }}
              />
            </div>
            <div>
              <p className="text-sm text-muted">
                {doctor.name}
                {iso ? ` · ${formatDay(iso)}` : " · выберите день"}
              </p>
              {slotsState === "loading" ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="shimmer h-11" />
                  ))}
                </div>
              ) : null}
              {slotsState === "ready" && slots.length === 0 ? (
                <p className="mt-4 text-sm">В этот день свободных окон нет. Попробуйте соседнюю дату.</p>
              ) : null}
              {slotsState === "ready" && slots.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.free}
                      className={`min-h-11 border text-sm ${
                        time === slot.time
                          ? "border-primary bg-primary text-on-primary"
                          : "border-line bg-surface"
                      } disabled:text-muted disabled:line-through`}
                      onClick={() => setTime(slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className="btn btn-solid mt-6"
                disabled={!time}
                onClick={() => setStep(3)}
              >
                Дальше
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (name.trim().length < 2 || phone.trim().length < 10 || !email.includes("@")) {
                setError("Имя, телефон и почта нужны, чтобы подтвердить время.");
                return;
              }
              setError("");
              setStep(4);
            }}
          >
            <label className="block text-sm">
              Имя
              <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="block text-sm">
              Телефон
              <input
                className="field mt-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Электронная почта
              <input
                className="field mt-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Комментарий
              <textarea
                className="field mt-1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Например, какой зуб беспокоит. Диагноз писать не обязательно."
              />
            </label>
            <button type="submit" className="btn btn-solid md:col-span-2 w-fit">
              К согласиям
            </button>
          </form>
        ) : null}

        {step === 4 && service && doctor ? (
          <div>
            <dl className="grid gap-3 border border-line bg-surface p-5 text-sm md:grid-cols-2">
              <div>
                <dt className="text-muted">Услуга</dt>
                <dd>{service.title}</dd>
              </div>
              <div>
                <dt className="text-muted">Врач</dt>
                <dd>{doctor.name}</dd>
              </div>
              <div>
                <dt className="text-muted">Когда</dt>
                <dd>
                  {formatDay(iso)}, {time}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Контакт</dt>
                <dd>
                  {name}, {phone}
                </dd>
              </div>
            </dl>
            <label className="mt-5 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4"
                checked={pd}
                onChange={(e) => setPd(e.target.checked)}
              />
              <span>
                Даю согласие на обработку персональных данных для записи на приём.{" "}
                <Link to="/legal/$doc" params={{ doc: "consent" }} className="underline">
                  Текст согласия
                </Link>
                .
              </span>
            </label>
            <label className="mt-3 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <span>
                Хочу получать напоминания о визите и редкие письма клиники. Это не условие записи.
              </span>
            </label>
            <button type="button" className="btn btn-solid mt-6" disabled={pending} onClick={() => void confirm()}>
              {pending ? "Проверяем слот…" : "Подтвердить запись"}
            </button>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted">
              Нажимая кнопку, вы отправляете заявку на бронь времени. Это ещё не договор на лечение.{" "}
              <Link to="/legal/$doc" params={{ doc: "privacy" }} className="underline">
                Политика ПДн
              </Link>{" "}
              и{" "}
              <Link to="/legal/$doc" params={{ doc: "offer" }} className="underline">
                оферта на запись
              </Link>
              .
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
