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
  /**
   * When true, the image is a fully designed banner (logo, headline and CTA
   * already baked in). The slider renders it as-is, without the gradient or
   * overlaid text/CTA.
   */
  selfContained?: boolean;
  /**
   * Natural aspect ratio of the image (width / height). Used by the slider to
   * size the frame to the active banner so the whole image is shown without
   * cropping or letterboxing.
   */
  aspectRatio?: number;
}
