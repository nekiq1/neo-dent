import { doctors, reviews } from "@/lib/clinic/people";
import { legal, posts, settings } from "@/lib/clinic/pages";
import { services } from "@/lib/clinic/services";
import { nextDow, prevDow } from "@/lib/clinic/time";
import type { Appointment, Database } from "@/lib/clinic/types";
import { SEED_VERSION } from "@/lib/clinic/types";

function buildAppointments(): Appointment[] {
  const monday = nextDow(1, 1);
  const thursday = nextDow(4, 1);
  const wednesday = nextDow(3, 1);
  const friday = nextDow(5, 2);
  const past = prevDow(2);
  return [
    {
      id: "apt-seed-1",
      number: "ND-2026-0001",
      serviceSlug: "gigiena",
      doctorId: "mirgorodskaya",
      date: monday,
      time: "10:00",
      durationMin: 90,
      name: "Кира Лосева",
      phone: "+7 921 000-11-22",
      email: "kira.loseva@example.com",
      comment: "Кофе и курение, просила не продавать набор паст.",
      status: "confirmed",
      marketingConsent: false,
      createdAt: "2026-11-02T09:00:00.000Z",
    },
    {
      id: "apt-seed-2",
      number: "ND-2026-0002",
      serviceSlug: "implantaciya",
      doctorId: "kornilov",
      date: thursday,
      time: "11:00",
      durationMin: 120,
      name: "Роман Шевелёв",
      phone: "+7 911 555-01-90",
      email: "roman.shevelev@example.com",
      comment: "Консультация с КТ, шестёрка слева снизу отсутствует.",
      status: "new",
      marketingConsent: true,
      createdAt: "2026-11-04T12:10:00.000Z",
    },
    {
      id: "apt-seed-3",
      number: "ND-2026-0003",
      serviceSlug: "elaynery",
      doctorId: "ershova",
      date: wednesday,
      time: "15:00",
      durationMin: 60,
      name: "Дарья Пензина",
      phone: "+7 981 300-44-18",
      email: "darya.penzina@example.com",
      comment: "",
      status: "confirmed",
      marketingConsent: false,
      createdAt: "2026-11-05T08:40:00.000Z",
    },
    {
      id: "apt-seed-4",
      number: "ND-2026-0004",
      serviceSlug: "karies",
      doctorId: "mirgorodskaya",
      date: friday,
      time: "09:30",
      durationMin: 60,
      name: "Игорь Сафронов",
      phone: "+7 921 700-62-15",
      email: "igor.safronov@example.com",
      comment: "Реакция на сладкое, верхний премоляр.",
      status: "new",
      marketingConsent: false,
      createdAt: "2026-11-06T16:20:00.000Z",
    },
    {
      id: "apt-seed-5",
      number: "ND-2026-0005",
      serviceSlug: "karies",
      doctorId: "mirgorodskaya",
      date: past,
      time: "12:00",
      durationMin: 60,
      name: "Елена Гриц",
      phone: "+7 911 200-77-01",
      email: "elena.grits@example.com",
      comment: "",
      status: "done",
      marketingConsent: true,
      createdAt: "2026-10-20T10:00:00.000Z",
    },
    {
      id: "apt-seed-6",
      number: "ND-2026-0006",
      serviceSlug: "gigiena",
      doctorId: "mirgorodskaya",
      date: nextDow(6, 1),
      time: "10:00",
      durationMin: 90,
      name: "Пётр Анохин",
      phone: "+7 921 440-18-03",
      email: "petr.anohin@example.com",
      comment: "Просит отмену, уезжает.",
      status: "cancelled",
      marketingConsent: false,
      createdAt: "2026-10-28T11:00:00.000Z",
    },
  ];
}

export function createSeed(): Database {
  return {
    version: SEED_VERSION,
    settings,
    services,
    doctors,
    reviews,
    posts,
    legal,
    appointments: buildAppointments(),
    consents: [],
  };
}
