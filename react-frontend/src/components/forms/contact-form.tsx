import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { submitContact } from "@/api/forms";

interface ContactState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY: ContactState = { name: "", email: "", phone: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+91[-\s]?)?[6-9]\d{9}$/;

/**
 * Contact form. Validates client-side (mirroring the server rules), then POSTs
 * to the PHP endpoint `POST /api/contact/send.php` (see API_REQUIREMENTS.md §G).
 * Handles loading and submit-error states so the form never silently fails.
 */
export function ContactForm() {
  const [form, setForm] = useState<ContactState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactState, string>>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: keyof ContactState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<keyof ContactState, string>> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) errs.email = "Enter a valid email.";
    if (form.phone && !PHONE_RE.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid phone number.";
    if (form.message.trim().length < 10)
      errs.message = "Please write a little more (min 10 characters).";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    setSubmitError(null);
    try {
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Could not send your message. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-forest-200 bg-forest-50 p-8 text-center">
        <CheckCircle2 size={40} className="text-forest-600" />
        <h3 className="mt-4 text-lg font-bold text-forest-800">
          Message sent!
        </h3>
        <p className="mt-1 text-sm text-forest-700/70">
          Thank you for reaching out. Our team will get back to you within one
          business day.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => setSent(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          required
          value={form.name}
          onChange={set("name")}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
          autoComplete="tel"
          hint="Optional"
        />
      </div>
      <Input
        label="Email"
        required
        type="email"
        value={form.email}
        onChange={set("email")}
        error={errors.email}
        autoComplete="email"
      />
      <Textarea
        label="Message"
        required
        rows={5}
        value={form.message}
        onChange={set("message")}
        error={errors.message}
        placeholder="How can we help you?"
      />
      {submitError && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {submitError}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={busy}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}{" "}
        Send Message
      </Button>
    </form>
  );
}
