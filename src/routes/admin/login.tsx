import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { adminLogin } from "@/lib/data/fns";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Вход в кабинет — NEO DENT" },
      { name: "description", content: "Кабинет администратора NEO DENT." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4">
      <form
        className="w-full max-w-md border border-line bg-surface p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          void adminLogin({ data: { password } })
            .then((result) => {
              if (!result.ok) {
                setError("Пароль не подошёл.");
                return;
              }
              void navigate({ to: "/admin" });
            })
            .catch(() => setError("Не удалось войти."))
            .finally(() => setPending(false));
        }}
      >
        <p className="eyebrow">Кабинет</p>
        <h1 className="display mt-2 text-4xl">NEO DENT</h1>
        <label className="mt-6 block text-sm">
          Пароль
          <input
            className="field mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button className="btn btn-solid mt-4" type="submit" disabled={pending}>
          Войти
        </button>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </form>
    </main>
  );
}
