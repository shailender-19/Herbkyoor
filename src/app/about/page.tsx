import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  HeartHandshake,
  Leaf,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/common/reveal";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { whatsAppEnquiryUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn the story, mission and values behind ${siteConfig.name} — bringing authentic Ayurveda to modern wellness.`,
};

const stats = [
  { value: "5000+", label: "Years of Ayurvedic Wisdom" },
  { value: "20k+", label: "Happy Customers" },
  { value: "100+", label: "Authentic Products" },
  { value: "4.8★", label: "Average Rating" },
];

const values = [
  {
    icon: Leaf,
    title: "Authenticity First",
    text: "Every product stays true to traditional Ayurvedic formulations and sourcing.",
  },
  {
    icon: Award,
    title: "Quality Commitment",
    text: "Rigorous checks for purity and potency before anything reaches you.",
  },
  {
    icon: HeartHandshake,
    title: "Customer-First",
    text: "Honest guidance and friendly support at every step of your journey.",
  },
  {
    icon: Sparkles,
    title: "Trusted Products",
    text: "Loved and recommended by thousands of families across the country.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Ayurveda, Made for Modern Life"
        description={`${siteConfig.name} was born from a simple belief — that the timeless wisdom of Ayurveda belongs in every home, every day.`}
      />

      {/* Story */}
      <Container className="py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto aspect-[5/4] w-full max-w-lg overflow-hidden rounded-[2rem] border border-cream-300 shadow-lg">
              <Image
                src="/misc/about-story.svg"
                alt="Traditional Ayurvedic herbs and preparation"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <h2 className="text-3xl font-bold">Our Story</h2>
              <div className="mt-4 space-y-4 text-forest-700/75">
                <p>
                  What began as a small family apothecary has grown into a
                  trusted destination for authentic Ayurvedic wellness. Rooted
                  in generations of knowledge, we set out to make genuine,
                  high-quality herbal products accessible to everyone.
                </p>
                <p>
                  We work closely with trusted makers and follow time-tested
                  formulations — so every jar, bottle and pouch carries the
                  integrity of true Ayurveda, with none of the compromise.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Stats */}
      <section className="bg-forest-900 py-14 text-cream-50">
        <Container>
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-bold text-gold-400 sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-cream-100/70">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <Container className="py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-cream-300 bg-cream-50 p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                <Target size={24} />
              </span>
              <h3 className="mt-5 text-2xl font-bold">Our Mission</h3>
              <p className="mt-3 text-forest-700/75">
                To make authentic Ayurveda simple, trustworthy and part of
                everyday life — helping people care for their health the natural
                way, without confusion or compromise.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-cream-300 bg-cream-50 p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                <Users size={24} />
              </span>
              <h3 className="mt-5 text-2xl font-bold">Our Vision</h3>
              <p className="mt-3 text-forest-700/75">
                A world where ancient wisdom and modern living go hand in hand —
                where natural, holistic wellness is the first choice, not the
                last resort, for families everywhere.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Why Ayurveda */}
      <section className="bg-forest-50/40 py-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <h2 className="text-3xl font-bold">Why Ayurveda?</h2>
                <p className="mt-4 text-forest-700/75">
                  Ayurveda — the &ldquo;science of life&rdquo; — is one of the
                  world&apos;s oldest holistic healing systems. Rather than
                  treating symptoms alone, it focuses on balance: of body, mind
                  and spirit.
                </p>
                <p className="mt-3 text-forest-700/75">
                  Its gentle, natural approach has supported wellbeing for over
                  5,000 years. We bring that philosophy to life with products
                  you can trust and a routine that feels effortless.
                </p>
                <Link
                  href="/products"
                  className={buttonClasses({
                    variant: "primary",
                    size: "lg",
                    className: "mt-7",
                  })}
                >
                  Explore Our Products
                </Link>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="relative mx-auto aspect-[5/4] w-full max-w-lg overflow-hidden rounded-[2rem] border border-cream-300 shadow-lg">
                <Image
                  src="/misc/about-mission.svg"
                  alt="Balance and natural wellness in Ayurveda"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Values */}
      <Container className="py-16">
        <SectionHeading
          eyebrow="What We Stand For"
          title="Our Values"
          description="The principles that guide everything we source, make and share."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="h-full rounded-2xl border border-cream-300 bg-cream-50 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 font-semibold text-forest-900">{title}</h3>
                <p className="mt-2 text-sm text-forest-700/65">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* CTA */}
      <Container className="pb-16">
        <div className="rounded-3xl bg-gradient-to-br from-forest-700 to-forest-900 px-6 py-12 text-center text-cream-50 sm:px-12">
          <h2 className="text-2xl font-bold text-cream-50 sm:text-3xl">
            Begin Your Wellness Journey Today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream-100/80">
            Discover products chosen with care, or talk to our experts for
            personalised guidance.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className={buttonClasses({ variant: "gold", size: "lg" })}
            >
              Shop Products
            </Link>
            <WhatsAppButton
              href={whatsAppEnquiryUrl()}
              label="Talk to an Expert"
              size="lg"
            />
          </div>
        </div>
      </Container>
    </>
  );
}
