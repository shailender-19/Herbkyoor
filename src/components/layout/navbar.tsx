"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Phone, Search, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SearchBar } from "@/components/common/search-bar";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { whatsAppEnquiryUrl } from "@/lib/whatsapp";
import { mainNav, siteConfig, telHref } from "@/config/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Close any open menus when the route changes (render-time adjustment).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  // Elevate navbar after scrolling a little.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = () => {
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="hidden bg-forest-800 text-cream-100 md:block">
        <Container className="flex h-9 items-center justify-between text-xs">
          <p>
            🌿 Free shipping on orders above{" "}
            {siteConfig.payment.currencySymbol}
            {siteConfig.payment.freeShippingThreshold} · 100% Authentic Ayurveda
          </p>
          <div className="inline-flex items-center gap-3">
            {siteConfig.contact.phones.map((phone, i) => (
              <a
                key={phone}
                href={telHref(phone)}
                className="inline-flex items-center gap-1.5 hover:text-gold-300"
              >
                {i === 0 && <Phone size={13} />} {phone}
              </a>
            ))}
          </div>
        </Container>
      </div>

      <div
        className={cn(
          "border-b border-cream-300/70 bg-cream-50/90 backdrop-blur-md transition-shadow",
          scrolled && "shadow-sm",
        )}
      >
        <Container>
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5"
              aria-label={`${siteConfig.name} home`}
            >
              <Image
                src="/brand/logo-mark.svg"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold text-forest-800">
                  {siteConfig.shortName}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-forest-500">
                  Ayurveda
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="ml-4 hidden items-center gap-1 lg:flex">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-forest-50 text-forest-800"
                      : "text-forest-700 hover:bg-cream-200",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop search */}
            <div className="ml-auto hidden max-w-xs flex-1 md:block">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={submitSearch}
              />
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1 md:ml-2">
              {/* Mobile search toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Toggle search"
                aria-expanded={searchOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full text-forest-700 hover:bg-cream-200 md:hidden"
              >
                <Search size={20} />
              </button>

              {/* WhatsApp CTA (desktop) */}
              <div className="ml-1 hidden lg:block">
                <WhatsAppButton
                  href={whatsAppEnquiryUrl()}
                  label="WhatsApp"
                  size="sm"
                />
              </div>

              {/* Hamburger */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full text-forest-700 hover:bg-cream-200 lg:hidden"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="pb-3 md:hidden">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={submitSearch}
                autoFocus
              />
            </div>
          )}
        </Container>
      </div>

      {/* Mobile menu panel */}
      <div
        className={cn(
          "overflow-hidden border-b border-cream-300 bg-cream-50 lg:hidden",
          menuOpen ? "max-h-96" : "max-h-0",
          "transition-[max-height] duration-300 ease-out",
        )}
      >
        <Container className="py-3">
          <nav className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-forest-50 text-forest-800"
                    : "text-forest-700 hover:bg-cream-200",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2">
              <WhatsAppButton
                href={whatsAppEnquiryUrl()}
                label="Chat on WhatsApp"
                className="w-full"
              />
            </div>
          </nav>
        </Container>
      </div>
    </header>
  );
}
