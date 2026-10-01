import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { RootLayout } from "@/components/layout/root-layout";
import { Spinner } from "@/components/ui/states";

/*
 * Route-level code splitting (React.lazy) — each page is its own chunk, so the
 * initial bundle stays lean and pages load on demand.
 */
const HomePage = lazy(() => import("@/pages/home-page"));
const ProductsPage = lazy(() => import("@/pages/products-page"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail-page"));
const AboutPage = lazy(() => import("@/pages/about-page"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy-page"));
const TermsPage = lazy(() => import("@/pages/terms-page"));
const AdminPage = lazy(() => import("@/pages/admin-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));

/** Scroll to the top on every navigation (SPA doesn't reload the document). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
