import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/shell";
import { adminSession } from "@/lib/data/fns";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const path = location.pathname.replace(/\/$/, "");
    if (path.endsWith("/admin/login")) return;
    const session = await adminSession();
    if (!session.ok) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.replace(/\/$/, "").endsWith("/admin/login")) return <Outlet />;
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
