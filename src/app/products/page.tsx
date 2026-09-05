import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsExplorer } from "@/components/products/products-explorer";
import { Container } from "@/components/ui/container";
import { ProductCardSkeleton } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Ayurvedic Products",
  description:
    "Browse our full range of authentic Ayurvedic products — herbal medicines, oils, skincare, immunity boosters and more. Search, filter and order easily.",
};

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
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsExplorer />
    </Suspense>
  );
}
