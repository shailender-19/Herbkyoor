/**
 * A product category slug used across data and routing.
 *
 * Categories are now data-driven — derived from the keys of
 * `public/ProductDetails/Product_list.json` — so this is a plain string
 * rather than a fixed union. Known slugs are documented in `data/categories.ts`.
 */
export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  /** Lucide icon name rendered dynamically. */
  icon: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  /** Human-readable category label, denormalized for convenience. */
  categoryName: string;
  shortDescription: string;
  description: string;
  price: number;
  /** Original / MRP price. When present and greater than `price`, a discount is shown. */
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  /** Pack sizes / variants available for this product. */
  sizes?: string[];
  /** Promotional scheme, e.g. "Buy 1 Get 1", "10% cashback". */
  scheme?: string;
  ingredients?: string[];
  benefits?: string[];
  usage?: string;
  /** Additional key/value specs shown on the detail page. */
  info?: Record<string, string>;
  inStock: boolean;
  /** Marks products surfaced in the "Featured" home section. */
  featured?: boolean;
  /** Optional promotional tag, e.g. "Bestseller", "New". */
  tag?: string;
}
