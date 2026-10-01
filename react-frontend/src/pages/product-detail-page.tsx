import { useParams } from "react-router-dom";
import {
  Check,
  ChevronRight,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link } from "@/components/ui/link";
import { Container } from "@/components/ui/container";
import { PriceDisplay } from "@/components/ui/price";
import { ProductRating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { Spinner } from "@/components/ui/states";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductActions } from "@/components/products/product-actions";
import { ProductSlider } from "@/components/products/product-slider";
import { getProductBySlug, getRelatedProducts } from "@/data/products";
import { useAsync } from "@/hooks/use-async";
import { discountPercent } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { useSeo } from "@/lib/use-seo";
import NotFoundPage from "./not-found-page";

const trustBadges = [
  { icon: Leaf, label: "100% Natural" },
  { icon: ShieldCheck, label: "Quality Assured" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: PackageCheck, label: "Easy Returns" },
];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, loading, error } = useAsync(async () => {
    const product = await getProductBySlug(slug ?? "");
    if (!product) return { product: null, related: [] };
    const related = await getRelatedProducts(product);
    return { product, related };
  }, [slug]);

  const product = data?.product ?? null;

  useSeo({
    title: product?.name,
    description: product?.shortDescription,
    canonical: product ? `/products/${product.slug}` : undefined,
    image: product?.image,
  });

  if (loading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold text-forest-800">
          Couldn&apos;t load this product
        </h1>
        <p className="mt-2 max-w-md text-forest-700/60">{error}</p>
        <Link
          href="/products"
          className="mt-6 rounded-full bg-forest-700 px-6 py-2.5 text-sm font-medium text-cream-50"
        >
          Back to Products
        </Link>
      </Container>
    );
  }

  if (!product) return <NotFoundPage />;

  const related = data?.related ?? [];
  const discount = product.originalPrice
    ? discountPercent(product.originalPrice, product.price)
    : 0;

  // Product structured data for SEO. URLs are absolute so validators accept
  // the image and offer.
  const base = siteConfig.url.replace(/\/$/, "");
  const productUrl = `${base}/products/${product.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${base}${product.image}`,
    sku: product.id,
    category: product.categoryName,
    url: productUrl,
    brand: { "@type": "Brand", name: siteConfig.name },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.price,
      priceCurrency: siteConfig.payment.currency,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-forest-700/60">
            <li>
              <Link href="/" className="hover:text-forest-700">
                Home
              </Link>
            </li>
            <ChevronRight size={14} aria-hidden />
            <li>
              <Link href="/products" className="hover:text-forest-700">
                Products
              </Link>
            </li>
            <ChevronRight size={14} aria-hidden />
            <li>
              <Link
                href={`/products?category=${product.category}`}
                className="hover:text-forest-700"
              >
                {product.categoryName}
              </Link>
            </li>
            <ChevronRight size={14} aria-hidden />
            <li className="font-medium text-forest-800">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery product={product} />

          <div>
            <span className="text-sm font-medium uppercase tracking-wide text-forest-500">
              {product.categoryName}
            </span>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <ProductRating
                value={product.rating}
                reviewCount={product.reviewCount}
                size="md"
              />
              {product.inStock ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-forest-600">
                  <Check size={16} /> In Stock
                </span>
              ) : (
                <Badge tone="danger">Out of Stock</Badge>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <PriceDisplay
                price={product.price}
                originalPrice={product.originalPrice}
                size="lg"
              />
              {discount > 0 && <Badge tone="discount">Save {discount}%</Badge>}
            </div>
            <p className="mt-1 text-xs text-forest-700/50">
              Inclusive of all taxes
            </p>

            <p className="mt-5 leading-relaxed text-forest-700/75">
              {product.description}
            </p>

            <div className="mt-7">
              <ProductActions product={product} />
            </div>

            {/* Trust badges */}
            <ul className="mt-7 grid grid-cols-2 gap-3 rounded-2xl border border-cream-300 bg-cream-100/60 p-4 sm:grid-cols-4">
              {trustBadges.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center text-xs font-medium text-forest-700"
                >
                  <Icon size={20} className="text-forest-500" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Details */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {product.benefits && product.benefits.length > 0 && (
            <DetailCard icon={<Sparkles size={18} />} title="Key Benefits">
              <ul className="space-y-2.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm text-forest-700/80">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-forest-500"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </DetailCard>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <DetailCard icon={<Leaf size={18} />} title="Ingredients">
              <ul className="space-y-2 text-sm text-forest-700/80">
                {product.ingredients.map((ing) => (
                  <li key={ing} className="flex gap-2">
                    <span className="text-forest-400">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </DetailCard>
          )}

          <DetailCard icon={<PackageCheck size={18} />} title="How to Use">
            {product.usage && (
              <p className="text-sm leading-relaxed text-forest-700/80">
                {product.usage}
              </p>
            )}
            {product.info && (
              <dl className="mt-4 space-y-2 border-t border-cream-300 pt-4 text-sm">
                {Object.entries(product.info).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-forest-700/60">{k}</dt>
                    <dd className="font-medium text-forest-800">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </DetailCard>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <SectionHeading
              align="left"
              eyebrow="You may also like"
              title="Related Products"
              className="mx-0"
            />
            <div className="mt-8">
              <ProductSlider products={related} />
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

function DetailCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-cream-300 bg-cream-50 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-forest-800">
        <span className="text-forest-500">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}
