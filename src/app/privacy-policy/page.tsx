import type { Metadata } from "next";
import { LegalLayout } from "@/components/common/legal-layout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="1 August 2026"
      intro={`At ${siteConfig.name}, your privacy matters to us. This policy explains what information we collect, how we use it, and the choices you have. By using our website you agree to the practices described below.`}
      sections={[
        {
          heading: "Information We Collect",
          body: [
            "We collect information you provide directly — such as your name, email, phone number and delivery address when you place an order or contact us.",
            "We also collect limited technical data (such as device and usage information) to keep the site secure and improve your experience.",
          ],
        },
        {
          heading: "How We Use Your Information",
          body: [
            "We use your information to process and deliver orders, respond to enquiries, provide customer support and, with your consent, send wellness updates and offers.",
            "We never sell your personal information to third parties.",
          ],
        },
        {
          heading: "Payment Information",
          body: [
            "Payments are processed by trusted third-party payment providers. We do not store your full card details on our servers. Sensitive payment data is handled securely by the payment gateway.",
          ],
        },
        {
          heading: "Cookies & Local Storage",
          body: [
            "We use local storage to remember your cart between visits. You can clear this at any time from your browser settings.",
          ],
        },
        {
          heading: "Data Security",
          body: [
            "We apply reasonable technical and organisational measures to protect your information. However, no method of transmission over the internet is completely secure.",
          ],
        },
        {
          heading: "Your Rights",
          body: [
            `You may request access to, correction of, or deletion of your personal data by contacting us at ${siteConfig.contact.email}.`,
          ],
        },
        {
          heading: "Contact Us",
          body: [
            `For any privacy-related questions, reach us at ${siteConfig.contact.email} or ${siteConfig.contact.phone}.`,
          ],
        },
      ]}
    />
  );
}
