import { Link } from "@/components/ui/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonClasses } from "@/components/ui/button";
import { ProductSlider } from "@/components/products/product-slider";
import { ProductCardSkeleton } from "@/components/ui/states";
import { getFeaturedProducts } from "@/data/products";
import { useAsync } from "@/hooks/use-async";

export function FeaturedProducts() {
  const { data, loading } = useAsync(() => getFeaturedProducts(), []);
  const products = data ?? [];
  return (
    <section className="bg-forest-50/40 py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Bestsellers"
            title="Featured Products"
            description="Handpicked favourites our customers reorder again and again — trusted for their quality and real results."
            className="mx-0"
          />
          <Link
            href="/products"
            className={buttonClasses({
              variant: "outline",
              size: "md",
              className: "shrink-0",
            })}
          >
            View All Products
          </Link>
        </div>
        <div className="mt-10">
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <ProductSlider products={products} />
          )}
        </div>
      </Container>
    </section>
  );
}
