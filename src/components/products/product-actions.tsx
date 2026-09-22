"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { buttonClasses } from "@/components/ui/button";
import { productOrderUrl } from "@/lib/whatsapp";
import { siteConfig, telHref } from "@/config/site";
import type { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const phones = siteConfig.contact.phones;

  if (!product.inStock) {
    return (
      <div className="rounded-2xl border border-cream-300 bg-cream-100 p-5">
        <p className="font-medium text-forest-800">Currently out of stock</p>
        <p className="mt-1 text-sm text-forest-700/60">
          Message us on WhatsApp to be notified when it&apos;s back.
        </p>
        <WhatsAppButton
          href={productOrderUrl(product, qty)}
          label="Enquire on WhatsApp"
          variant="outline"
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-forest-800">Quantity</span>
        <QuantitySelector value={qty} onChange={setQty} />
      </div>

      <WhatsAppButton
        href={productOrderUrl(product, qty)}
        label="Order on WhatsApp"
        size="lg"
        className="w-full"
      />

      {phones.map((phone) => (
        <a
          key={phone}
          href={telHref(phone)}
          className={buttonClasses({ variant: "outline", size: "lg", className: "w-full" })}
        >
          <Phone size={18} />
          {phones.length > 1 ? `Call ${phone}` : "Call to Order"}
        </a>
      ))}

      <p className="text-center text-xs text-forest-700/50">
        Share your requirement on WhatsApp or call us — our team will confirm
        availability, price and delivery.
      </p>
    </div>
  );
}
