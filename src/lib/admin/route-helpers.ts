import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "./auth";
import { CatalogError } from "./catalog";

/**
 * Invalidate every cached route render after a catalogue mutation so the live
 * storefront (home, products list, product detail pages, footer categories)
 * re-reads `Product_list.json` on the next request. Uses the root layout scope,
 * which covers all pages that consume the catalogue.
 */
export function revalidateCatalog(): void {
  revalidatePath("/", "layout");
}

/**
 * Returns a 401 response when the request is not an authenticated admin, or
 * `null` when it is. Use at the top of every mutating admin route handler.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

/** Turn thrown errors (esp. CatalogError) into a JSON response. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof CatalogError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message =
    error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Parse a JSON request body, returning `{}` on empty/invalid input. */
export async function readJson(
  request: Request,
): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
