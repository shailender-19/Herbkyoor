import type { Category } from "@/types";
import { request, resolveAssetPath } from "./client";

/**
 * Public category read endpoint (PHP). Returns categories with a `productCount`
 * (see API_REQUIREMENTS.md §A5). The extra field is ignored by the UI, which
 * only needs the `Category` fields.
 */
export function fetchCategories(): Promise<Category[]> {
  return request<{ categories: Category[] }>(`/categories/list.php`).then(
    (r) =>
      (r.categories ?? []).map((c) => ({
        ...c,
        image: resolveAssetPath(c.image),
      })),
  );
}
