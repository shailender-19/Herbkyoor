import { LegalLayout } from "@/components/common/legal-layout";
import { siteConfig } from "@/config/site";
import { useSeo } from "@/lib/use-seo";

export default function TermsPage() {
  useSeo({
    title: "Terms & Conditions",
    description: `The terms that govern your use of the ${siteConfig.name} website and services.`,
    canonical: "/terms",
  });
  return (
    <LegalLayout
      title="Terms & Conditions"
      updated="1 August 2026"
      intro={`Welcome to ${siteConfig.name}. By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully.`}
      sections={[
        {
          heading: "Use of the Website",
          body: [
            "You agree to use this website for lawful purposes only and not to misuse it in any way that could damage or impair its availability.",
          ],
        },
        {
          heading: "Products & Descriptions",
          body: [
            "We aim to describe our products as accurately as possible. Ayurvedic products are traditional wellness products and are not intended to diagnose, treat, cure or prevent any disease.",
            "Please consult a qualified healthcare practitioner before starting any new product, especially if you are pregnant, nursing or have a medical condition.",
          ],
        },
        {
          heading: "Pricing & Availability",
          body: [
            "All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. Prices and availability may change without notice.",
          ],
        },
        {
          heading: "Orders & Payment",
          body: [
            "Orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order. For real transactions, order totals and payments are verified securely on the server.",
          ],
        },
        {
          heading: "Shipping & Delivery",
          body: [
            "We strive to dispatch orders promptly. Delivery timelines are estimates and may vary based on location and courier partners.",
          ],
        },
        {
          heading: "Returns & Refunds",
          body: [
            "If you receive a damaged or incorrect item, please contact us within 7 days. Refunds and replacements are handled on a case-by-case basis in line with our support policy.",
          ],
        },
        {
          heading: "Limitation of Liability",
          body: [
            "To the fullest extent permitted by law, we are not liable for any indirect or consequential loss arising from the use of our products or website.",
          ],
        },
        {
          heading: "Contact",
          body: [
            `Questions about these terms? Contact us at ${siteConfig.contact.email}.`,
          ],
        },
      ]}
    />
  );
}
