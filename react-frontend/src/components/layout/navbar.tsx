
import { useEffect, useState } from "react";
import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SearchBar } from "@/components/common/search-bar";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { whatsAppEnquiryUrl } from "@/lib/whatsapp";
import { getCategories } from "@/data/categories";
import { mainNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const FALLBACK_SEARCH_HINTS = [
  "Search for thyroid care",
  "Search for liver care",
  "Search for heart care",
  "Search for kidney care",
  "Search for knee & joint pain",
  "Search for sexual wellness",
];

export function Navbar() {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchHints, setSearchHints] = useState<string[]>(
    FALLBACK_SEARCH_HINTS,
  );

  // Build rotating search placeholders from the live category list.
  useEffect(() => {
    let active = true;
    getCategories()
      .then((cats) => {
        if (!active || !cats.length) return;
        setSearchHints(cats.map((c) => `Search for ${c.name.toLowerCase()}`));
      })
      .catch(() => {
        /* keep the fallback hints */
      });
    return () => {
      active = false;
    };
  }, []);

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
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
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
                src="/brand/logo.jpeg"
                alt={`${siteConfig.name} logo`}
                width={160}
                height={106}
                priority
                className="h-11 w-auto"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="ml-4 hidden items-center gap-1 lg:flex">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "nav-link",
                    isActive(item.href) && "nav-link-active",
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
                rotatingPlaceholders={searchHints}
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
                rotatingPlaceholders={searchHints}
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
                  "rounded-xl px-4 py-3 text-base font-medium transition-colors border-l-4",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-forest-500 to-forest-700 text-cream-50 border-gold-400 shadow-sm"
                    : "text-forest-700 border-transparent hover:bg-cream-200 hover:border-gold-300",
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
