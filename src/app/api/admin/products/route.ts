import { NextResponse } from "next/server";
import {
  createProduct,
  deleteProduct,
  updateProduct,
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
    const product = await createProduct(body);
    revalidateCatalog();
    return NextResponse.json({ product });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const body = await readJson(request);
    const category = String(body.category ?? "").trim();
    const id = String(body.id ?? "").trim();
    if (!category || !id) {
      return NextResponse.json(
        { error: '"category" and "id" are required.' },
        { status: 400 },
      );
    }
    const product = await updateProduct(
      category,
      id,
      (body.product as Record<string, unknown>) ?? {},
    );
    revalidateCatalog();
    return NextResponse.json({ product });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const params = new URL(request.url).searchParams;
    const category = params.get("category")?.trim();
    const id = params.get("id")?.trim();
    if (!category || !id) {
      return NextResponse.json(
        { error: '"category" and "id" are required.' },
        { status: 400 },
      );
    }
    await deleteProduct(category, id);
    revalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
