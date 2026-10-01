import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryCard } from "@/components/products/category-card";
import { Reveal } from "@/components/common/reveal";
import { getCategories } from "@/data/categories";
import { useAsync } from "@/hooks/use-async";
import { Skeleton } from "@/components/ui/states";

export function CategoriesSection() {
  const { data, loading } = useAsync(() => getCategories(), []);
  const categories = data ?? [];
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Shop by Category"
          title="Explore Our Ayurvedic Range"
          description="From time-tested herbal medicines to everyday wellness essentials, find exactly what your body needs."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {loading && categories.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3]" />
              ))
            : categories.map((category, i) => (
                <Reveal key={category.slug} delay={i * 60}>
                  <CategoryCard category={category} />
                </Reveal>
              ))}
        </div>
      </Container>
    </section>
  );
}
