import type { Product } from "@/types";
import { request, resolveAssetPath } from "./client";

/** Map API image paths onto the app's public asset layout (see resolveAssetPath). */
function normalizeImages(p: Product): Product {
  const images = p.images?.map(resolveAssetPath);
  return {
    ...p,
    image: resolveAssetPath(p.image),
    ...(images ? { images } : {}),
  };
}

/**
 * Public product read endpoints (PHP). These return the ALREADY-NORMALIZED
 * product shape (see API_REQUIREMENTS.md §A), identical to what the static
 * normalizer produces — so callers are agnostic to the data source.
 */

export function fetchProducts(params?: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params?.category && params.category !== "all")
    qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  return request<{ products: Product[] }>(
    `/products/list.php${query ? `?${query}` : ""}`,
  ).then((r) => (r.products ?? []).map(normalizeImages));
}

export function fetchProduct(slug: string): Promise<Product | undefined> {
  return request<{ product: Product }>(
    `/products/get.php?slug=${encodeURIComponent(slug)}`,
  )
    .then((r) => (r.product ? normalizeImages(r.product) : undefined))
    .catch(() => undefined);
}

export function fetchFeatured(): Promise<Product[]> {
  return request<{ products: Product[] }>(`/products/featured.php`).then(
    (r) => (r.products ?? []).map(normalizeImages),
  );
}

export function fetchRelated(slug: string, limit = 4): Promise<Product[]> {
  return request<{ products: Product[] }>(
    `/products/related.php?slug=${encodeURIComponent(slug)}&limit=${limit}`,
  ).then((r) => (r.products ?? []).map(normalizeImages));
}
