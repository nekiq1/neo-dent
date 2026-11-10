export type WeekHours = {
  dow: number;
  from: string;
  to: string;
};

export type Doctor = {
  id: string;
  slug: string;
  name: string;
  role: string;
  experienceYears: number;
  education: string[];
  focus: string[];
  bio: string;
  serviceSlugs: string[];
  hours: WeekHours[];
  daysOff: string[];
  initials: string;
};

export type PriceLine = {
  name: string;
  price: number;
  note?: string;
};

export type Step = {
  title: string;
  text: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type Service = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  summary: string;
  body: string;
  indications: string[];
  contraindications: string[];
  steps: Step[];
  result: string;
  lifespan: string;
  durationMin: number;
  priceFrom: number;
  prices: PriceLine[];
  doctorIds: string[];
  related: string[];
  faq: FaqItem[];
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string;
  serviceSlug: string;
  doctorId: string;
  status: ReviewStatus;
  verified: boolean;
  reply: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingMin: number;
  body: string;
};

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

export type Settings = {
  name: string;
  legalName: string;
  inn: string;
  ogrn: string;
  license: string;
  licenseBy: string;
  address: string;
  addressShort: string;
  metro: string;
  phone: string;
  phoneHref: string;
  email: string;
  hours: string;
  telegram: string;
  vk: string;
  ceoName: string;
  ceoUrl: string;
  seoTitle: string;
  seoDescription: string;
};

export type AppointmentStatus = "new" | "confirmed" | "done" | "cancelled" | "moved";

export type Appointment = {
  id: string;
  number: string;
  serviceSlug: string;
  doctorId: string;
  date: string;
  time: string;
  durationMin: number;
  name: string;
  phone: string;
  email: string;
  comment: string;
  status: AppointmentStatus;
  marketingConsent: boolean;
  createdAt: string;
};

export type ConsentKind = "pd" | "marketing" | "cookies";

export type ConsentLog = {
  id: string;
  kind: ConsentKind;
  accepted: boolean;
  version: string;
  at: string;
  ip: string;
  userAgent: string;
  appointmentId?: string;
};

export type Database = {
  version: number;
  settings: Settings;
  services: Service[];
  doctors: Doctor[];
  reviews: Review[];
  posts: Post[];
  legal: LegalDoc[];
  appointments: Appointment[];
  consents: ConsentLog[];
};

export const CONSENT_VERSION = "2026-03-01";
export const SEED_VERSION = 3;
