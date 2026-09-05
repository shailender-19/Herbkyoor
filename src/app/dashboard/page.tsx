import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard · Advertisement Management",
  description: "Manage promotional banners, product GIFs and sliders.",
  robots: { index: false },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
