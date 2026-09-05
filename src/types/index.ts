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
