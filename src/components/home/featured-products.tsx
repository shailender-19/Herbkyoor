import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonClasses } from "@/components/ui/button";
import { ProductSlider } from "@/components/products/product-slider";
import { getFeaturedProducts } from "@/data/products";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  return (
    <section className="bg-forest-50/40 py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Bestsellers"
            title="Featured Products"
            description="Handpicked favourites loved by our community for their quality and results."
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
          <ProductSlider products={products} />
        </div>
      </Container>
    </section>
  );
}
