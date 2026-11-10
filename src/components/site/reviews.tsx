import { Link } from "@tanstack/react-router";

import { initialsOf } from "@/lib/clinic/format";
import { formatDay } from "@/lib/clinic/time";
import type { Catalog } from "@/lib/clinic/query";
import { Stars } from "@/components/site/chrome";

export function ReviewCard({
  review,
  catalog,
}: {
  review: Catalog["reviews"][number];
  catalog: Catalog;
}) {
  const doctor = catalog.doctors.find((item) => item.id === review.doctorId);
  const service = catalog.services.find((item) => item.slug === review.serviceSlug);
  return (
    <figure className="break-inside-avoid border border-line bg-surface p-4">
      <Stars value={review.rating} />
      <blockquote className="mt-3 text-sm leading-relaxed">{review.text}</blockquote>
      {review.reply ? (
        <p className="mt-3 border-l-2 border-accent pl-3 text-sm text-muted">
          Клиника: {review.reply}
        </p>
      ) : null}
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="display grid size-10 place-items-center bg-bg-deep text-sm">{initialsOf(review.name)}</span>
        <span className="text-sm">
          <span className="block">{review.name}</span>
          <span className="text-muted">
            {formatDay(review.date)}
            {review.verified ? " · Проверенный пациент" : ""}
            {service ? ` · ${service.title}` : ""}
            {doctor ? ` · ${doctor.name}` : ""}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function DoctorMini({
  doctor,
}: {
  doctor: Catalog["doctors"][number];
}) {
  return (
    <Link
      to="/doctors/$slug"
      params={{ slug: doctor.slug }}
      className="flex items-center gap-3 border border-line bg-surface p-3"
    >
      <span className="display grid size-12 place-items-center bg-primary text-on-primary">{doctor.initials}</span>
      <span>
        <span className="block">{doctor.name}</span>
        <span className="text-sm text-muted">{doctor.role}</span>
      </span>
    </Link>
  );
}
