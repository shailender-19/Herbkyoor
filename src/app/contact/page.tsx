import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/common/page-header";
import { ContactForm } from "@/components/forms/contact-form";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { whatsAppEnquiryUrl } from "@/lib/whatsapp";
import { siteConfig, telHref } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.name}. Visit our store, call, email or chat with our Ayurvedic experts on WhatsApp.`,
};

const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
  siteConfig.contact.mapQuery,
)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We'd Love to Hear From You"
        description="Questions about a product, an order, or your wellness routine? Our team is here to help."
      />

      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold">Get in Touch</h2>
            <p className="mt-2 text-forest-700/70">
              Reach us through any of the channels below. We typically respond
              within one business day.
            </p>

            <ul className="mt-8 space-y-4">
              <InfoRow icon={<MapPin size={20} />} title="Visit Our Store">
                {siteConfig.contact.address}
              </InfoRow>
              <InfoRow icon={<Phone size={20} />} title="Call Us">
                {siteConfig.contact.phones.map((phone) => (
                  <a
                    key={phone}
                    href={telHref(phone)}
                    className="block hover:text-forest-700"
                  >
                    {phone}
                  </a>
                ))}
              </InfoRow>
              <InfoRow icon={<Mail size={20} />} title="Email Us">
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-forest-700"
                >
                  {siteConfig.contact.email}
                </a>
              </InfoRow>
              <InfoRow icon={<Clock size={20} />} title="Business Hours">
                {siteConfig.contact.hours.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </InfoRow>
            </ul>

            <div className="mt-8 rounded-2xl border border-forest-200 bg-forest-50 p-5">
              <p className="flex items-center gap-2 font-semibold text-forest-800">
                <WhatsAppIcon size={18} className="text-[#25D366]" /> Prefer
                WhatsApp?
              </p>
              <p className="mt-1 text-sm text-forest-700/70">
                Chat with our Ayurvedic experts for instant help and quick
                orders.
              </p>
              <WhatsAppButton
                href={whatsAppEnquiryUrl()}
                label="Chat on WhatsApp"
                className="mt-4"
              />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-bold">Send a Message</h2>
            <ContactForm />
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-cream-300">
          <iframe
            title={`Map showing ${siteConfig.name} location`}
            src={mapSrc}
            width="100%"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[320px] w-full sm:h-[400px]"
          />
        </div>
      </Container>
    </>
  );
}

function InfoRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
        {icon}
      </span>
      <div>
        <h3 className="font-semibold text-forest-800">{title}</h3>
        <p className="mt-0.5 text-forest-700/70">{children}</p>
      </div>
    </li>
  );
}
