import Image from "next/image";
import Link from "next/link";
import {
  Droplet,
  Flame,
  HeartHandshake,
  Leaf,
  Pill,
  ShieldPlus,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types";

/** Map the string icon name stored in data to a concrete Lucide component. */
const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Droplet,
  Sparkles,
  Wind,
  ShieldPlus,
  Flame,
  HeartHandshake,
  Pill,
};

export function CategoryCard({ category }: { category: Category }) {
  const Icon = iconMap[category.icon] ?? Leaf;
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/90 text-forest-700 shadow-sm backdrop-blur">
          <Icon size={20} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-forest-900 transition-colors group-hover:text-forest-600">
          {category.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-forest-700/60">
          {category.description}
        </p>
        <span className="mt-3 text-sm font-medium text-forest-600">
          Shop now →
        </span>
      </div>
    </Link>
  );
}
