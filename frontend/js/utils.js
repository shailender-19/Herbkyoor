/*
 * Shared vanilla-JS helpers — ports of src/lib/format.ts, whatsapp.ts and the
 * pagination pageList() helper. No dependencies.
 */
(function (global) {
  "use strict";

  const cfg = () => global.APP_CONFIG || {};

  /** Format a number as Indian Rupees, e.g. 499 -> "₹499". */
  function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: cfg().CURRENCY || "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  /** Plain Indian-grouped number. */
  function formatNumber(value) {
    return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
  }

  /** Percentage discount between an original and current price. */
  function discountPercent(original, price) {
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
  }

  /** Build a wa.me deep link for a pre-filled message. */
  function buildWhatsAppUrl(message) {
    const number = cfg().WHATSAPP_NUMBER || "";
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  /** Generic enquiry link. */
  function whatsAppEnquiryUrl(context) {
    const ctx = context || "I have a question about your Ayurvedic products.";
    return buildWhatsAppUrl(`Hello ${cfg().SITE_NAME || ""} 👋\n\n${ctx}`);
  }

  /** Order a single product with a chosen quantity. */
  function productOrderUrl(product, quantity) {
    const qty = quantity || 1;
    const message = [
      `Hello ${cfg().SITE_NAME || ""} 👋`,
      "",
      "I would like to order:",
      "",
      `*Product:* ${product.name}`,
      `*Quantity:* ${qty}`,
      `*Price:* ${formatPrice(product.price)}`,
      "",
      "Please share the availability and delivery details.",
    ].join("\n");
    return buildWhatsAppUrl(message);
  }

  /**
   * Compact pagination page list with ellipses (port of pageList in
   * src/components/ui/pagination.tsx). Returns numbers and "…" strings.
   */
  function pageList(page, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(total - 1, page + 1);
    if (start > 2) pages.push("…");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("…");
    pages.push(total);
    return pages;
  }

  /** Escape a string for safe insertion as HTML text. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  global.Utils = {
    formatPrice,
    formatNumber,
    discountPercent,
    buildWhatsAppUrl,
    whatsAppEnquiryUrl,
    productOrderUrl,
    pageList,
    escapeHtml,
  };
})(window);
