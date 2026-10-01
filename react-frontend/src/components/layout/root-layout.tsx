import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/common/whatsapp-float";
import { SiteStructuredData } from "@/components/common/structured-data";

/**
 * App shell — the SPA equivalent of the Next.js RootLayout `<body>`. Renders the
 * persistent chrome (skip link, structured data, navbar, footer, WhatsApp float)
 * around the routed page (`<Outlet />`).
 */
export function RootLayout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-forest-800 focus:px-4 focus:py-2 focus:text-cream-50"
      >
        Skip to content
      </a>
      <SiteStructuredData />
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
