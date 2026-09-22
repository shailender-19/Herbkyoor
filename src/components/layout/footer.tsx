import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/common/social-icons";
import { getCategories } from "@/data/categories";
import { mainNav, siteConfig, telHref } from "@/config/site";
import { whatsAppEnquiryUrl } from "@/lib/whatsapp";

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="mt-20 bg-forest-900 text-cream-100">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/brand/logo-mark.svg"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold text-cream-50">
                  {siteConfig.shortName}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-400">
                  Ayurveda
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-cream-100/70">
              Authentic Ayurvedic products, carefully selected to support your
              everyday health and wellness — rooted in ancient wisdom, made for
              modern life.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { Icon: InstagramIcon, href: siteConfig.social.instagram, label: "Instagram" },
                { Icon: FacebookIcon, href: siteConfig.social.facebook, label: "Facebook" },
                { Icon: YoutubeIcon, href: siteConfig.social.youtube, label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream-100 transition-colors hover:bg-forest-700"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream-100/70 transition-colors hover:text-gold-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Product categories">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Categories
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="text-cream-100/70 transition-colors hover:text-gold-300"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream-100/70">
              <li className="flex gap-2.5">
                <MapPin size={17} className="mt-0.5 shrink-0 text-gold-400" />
                <span>{siteConfig.contact.address}</span>
              </li>
              {siteConfig.contact.phones.map((phone, i) => (
                <li key={phone}>
                  <a
                    href={telHref(phone)}
                    className="flex items-center gap-2.5 transition-colors hover:text-gold-300"
                  >
                    <Phone
                      size={17}
                      className={`shrink-0 text-gold-400 ${i > 0 ? "invisible" : ""}`}
                    />
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-2.5 transition-colors hover:text-gold-300"
                >
                  <Mail size={17} className="shrink-0 text-gold-400" />
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsAppEnquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition-colors hover:text-gold-300"
                >
                  <WhatsAppIcon size={17} className="shrink-0 text-gold-400" />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-forest-800 pt-6 text-sm text-cream-100/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
