"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, PackageSearch, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SearchBar } from "@/components/common/search-bar";
import { Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { ProductGrid } from "@/components/products/product-grid";
import { EmptyState } from "@/components/ui/states";
import type { Category, Product } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

const priceRanges = [
  { id: "all", label: "All Prices", test: () => true },
  { id: "u200", label: "Under ₹200", test: (p: Product) => p.price < 200 },
  {
    id: "200-400",
    label: "₹200 – ₹400",
    test: (p: Product) => p.price >= 200 && p.price <= 400,
  },
  {
    id: "400-600",
    label: "₹400 – ₹600",
    test: (p: Product) => p.price > 400 && p.price <= 600,
  },
  { id: "600p", label: "Above ₹600", test: (p: Product) => p.price > 600 },
] as const;

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "rating", label: "Top Rated" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "discount", label: "Biggest Discount" },
] as const;

type SortId = (typeof sortOptions)[number]["id"];

function discountOf(p: Product) {
  return p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0;
}

export function ProductsExplorer({
  products: allProducts,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlCategory: string = searchParams.get("category") ?? "all";
  const urlSearch = searchParams.get("search") ?? "";

  const [query, setQuery] = useState(urlSearch);
  const [priceId, setPriceId] = useState<string>("all");
  const [sort, setSort] = useState<SortId>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Keep the search input in sync if the URL changes externally (e.g. navbar)
  // using a render-time adjustment rather than an effect.
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setQuery(urlSearch);
  }

  // Debounce writing the search term back to the URL for shareable links.
  const debounceRef = useRef<number | undefined>(undefined);
  const pushParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onSearchChange = (val: string) => {
    setQuery(val);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => pushParam("search", val), 300);
  };

  const setCategory = (slug: string) => pushParam("category", slug);

  // Reset to first page whenever the effective filters change (render-time).
  const filterSig = `${urlCategory}|${urlSearch}|${priceId}|${sort}|${inStockOnly}`;
  const [prevSig, setPrevSig] = useState(filterSig);
  if (filterSig !== prevSig) {
    setPrevSig(filterSig);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = urlSearch.trim().toLowerCase();
    const range = priceRanges.find((r) => r.id === priceId) ?? priceRanges[0];

    const list = allProducts.filter((p) => {
      if (urlCategory !== "all" && p.category !== urlCategory) return false;
      if (inStockOnly && !p.inStock) return false;
      // Only constrain by price when a product actually has a price set.
      // Products awaiting pricing (price <= 0) stay visible so the price
      // filter never empties the catalogue and hides pagination.
      if (p.price > 0 && !range.test(p)) return false;
      if (q) {
        const haystack =
          `${p.name} ${p.categoryName} ${p.shortDescription}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating;
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "discount":
          return discountOf(b) - discountOf(a);
        default:
          return (
            Number(b.featured ?? false) - Number(a.featured ?? false) ||
            b.rating - a.rating
          );
      }
    });
    return sorted;
  }, [allProducts, urlCategory, urlSearch, priceId, sort, inStockOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCategoryName =
    urlCategory === "all"
      ? "All Products"
      : (categories.find((c) => c.slug === urlCategory)?.name ?? "Products");

  const filtersPanel = (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-800">
          Categories
        </h3>
        <ul className="space-y-1">
          <li>
            <FilterRadio
              name="category"
              checked={urlCategory === "all"}
              onChange={() => setCategory("all")}
              label="All Products"
              count={allProducts.length}
            />
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <FilterRadio
                name="category"
                checked={urlCategory === c.slug}
                onChange={() => setCategory(c.slug)}
                label={c.name}
                count={allProducts.filter((p) => p.category === c.slug).length}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-800">
          Price
        </h3>
        <ul className="space-y-1">
          {priceRanges.map((r) => (
            <li key={r.id}>
              <FilterRadio
                name="price"
                checked={priceId === r.id}
                onChange={() => setPriceId(r.id)}
                label={r.label}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-800">
          Availability
        </h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-forest-700">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-cream-400 text-forest-600 focus:ring-forest-400"
          />
          In stock only
        </label>
      </div>
    </div>
  );

  return (
    <Container className="py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{activeCategoryName}</h1>
        <p className="mt-2 text-forest-700/60">
          Authentic Ayurvedic products for everyday wellness.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar value={query} onChange={onSearchChange} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-cream-300 px-4 text-sm font-medium text-forest-700 hover:bg-cream-200 lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <div className="min-w-0 flex-1 sm:min-w-[11rem] sm:flex-none">
            <Select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  Sort: {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 rounded-2xl border border-cream-300 bg-cream-50 p-5">
            {filtersPanel}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-forest-700/60">
            Showing{" "}
            <span className="font-semibold text-forest-800">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "product" : "products"}
          </p>

          {pageItems.length > 0 ? (
            <>
              <ProductGrid products={pageItems} />
              <div className="mt-10">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon={<PackageSearch size={28} />}
              title="No products found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={{ label: "Clear filters", href: "/products" }}
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-cream-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-forest-800">Filters</h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
                className="rounded-full p-1.5 text-forest-700 hover:bg-cream-200"
              >
                <X size={20} />
              </button>
            </div>
            {filtersPanel}
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="mt-6 h-12 w-full rounded-full bg-forest-700 font-medium text-cream-50"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}

function FilterRadio({
  name,
  checked,
  onChange,
  label,
  count,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors",
        checked
          ? "bg-forest-50 font-medium text-forest-800"
          : "text-forest-700 hover:bg-cream-200",
      )}
    >
      <span className="flex items-center gap-2.5">
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 border-cream-400 text-forest-600 focus:ring-forest-400"
        />
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-forest-700/45">{count}</span>
      )}
    </label>
  );
}
