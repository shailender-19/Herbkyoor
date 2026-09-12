import { NextResponse } from "next/server";
import { listCatalog, SUPPORTED_ICONS } from "@/lib/admin/catalog";
import { requireAuth, toErrorResponse } from "@/lib/admin/route-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Full catalogue snapshot for the admin dashboard. */
export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const { categories } = await listCatalog();
    return NextResponse.json({ categories, icons: SUPPORTED_ICONS });
  } catch (error) {
    return toErrorResponse(error);
  }
}
