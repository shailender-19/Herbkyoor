import type { Category, CategorySlug } from "@/types";

export const categories: Category[] = [
  {
    slug: "herbal-medicines",
    name: "Herbal Medicines",
    description: "Classical formulations & churnas for everyday ailments.",
    icon: "Leaf",
    image: "/categories/herbal-medicines.svg",
  },
  {
    slug: "ayurvedic-oils",
    name: "Ayurvedic Oils",
    description: "Cold-pressed & medicated oils for body and mind.",
    icon: "Droplet",
    image: "/categories/ayurvedic-oils.svg",
  },
  {
    slug: "skin-care",
    name: "Skin Care",
    description: "Herbal creams, ubtans and face care essentials.",
    icon: "Sparkles",
    image: "/categories/skin-care.svg",
  },
  {
    slug: "hair-care",
    name: "Hair Care",
    description: "Nourishing oils and herbal cleansers for strong hair.",
    icon: "Wind",
    image: "/categories/hair-care.svg",
  },
  {
    slug: "immunity-wellness",
    name: "Immunity & Wellness",
    description: "Rasayanas and tonics to build natural resilience.",
    icon: "ShieldPlus",
    image: "/categories/immunity-wellness.svg",
  },
  {
    slug: "digestive-health",
    name: "Digestive Health",
    description: "Support healthy digestion and gut balance.",
    icon: "Flame",
    image: "/categories/digestive-health.svg",
  },
  {
    slug: "personal-care",
    name: "Personal Care",
    description: "Herbal daily care — oral, bath and body.",
    icon: "HeartHandshake",
    image: "/categories/personal-care.svg",
  },
  {
    slug: "herbal-supplements",
    name: "Herbal Supplements",
    description: "Single-herb capsules and standardized extracts.",
    icon: "Pill",
    image: "/categories/herbal-supplements.svg",
  },
];

const bySlug = new Map<CategorySlug, Category>(
  categories.map((c) => [c.slug, c]),
);

export function getCategory(slug: CategorySlug): Category | undefined {
  return bySlug.get(slug);
}

export function categoryName(slug: CategorySlug): string {
  return bySlug.get(slug)?.name ?? slug;
}
