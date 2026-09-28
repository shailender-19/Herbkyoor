/*
 * Newsletter signup — port of forms/newsletter-form.tsx, wired to the PHP API.
 * Validates client-side, POSTs to /api/newsletter/subscribe.php, shows success
 * or error. (Endpoint is documented in API_REQUIREMENTS.md; build it in the
 * backend phase.)
 */
(function () {
  "use strict";
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function successMarkup() {
    return (
      '<div class="flex items-center justify-center gap-2 rounded-full bg-forest-100 px-5 py-3 text-sm font-medium text-forest-700" role="status">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' +
      " Thank you! You're subscribed.</div>"
    );
  }

  function init() {
    document.querySelectorAll("form[data-newsletter]").forEach((form) => {
      const errEl = form.querySelector("[data-newsletter-error]");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = (input && input.value.trim()) || "";
        if (!EMAIL_RE.test(email)) {
          if (errEl) {
            errEl.textContent = "Please enter a valid email address.";
            errEl.hidden = false;
          }
          if (input) input.setAttribute("aria-invalid", "true");
          return;
        }
        if (errEl) errEl.hidden = true;

        const { ok, data } = await window.Api.post(
          "/newsletter/subscribe.php",
          { email }
        );
        if (ok) {
          form.outerHTML = successMarkup();
        } else if (errEl) {
          errEl.textContent =
            (data && data.error) ||
            "Something went wrong. Please try again or message us on WhatsApp.";
          errEl.hidden = false;
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
