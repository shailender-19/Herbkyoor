import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { useSeo } from "@/lib/use-seo";

export default function DashboardPage() {
  useSeo({ title: "Dashboard · Advertisement Management", noindex: true });
  return <DashboardClient />;
}
