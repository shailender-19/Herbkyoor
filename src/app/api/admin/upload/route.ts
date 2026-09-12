import { NextResponse } from "next/server";
import { saveImage } from "@/lib/admin/upload";
import { requireAuth, toErrorResponse } from "@/lib/admin/route-helpers";

export const runtime = "nodejs";

/** Accept a multipart image upload and store it under public/product_images. */
export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = form.get("folder");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file was uploaded." },
        { status: 400 },
      );
    }
    const path = await saveImage(
      file,
      typeof folder === "string" ? folder : undefined,
    );
    return NextResponse.json({ path });
  } catch (error) {
    return toErrorResponse(error);
  }
}
