import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "./whatsapp-icon";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  href: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "whatsapp" | "outline";
  className?: string;
}

/** A WhatsApp CTA rendered as an external link with the brand glyph. */
export function WhatsAppButton({
  href,
  label = "Chat on WhatsApp",
  size = "md",
  variant = "whatsapp",
  className,
}: WhatsAppButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonClasses({ variant, size }), className)}
    >
      <WhatsAppIcon size={size === "sm" ? 16 : 18} />
      {label}
    </a>
  );
}
