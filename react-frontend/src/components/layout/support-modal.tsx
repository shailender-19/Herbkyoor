import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  GraduationCap,
  Languages,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Image } from "@/components/ui/image";
import { getDoctors, doctorsSeed, type Doctor } from "@/data/doctors";
import { siteConfig, telHref } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

/** WhatsApp deep link pre-filled to request a consult with a specific doctor. */
function consultWhatsAppUrl(doctor: Doctor): string {
  return buildWhatsAppUrl(
    [
      `Hello ${siteConfig.name} 👋`,
      "",
      `I would like to book a consultation with *${doctor.name}* (${doctor.specialization}).`,
      "",
      "Please share the available slots.",
    ].join("\n"),
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <li className="rounded-2xl border border-cream-300 bg-white/70 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-center gap-4">
        {/* Avatar — fixed square, cropped and centered for any aspect ratio. */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-forest-100 ring-2 ring-gold-300/60 sm:h-20 sm:w-20">
          <Image
            src={doctor.avatar}
            alt={doctor.name}
            fill
            sizes="80px"
            className="h-full w-full object-cover object-center"
            fallbackSrc="/avatars/avatar-1.svg"
          />
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 text-base font-bold text-forest-900">
                <span className="truncate">{doctor.name}</span>
                <BadgeCheck
                  size={16}
                  className="shrink-0 text-forest-500"
                  aria-label="Verified practitioner"
                />
              </h3>
              {doctor.qualifications && (
                <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-forest-600">
                  <GraduationCap size={13} className="shrink-0" />
                  <span className="truncate">{doctor.qualifications}</span>
                </p>
              )}
            </div>
            {doctor.experience > 0 && (
              <span className="shrink-0 rounded-full bg-forest-50 px-2.5 py-1 text-[11px] font-semibold text-forest-700">
                {doctor.experience}+ yrs
              </span>
            )}
          </div>

          {doctor.specialization && (
            <span className="mt-2 inline-block rounded-full bg-gold-300/40 px-2.5 py-0.5 text-[11px] font-semibold text-gold-700">
              {doctor.specialization}
            </span>
          )}

          {doctor.bio && (
            <p className="mt-2 text-sm leading-relaxed text-forest-700">
              {doctor.bio}
            </p>
          )}

          <dl className="mt-3 space-y-1 text-xs text-forest-600">
            {doctor.availability && (
              <div className="flex items-center gap-1.5">
                <CalendarClock size={13} className="shrink-0 text-forest-400" />
                <dt className="sr-only">Availability</dt>
                <dd>{doctor.availability}</dd>
              </div>
            )}
            {doctor.languages.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Languages size={13} className="shrink-0 text-forest-400" />
                <dt className="sr-only">Languages</dt>
                <dd>{doctor.languages.join(", ")}</dd>
              </div>
            )}
          </dl>

          {/* Consult actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={consultWhatsAppUrl(doctor)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-forest-600 px-3.5 py-1.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-forest-700"
            >
              <MessageCircle size={14} />
              Consult on WhatsApp
            </a>
            <a
              href={telHref(siteConfig.contact.phone)}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest-300 px-3.5 py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:bg-cream-200"
            >
              <Phone size={14} />
              Call
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Support modal listing doctors with profile details and consult CTAs. */
export function SupportModal({ open, onClose }: SupportModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(doctorsSeed);

  // Refresh from the API whenever the modal opens (keeps the roster live).
  useEffect(() => {
    if (!open) return;
    let active = true;
    getDoctors()
      .then((list) => {
        if (active && list.length) setDoctors(list);
      })
      .catch(() => {
        /* keep the current (seed) list */
      });
    return () => {
      active = false;
    };
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Consult Our Ayurvedic Doctors"
      className="max-w-2xl"
    >
      <p className="mb-4 text-sm text-forest-600">
        Talk to our certified practitioners for personalised guidance on
        products, dosage and treatment plans.
      </p>
      <ul className="space-y-3">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </ul>
    </Modal>
  );
}
