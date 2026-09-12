import { NextResponse } from "next/server";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/admin/catalog";
import {
  readJson,
  requireAuth,
  revalidateCatalog,
  toErrorResponse,
} from "@/lib/admin/route-helpers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const body = await readJson(request);
    const category = await createCategory({
      slug: typeof body.slug === "string" ? body.slug : undefined,
      name: String(body.name ?? ""),
      description:
        typeof body.description === "string" ? body.description : undefined,
      icon: typeof body.icon === "string" ? body.icon : undefined,
      image: typeof body.image === "string" ? body.image : undefined,
    });
    revalidateCatalog();
    return NextResponse.json({ category });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const body = await readJson(request);
    const slug = String(body.slug ?? "").trim();
    if (!slug) {
      return NextResponse.json({ error: '"slug" is required.' }, { status: 400 });
    }
    const category = await updateCategory(slug, {
      name: typeof body.name === "string" ? body.name : undefined,
      description:
        typeof body.description === "string" ? body.description : undefined,
      icon: typeof body.icon === "string" ? body.icon : undefined,
      image: typeof body.image === "string" ? body.image : undefined,
    });
    revalidateCatalog();
    return NextResponse.json({ category });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const slug = new URL(request.url).searchParams.get("slug")?.trim();
    if (!slug) {
      return NextResponse.json({ error: '"slug" is required.' }, { status: 400 });
    }
    await deleteCategory(slug);
    revalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
