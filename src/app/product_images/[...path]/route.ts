import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Serves images from `public/product_images` at request time.
 *
 * Next.js only serves files that exist in `public/` at build/start time, so
 * admin-uploaded images added while the server is running would otherwise 404
 * in production. Files that existed at build are still served by the static
 * layer (which runs before this route); this handler is the fallback that
 * streams newly-uploaded files from disk. Path traversal is blocked by
 * confining reads to the images root.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGES_ROOT = path.join(process.cwd(), "public", "product_images");

const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  ctx: RouteContext<"/product_images/[...path]">,
) {
  const { path: segments } = await ctx.params;
  const rel = (Array.isArray(segments) ? segments : [segments])
    .map((s) => decodeURIComponent(s))
    .join("/");

  const filePath = path.normalize(path.join(IMAGES_ROOT, rel));
  if (filePath !== IMAGES_ROOT && !filePath.startsWith(IMAGES_ROOT + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  const type = CONTENT_TYPE[path.extname(filePath).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(filePath);
    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
