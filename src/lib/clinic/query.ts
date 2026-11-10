import type { Database, LegalDoc, Review, Service } from "@/lib/clinic/types";

export function approvedReviews(db: Database): Review[] {
  return db.reviews.filter((r) => r.status === "approved");
}

export function toCatalog(db: Database) {
  return {
    settings: db.settings,
    services: db.services,
    doctors: db.doctors,
    posts: db.posts,
    reviews: approvedReviews(db),
    legalIndex: db.legal.map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      updated: doc.updated,
    })),
  };
}

export type Catalog = ReturnType<typeof toCatalog>;

export function serviceDoctors(db: Database, service: Service) {
  return db.doctors.filter((d) => service.doctorIds.includes(d.id));
}

export function relatedServices(db: Database, service: Service) {
  return db.services.filter((s) => service.related.includes(s.slug));
}

export function reviewsForService(db: Database, slug: string) {
  return approvedReviews(db).filter((r) => r.serviceSlug === slug);
}

export function reviewsForDoctor(db: Database, id: string) {
  return approvedReviews(db).filter((r) => r.doctorId === id);
}

export function legalBySlug(db: Database, slug: string): LegalDoc | undefined {
  return db.legal.find((d) => d.slug === slug);
}
