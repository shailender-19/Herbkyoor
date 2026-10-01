import { whatsAppEnquiryUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./whatsapp-icon";

/** Persistent floating WhatsApp button (bottom-right on every page). */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsAppEnquiryUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-all hover:bg-[#1ebe5b] hover:shadow-xl sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon size={24} />
      <span className="hidden text-sm font-semibold sm:inline">
        Need help?
      </span>
      <span className="absolute -right-1 -top-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-400" />
      </span>
    </a>
  );
}
