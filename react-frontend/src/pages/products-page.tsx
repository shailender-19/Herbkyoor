import { PackageX } from "lucide-react";
import { ProductsExplorer } from "@/components/products/products-explorer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/states";
import { getAllProducts } from "@/data/products";
import { getCategories } from "@/data/categories";
import { useAsync } from "@/hooks/use-async";
import { useSeo } from "@/lib/use-seo";

function ProductsFallback() {
  return (
    <Container className="py-10">
      <div className="mb-6 h-9 w-56 animate-pulse rounded-lg bg-cream-200" />
      <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}

export default function ProductsPage() {
  useSeo({
    title: "Ayurvedic Products",
    description:
      "Browse our full range of authentic Ayurvedic products — herbal medicines, oils, skincare, immunity boosters and more. Search, filter and order easily.",
    canonical: "/products",
  });

  const { data, loading, error, reload } = useAsync(
    () => Promise.all([getAllProducts(), getCategories()]),
    [],
  );

  if (loading) return <ProductsFallback />;

  if (error) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-500">
          <PackageX size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-forest-800">
          Couldn&apos;t load products
        </h1>
        <p className="mt-2 max-w-md text-forest-700/60">{error}</p>
        <Button className="mt-6" onClick={reload}>
          Try Again
        </Button>
      </Container>
    );
  }

  const [products, categories] = data ?? [[], []];
  return <ProductsExplorer products={products} categories={categories} />;
}
