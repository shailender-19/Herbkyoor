import { AdminClient } from "@/components/admin/admin-client";
import { useSeo } from "@/lib/use-seo";

export default function AdminPage() {
  useSeo({ title: "Admin · Catalogue Management", noindex: true });
  return <AdminClient />;
}
