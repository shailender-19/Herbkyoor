import { request } from "./client";

/**
 * Public form handlers (PHP) — see API_REQUIREMENTS.md §G. These always POST to
 * the API; both throw `ApiError` on failure so the forms can show an error
 * state. (In the Next.js app these were client-only stubs; the frontend is now
 * wired to the real PHP endpoints.)
 */

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function submitContact(payload: ContactPayload): Promise<void> {
  return request("/contact/send.php", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(() => undefined);
}

export function subscribeNewsletter(email: string): Promise<void> {
  return request("/newsletter/subscribe.php", {
    method: "POST",
    body: JSON.stringify({ email }),
  }).then(() => undefined);
}
