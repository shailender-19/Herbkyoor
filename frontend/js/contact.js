/*
 * Contact form — port of forms/contact-form.tsx, wired to the PHP API.
 * Client-side validation mirrors the original (name ≥2, valid email, optional
 * Indian phone, message ≥10), then POSTs to /api/contact/send.php.
 * (Endpoint documented in API_REQUIREMENTS.md; build it in the backend phase.)
 */
(function () {
  "use strict";
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^(\+91[-\s]?)?[6-9]\d{9}$/;

  function successMarkup() {
    return (
      '<div class="flex flex-col items-center rounded-2xl border border-forest-200 bg-forest-50 p-8 text-center">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-forest-600" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>' +
      '<h3 class="mt-4 text-lg font-bold text-forest-800">Message sent!</h3>' +
      '<p class="mt-1 text-sm text-forest-700/70">Thank you for reaching out. Our team will get back to you within one business day.</p>' +
      '<button type="button" data-contact-reset class="mt-5 inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 border border-forest-300 text-forest-700 hover:bg-forest-50 bg-transparent h-11 px-6 text-sm">Send another message</button>' +
      "</div>"
    );
  }

  function showError(form, field, msg) {
    const el = form.querySelector('[data-error-for="' + field + '"]');
    if (el) {
      el.textContent = msg;
      el.hidden = false;
    }
    const input = form.querySelector('[name="' + field + '"]');
    if (input) input.setAttribute("aria-invalid", "true");
  }

  function clearErrors(form) {
    form.querySelectorAll("[data-error-for]").forEach((el) => (el.hidden = true));
    form.querySelectorAll("[name]").forEach((el) => el.removeAttribute("aria-invalid"));
  }

  function bind(wrap) {
    const form = wrap.querySelector("form[data-contact]");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(form);
      const data = {
        name: (form.name.value || "").trim(),
        email: (form.email.value || "").trim(),
        phone: (form.phone.value || "").trim(),
        message: (form.message.value || "").trim(),
      };

      let ok = true;
      if (data.name.length < 2) { showError(form, "name", "Please enter your name."); ok = false; }
      if (!EMAIL_RE.test(data.email)) { showError(form, "email", "Enter a valid email."); ok = false; }
      if (data.phone && !PHONE_RE.test(data.phone.replace(/\s/g, ""))) { showError(form, "phone", "Enter a valid phone number."); ok = false; }
      if (data.message.length < 10) { showError(form, "message", "Please write a little more (min 10 characters)."); ok = false; }
      if (!ok) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const res = await window.Api.post("/contact/send.php", data);

      if (submitBtn) submitBtn.disabled = false;
      if (res.ok) {
        wrap.innerHTML = successMarkup();
        const resetBtn = wrap.querySelector("[data-contact-reset]");
        if (resetBtn) resetBtn.addEventListener("click", () => location.reload());
      } else {
        // Prefer per-field errors from the server, else a general message.
        const fields = res.data && res.data.fields;
        if (fields && typeof fields === "object") {
          Object.keys(fields).forEach((k) => showError(form, k, fields[k]));
        } else {
          showError(form, "message", (res.data && res.data.error) || "Something went wrong. Please try again or message us on WhatsApp.");
        }
      }
    });
  }

  function init() {
    document.querySelectorAll("[data-contact-wrap]").forEach(bind);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
