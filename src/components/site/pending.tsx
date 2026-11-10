export function PagePending() {
  return (
    <div className="min-h-[70vh] bg-bg">
      <div className="shell py-16">
        <div className="shimmer h-3 w-36" />
        <div className="shimmer mt-6 h-14 w-2/3 max-w-xl" />
        <div className="shimmer mt-4 h-4 w-full max-w-2xl" />
        <div className="shimmer mt-2 h-4 w-5/6 max-w-xl" />
        <div className="mt-12 grid gap-5 md:grid-cols-12">
          <div className="shimmer h-64 md:col-span-7" />
          <div className="shimmer h-40 md:col-span-5" />
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <main className="shell py-24">
      <p className="eyebrow">404</p>
      <h1 className="display mt-3 text-display">Такой страницы нет</h1>
      <p className="mt-4 max-w-lg text-muted">
        Ссылка устарела или адрес набран с опечаткой. Запись и услуги на месте.
      </p>
      <a className="btn btn-solid mt-8" href="/">
        На главную
      </a>
    </main>
  );
}
