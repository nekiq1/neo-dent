import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { getAdmin, updateSettings } from "@/lib/data/fns";
import type { Settings } from "@/lib/clinic/types";

export const Route = createFileRoute("/admin/settings")({
  loader: () => getAdmin(),
  head: () => ({ meta: [{ title: "Настройки — кабинет NEO DENT" }] }),
  component: SettingsAdmin,
});

const FIELDS: { key: keyof Settings; label: string; area?: boolean }[] = [
  { key: "phone", label: "Телефон" },
  { key: "phoneHref", label: "Ссылка телефона" },
  { key: "email", label: "Почта" },
  { key: "hours", label: "Часы" },
  { key: "address", label: "Юридический адрес", area: true },
  { key: "addressShort", label: "Короткий адрес" },
  { key: "metro", label: "Метро" },
  { key: "telegram", label: "Telegram" },
  { key: "vk", label: "ВКонтакте" },
  { key: "inn", label: "ИНН" },
  { key: "ogrn", label: "ОГРН" },
  { key: "license", label: "Лицензия" },
  { key: "licenseBy", label: "Кто выдал" },
  { key: "ceoName", label: "Подпись справа в подвале" },
  { key: "ceoUrl", label: "Ссылка подписи" },
  { key: "seoTitle", label: "SEO title" },
  { key: "seoDescription", label: "SEO description", area: true },
];

function SettingsAdmin() {
  const db = Route.useLoaderData();
  const router = useRouter();
  const [draft, setDraft] = useState<Settings>(db.settings);
  const [message, setMessage] = useState("");

  return (
    <main>
      <h1 className="display text-display">Настройки</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Контакты, реквизиты и строка для поисковой выдачи. Журнал согласий: {db.consents.length} записей (IP, время,
        версия текста). Уведомления о новых заявках уходят в Telegram, если заданы TELEGRAM_BOT_TOKEN и
        TELEGRAM_CHAT_ID, иначе — во ВКонтакте при VK_ACCESS_TOKEN и VK_PEER_IDS.
      </p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void updateSettings({ data: draft })
            .then(() => {
              setMessage("Сохранили настройки");
              return router.invalidate();
            })
            .catch(() => setMessage("Не удалось сохранить"));
        }}
      >
        {FIELDS.map((field) => (
          <label key={field.key} className="block text-sm">
            {field.label}
            {field.area ? (
              <textarea
                className="field mt-1"
                value={draft[field.key]}
                onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
              />
            ) : (
              <input
                className="field mt-1"
                value={draft[field.key]}
                onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
              />
            )}
          </label>
        ))}
        <button className="btn btn-solid" type="submit">
          Сохранить
        </button>
        {message ? <p className="text-sm">{message}</p> : null}
      </form>
    </main>
  );
}
