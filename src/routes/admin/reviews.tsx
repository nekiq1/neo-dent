import { createFileRoute, useRouter } from "@tanstack/react-router";

import { getAdmin, moderateReview } from "@/lib/data/fns";
import type { Review } from "@/lib/clinic/types";

export const Route = createFileRoute("/admin/reviews")({
  loader: () => getAdmin(),
  head: () => ({ meta: [{ title: "Отзывы — кабинет NEO DENT" }] }),
  component: ReviewsAdmin,
});

function ReviewsAdmin() {
  const db = Route.useLoaderData();
  const router = useRouter();
  return (
    <main>
      <h1 className="display text-display">Отзывы</h1>
      <ul className="mt-6 space-y-4">
        {db.reviews.map((review) => (
          <li key={review.id}>
            <ReviewEditor
              review={review}
              onDone={() => {
                void router.invalidate();
              }}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}

function ReviewEditor({ review, onDone }: { review: Review; onDone: () => void }) {
  return (
    <form
      className="border border-line bg-surface p-4 text-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const status = String(form.get("status")) as Review["status"];
        void moderateReview({
          data: {
            id: review.id,
            status,
            reply: String(form.get("reply") ?? ""),
            verified: form.get("verified") === "on",
          },
        }).then(() => onDone());
      }}
    >
      <p className="font-semibold">
        {review.name} · {review.rating} · {review.status}
      </p>
      <p className="mt-2 leading-relaxed">{review.text}</p>
      <label className="mt-3 block">
        Статус
        <select className="field mt-1" name="status" defaultValue={review.status}>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
      </label>
      <label className="mt-3 flex items-center gap-2">
        <input type="checkbox" name="verified" defaultChecked={review.verified} />
        Проверенный пациент
      </label>
      <label className="mt-3 block">
        Ответ клиники
        <textarea className="field mt-1" name="reply" defaultValue={review.reply} />
      </label>
      <button className="btn btn-solid mt-3" type="submit">
        Сохранить отзыв
      </button>
    </form>
  );
}
