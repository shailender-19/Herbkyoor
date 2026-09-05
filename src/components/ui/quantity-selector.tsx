"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const btn =
    size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const label = size === "sm" ? "w-9 text-sm" : "w-11 text-base";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-cream-300 bg-cream-50",
        className,
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-cream-200 disabled:opacity-40",
          btn,
        )}
      >
        <Minus size={16} />
      </button>
      <span
        className={cn("text-center font-semibold text-forest-800", label)}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-cream-200 disabled:opacity-40",
          btn,
        )}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
