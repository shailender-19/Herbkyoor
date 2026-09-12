import type { Metadata } from "next";
import { AdminClient } from "@/components/admin/admin-client";

export const metadata: Metadata = {
  title: "Admin · Catalogue Management",
  description: "Manage product categories and items.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
