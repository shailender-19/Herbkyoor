import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

/**
 * Build a `wa.me` deep link for a pre-filled WhatsApp message.
 * The destination number always comes from centralized site config.
 */
export function buildWhatsAppUrl(message: string): string {
  const number = siteConfig.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Generic enquiry link (e.g. "Chat with us"). */
export function whatsAppEnquiryUrl(
  context = "I have a question about your Ayurvedic products.",
): string {
  return buildWhatsAppUrl(
    `Hello ${siteConfig.name} 👋\n\n${context}`,
  );
}

/** Order a single product with a chosen quantity. */
export function productOrderUrl(product: Product, quantity = 1): string {
  const message = [
    `Hello ${siteConfig.name} 👋`,
    "",
    "I would like to order:",
    "",
    `*Product:* ${product.name}`,
    `*Quantity:* ${quantity}`,
    `*Price:* ${formatPrice(product.price)}`,
    "",
    "Please share the availability and delivery details.",
  ].join("\n");
  return buildWhatsAppUrl(message);
}

