import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryCard } from "@/components/products/category-card";
import { Reveal } from "@/components/common/reveal";
import { getCategories } from "@/data/categories";

export async function CategoriesSection() {
  const categories = await getCategories();
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Shop by Category"
          title="Explore Our Ayurvedic Range"
          description="From time-tested herbal medicines to everyday wellness essentials, find exactly what your body needs."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, i) => (
            <Reveal key={category.slug} delay={i * 60}>
              <CategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
