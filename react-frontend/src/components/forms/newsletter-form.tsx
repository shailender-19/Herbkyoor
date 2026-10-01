import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { subscribeNewsletter } from "@/api/forms";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter signup. Validates client-side, then POSTs to the PHP endpoint
 * `POST /api/newsletter/subscribe.php` (see API_REQUIREMENTS.md §G2). Shows a
 * loading state and surfaces API/network errors.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await subscribeNewsletter(email.trim());
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not subscribe. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-full bg-forest-100 px-5 py-3 text-sm font-medium text-forest-700",
          className,
        )}
        role="status"
      >
        <Check size={18} /> Thank you! You&apos;re subscribed.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("w-full", className)} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-invalid={error ? true : undefined}
            className="h-12 w-full rounded-full border border-cream-300 bg-cream-50 px-5 text-base sm:text-sm text-forest-900 placeholder:text-forest-700/40 focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/30"
          />
        </div>
        <Button type="submit" size="lg" variant="gold" disabled={busy}>
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}{" "}
          Subscribe
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
