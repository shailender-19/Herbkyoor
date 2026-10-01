import { Container } from "@/components/ui/container";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { whatsAppEnquiryUrl } from "@/lib/whatsapp";

export function WhatsAppCta() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-700 to-forest-900 px-6 py-12 text-center text-cream-50 sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-400/10 blur-2xl"
            aria-hidden
          />
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white">
            <WhatsAppIcon size={28} />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-cream-50 text-balance sm:text-3xl">
            Need Help Choosing the Right Product?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream-100/80">
            Talk to our Ayurvedic product experts directly on WhatsApp. Get
            personalised recommendations and place your order in minutes.
          </p>
          <div className="mt-7 flex justify-center">
            <WhatsAppButton
              href={whatsAppEnquiryUrl(
                "I'd like a product recommendation from your Ayurvedic experts.",
              )}
              label="Chat on WhatsApp"
              size="lg"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
