/**
 * Doctors data facade — the "Consult a Doctor" roster shown in the header
 * support modal. Sources from the bundled seed (static mode / offline, or as a
 * fallback if the API is unreachable) or the PHP API (API mode), mirroring the
 * categories facade in `data/categories.ts`.
 */

import { USE_STATIC_DATA } from "@/api/client";
import { fetchDoctors } from "@/api/doctors";

export interface Doctor {
  id: string;
  name: string;
  /** Post-nominal qualifications, e.g. "BAMS, MD (Ayurveda)". */
  qualifications: string;
  /** Primary area of expertise, shown as a chip under the name. */
  specialization: string;
  /** Years of clinical practice. */
  experience: number;
  /** Languages the doctor can consult in. */
  languages: string[];
  /** Short professional bio (1–2 sentences). */
  bio: string;
  /** Human-readable consulting availability. */
  availability: string;
  /** Avatar image path (served from /public or /uploads). */
  avatar: string;
}

/** Bundled fallback roster — kept in sync with database/seed.sql. */
export const doctorsSeed: Doctor[] = [
  {
    id: "1",
    name: "Dr. Aakash Jainer",
    qualifications: "BAMS, MD (Ayurveda)",
    specialization: "General Ayurveda & Panchakarma",
    experience: 14,
    languages: ["English", "Hindi"],
    bio: "Lead physician guiding treatment plans across chronic lifestyle disorders with a focus on classical Panchakarma therapies.",
    availability: "Mon–Sat, 10:00 AM – 6:00 PM",
    avatar: "/avatars/avatar-1.svg",
  },
  {
    id: "2",
    name: "Dr. Meera Iyer",
    qualifications: "BAMS, MS (Ayurveda)",
    specialization: "Women's Health & Fertility",
    experience: 11,
    languages: ["English", "Hindi", "Tamil"],
    bio: "Specialises in hormonal balance, prenatal care and women's wellness using time-tested herbal and dietary protocols.",
    availability: "Mon–Fri, 11:00 AM – 5:00 PM",
    avatar: "/avatars/avatar-5.svg",
  },
  {
    id: "3",
    name: "Dr. Rohan Deshpande",
    qualifications: "BAMS, Dip. in Rasashastra",
    specialization: "Digestive & Metabolic Care",
    experience: 9,
    languages: ["English", "Hindi", "Marathi"],
    bio: "Helps patients restore gut health and metabolic balance through personalised diet, herbs and daily-routine (dinacharya) guidance.",
    availability: "Tue–Sun, 9:30 AM – 4:30 PM",
    avatar: "/avatars/avatar-4.svg",
  },
  {
    id: "4",
    name: "Dr. Ananya Sharma",
    qualifications: "BAMS, PG Dip. (Skin & Hair)",
    specialization: "Dermatology & Hair Care",
    experience: 8,
    languages: ["English", "Hindi"],
    bio: "Focuses on skin, hair and allergic conditions with Ayurvedic formulations tailored to each patient's prakriti.",
    availability: "Mon–Sat, 12:00 PM – 7:00 PM",
    avatar: "/avatars/avatar-3.svg",
  },
];

/**
 * Resolve the roster for the storefront. In API mode, falls back to the bundled
 * seed if the request fails so the modal is never empty.
 */
export async function getDoctors(): Promise<Doctor[]> {
  if (USE_STATIC_DATA) return doctorsSeed;
  try {
    const live = await fetchDoctors();
    return live.length ? live : doctorsSeed;
  } catch {
    return doctorsSeed;
  }
}
