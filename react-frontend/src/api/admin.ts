import { call } from "./client";

/**
 * Admin API — maps the panel's logical operations onto the PHP endpoints
 * (see API_REQUIREMENTS.md §B–F). Every call returns the non-throwing
 * `{ ok, status, data }` shape the admin UI consumes, and carries the session
 * cookie automatically (`credentials: "same-origin"`). These ALWAYS hit the
 * PHP backend — there is no static fallback for writes.
 */

type Result = { ok: boolean; status: number; data: Record<string, unknown> };
type Json = Record<string, unknown>;

export const adminApi = {
  session: (): Promise<Result> => call("/admin/session.php"),

  login: (body: { username: string; password: string }): Promise<Result> =>
    call("/admin/login.php", { method: "POST", body: JSON.stringify(body) }),

  logout: (): Promise<Result> => call("/admin/logout.php", { method: "POST" }),

  catalog: (): Promise<Result> => call("/admin/catalog.php"),

  createProduct: (product: Json): Promise<Result> =>
    call("/admin/products/create.php", {
      method: "POST",
      body: JSON.stringify(product),
    }),

  updateProduct: (payload: {
    category: string;
    id: string;
    product: Json;
  }): Promise<Result> =>
    call("/admin/products/update.php", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteProduct: (category: string, id: string): Promise<Result> =>
    call(
      `/admin/products/delete.php?category=${encodeURIComponent(
        category,
      )}&id=${encodeURIComponent(id)}`,
      { method: "POST" },
    ),

  createCategory: (payload: Json): Promise<Result> =>
    call("/admin/categories/create.php", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCategory: (payload: Json): Promise<Result> =>
    call("/admin/categories/update.php", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteCategory: (slug: string): Promise<Result> =>
    call(`/admin/categories/delete.php?slug=${encodeURIComponent(slug)}`, {
      method: "POST",
    }),

  // ---- Contact messages (user enquiries) --------------------------------
  messages: (): Promise<Result> => call("/admin/messages/list.php"),

  markMessage: (id: number, read: boolean): Promise<Result> =>
    call("/admin/messages/mark.php", {
      method: "POST",
      body: JSON.stringify({ id, read }),
    }),

  deleteMessage: (id: number): Promise<Result> =>
    call(`/admin/messages/delete.php?id=${encodeURIComponent(id)}`, {
      method: "POST",
    }),

  /**
   * Upload one image via multipart/form-data. Do NOT set Content-Type — the
   * browser adds the multipart boundary. `folder` is the target subfolder
   * (the admin UI passes the category slug).
   */
  upload: (file: File, folder: string): Promise<Result> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder || "misc");
    return call("/admin/upload.php", { method: "POST", body: fd });
  },
};
