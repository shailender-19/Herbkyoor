import { Leaf } from "lucide-react";
import { Link } from "@/components/ui/link";
import { Container } from "@/components/ui/container";
import { buttonClasses } from "@/components/ui/button";
import { useSeo } from "@/lib/use-seo";

export default function NotFoundPage() {
  useSeo({ title: "Page Not Found", noindex: true });
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-50 text-forest-500">
        <Leaf size={30} />
      </span>
      <p className="mt-6 font-display text-6xl font-bold text-forest-800">404</p>
      <h1 className="mt-2 text-2xl font-bold text-forest-800">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-forest-700/60">
        The page you&apos;re looking for may have moved or no longer exists.
        Let&apos;s get you back to wellness.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonClasses({ variant: "primary", size: "lg" })}>
          Back to Home
        </Link>
        <Link
          href="/products"
          className={buttonClasses({ variant: "outline", size: "lg" })}
        >
          Browse Products
        </Link>
      </div>
    </Container>
  );
}
