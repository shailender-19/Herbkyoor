import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/common/social-icons";
import { mainNav, siteConfig, telHref } from "@/config/site";
import { whatsAppEnquiryUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-20 bg-forest-900 text-cream-100">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center rounded-xl bg-cream-50 px-3 py-2">
              <Image
                src="/brand/logo.jpeg"
                alt={`${siteConfig.name} logo`}
                width={180}
                height={120}
                className="h-12 w-auto"
              />
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
                  href={`mailto:${siteConfig.contact.jainerEmail}`}
                  className="flex items-center gap-2.5 transition-colors hover:text-gold-300"
                >
                  <Mail size={17} className="shrink-0 text-gold-400" />
                  {siteConfig.contact.jainerEmail}
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
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <span className="inline-flex items-center rounded-lg bg-cream-50 px-2.5 py-1.5">
              <Image
                src="/brand/jainer-healthcare-logo.jpeg"
                alt="Jainer Healthcare logo"
                width={1030}
                height={480}
                className="h-12 w-auto object-contain"
              />
            </span>
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-medium text-cream-100/80">
                Herbskyoor — A Unit of Jainer Healthcare
              </p>
              <p>©️ {new Date().getFullYear()} Jainer Healthcare. All Rights Reserved.</p>
              <p>Mohan Nagar, Ghaziabad, UP. Bharat</p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
