import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { Leaf, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { whatsAppEnquiryUrl } from "@/lib/whatsapp";

const trustPoints = [
  { icon: Leaf, label: "100% Natural" },
  { icon: ShieldCheck, label: "Quality Assured" },
  { icon: Truck, label: "Fast Delivery" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 to-cream-50">
      {/* Soft decorative blobs */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-blob-1 rounded-full bg-forest-100/60 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 animate-blob-2 rounded-full bg-gold-300/20 blur-3xl"
        aria-hidden
      />

      <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        {/* Copy */}
        <div className="animate-fade-in text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-cream-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-forest-600">
            <Leaf size={14} className="text-forest-500" />
            Rooted in Ancient Wisdom
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[1.1] text-balance text-forest-900 sm:text-5xl lg:text-6xl">
            Natural Wellness,{" "}
            <span className="text-forest-600">Trusted Ayurveda</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-forest-700/70 lg:mx-0 lg:text-lg">
            Genuine Ayurvedic medicines, herbal supplements and daily-care
            essentials — sourced from trusted makers and time-tested
            formulations, so authentic wellness fits naturally into your
            everyday routine.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/products"
              className={buttonClasses({
                variant: "primary",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              Shop Products
            </Link>
            <WhatsAppButton
              href={whatsAppEnquiryUrl()}
              label="WhatsApp Us"
              size="lg"
              className="w-full sm:w-auto"
            />
          </div>

          <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
            {trustPoints.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm font-medium text-forest-700"
              >
                <Icon size={18} className="text-forest-500" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual */}
        <div className="relative animate-scale-in">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-cream-300 shadow-xl">
            <Image
              src="/product_images/Health/Health_moringa.jpeg"
              alt="Authentic Ayurvedic Moringa tablets from our wellness range"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover"
            />
          </div>

          {/* Floating stat cards */}
          <div className="absolute -left-3 top-8 hidden animate-slide-up rounded-2xl border border-cream-300 bg-cream-50/95 px-4 py-3 shadow-lg backdrop-blur sm:block">
            <p className="text-2xl font-bold text-forest-800">20k+</p>
            <p className="text-xs text-forest-700/60">Happy Customers</p>
          </div>
          <div className="absolute -right-3 bottom-10 hidden animate-slide-up rounded-2xl border border-cream-300 bg-cream-50/95 px-4 py-3 shadow-lg backdrop-blur sm:block">
            <p className="text-2xl font-bold text-forest-800">100%</p>
            <p className="text-xs text-forest-700/60">Authentic Herbs</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
