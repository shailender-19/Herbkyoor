import {
  BadgeCheck,
  Leaf,
  ShieldCheck,
  Truck,
  Lock,
  MessageCircle,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/common/reveal";

const features = [
  {
    icon: Leaf,
    title: "Authentic Ayurvedic Products",
    text: "Sourced from trusted makers and traditional formulations you can rely on.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Assured",
    text: "Every product is checked for purity, potency and freshness before dispatch.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Products",
    text: "Loved by thousands of families for everyday health and wellness.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Quick, reliable shipping so your wellness routine never has to pause.",
  },
  {
    icon: Lock,
    title: "Secure Payment",
    text: "Safe, encrypted checkout with multiple trusted payment options.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Support",
    text: "Talk to our Ayurvedic experts directly for guidance and quick orders.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Wellness You Can Trust"
          description="Authentic formulations, careful quality checks and friendly expert support — we make genuine Ayurveda simple and reliable, every single day."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="flex h-full gap-4 rounded-2xl border border-cream-300 bg-cream-50 p-5 transition-colors hover:border-forest-200">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                  <Icon size={22} />
                </span>
                <div>
                  <h3 className="font-semibold text-forest-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-forest-700/65">
                    {text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
