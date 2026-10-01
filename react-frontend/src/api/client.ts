/**
 * Centralized API configuration + fetch helpers.
 *
 * Every network call in the app goes through here so URLs, credentials and
 * error handling live in one place. The backend is the PHP + MariaDB API
 * documented in `API_REQUIREMENTS.md`; this module never talks to a database
 * directly (React → HTTP → PHP → MariaDB).
 */

/** Base URL for the PHP API. Default "/api" (SPA + PHP share one domain). */
export const API_BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(
  /\/$/,
  "",
);

/**
 * When true, PUBLIC catalogue reads come from the bundled JSON snapshot instead
 * of the PHP API — so the storefront works with no backend at all. Admin CRUD
 * and the contact/newsletter forms ALWAYS use the API regardless of this flag.
 * Default: true (opt out with VITE_USE_STATIC_DATA=false).
 */
export const USE_STATIC_DATA =
  (import.meta.env.VITE_USE_STATIC_DATA ?? "true").toLowerCase() !== "false";

/** Thrown by `request()` for any non-2xx response. */
export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(status: number, message: string, data: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function url(path: string): string {
  return path.startsWith("http")
    ? path
    : `${API_BASE}/${path.replace(/^\//, "")}`;
}

/**
 * Normalize an image path returned by the PHP API onto the React app's public
 * asset layout. The backend stores paths in the legacy HTML frontend's layout
 * (`assets/images/product_images/…`, `uploads/products/…`, no leading slash);
 * this app serves its bundled images at `/product_images/…`, `/categories/…`.
 *
 * Rules (idempotent — a no-op for already-correct `/product_images/…` paths, so
 * static-data mode is unaffected):
 *   - leave absolute URLs (http(s), data:) untouched;
 *   - drop a leading `assets/images/` prefix;
 *   - guarantee a leading `/` so the URL resolves from the web root, not the
 *     current route.
 *
 * NOTE: admin-uploaded images resolve to `/uploads/products/…` — ensure the PHP
 * `uploads/` directory is web-served at that path on the shared host (or set the
 * backend `upload_url_base` to `product_images`). See DEPLOYMENT.md.
 */
export function resolveAssetPath(path?: string | null): string {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  const cleaned = path.replace(/^\/+/, "").replace(/^assets\/images\//, "");
  return `/${cleaned}`;
}

/**
 * JSON request that THROWS `ApiError` on failure — use for public reads where a
 * caller wants a resolved value or an exception (feeds loading/error states).
 */
export async function request<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url(path), {
      credentials: "same-origin",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "Network error — please check your connection.", {});
  }

  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* empty / non-JSON body */
  }

  if (!res.ok) {
    const message =
      (data.error as string) ||
      (data.message as string) ||
      `Request failed (${res.status}).`;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

/**
 * Non-throwing request returning `{ ok, status, data }` — mirrors the helper the
 * admin panel already used, so admin call sites port with minimal change.
 */
export async function call(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  try {
    const res = await fetch(url(path), {
      credentials: "same-origin",
      ...init,
      headers: {
        ...(init?.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...(init?.headers ?? {}),
      },
    });
    let data: Record<string, unknown> = {};
    try {
      data = await res.json();
    } catch {
      /* empty body */
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Network error." } };
  }
}
