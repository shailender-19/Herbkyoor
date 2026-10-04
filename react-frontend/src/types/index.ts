export type {
  Product,
  Category,
  CategorySlug,
} from "./product";
export type {
  Advertisement,
  AdvertisementStatus,
  AdvertisementType,
} from "./advertisement";

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
}

/** A user-submitted contact-form message, as returned by the admin API. */
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}
