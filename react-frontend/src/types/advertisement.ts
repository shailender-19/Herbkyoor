export type AdvertisementStatus = "active" | "scheduled" | "expired" | "disabled";

export type AdvertisementType = "banner" | "gif" | "slider";

export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  /** Small eyebrow label, e.g. "Limited Offer". */
  eyebrow?: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  type: AdvertisementType;
  status: AdvertisementStatus;
  startDate: string;
  endDate: string;
  /** Optional accent used for gradients/overlays in the slider. */
  accent?: string;
}
