import { cn } from "@/lib/utils";

/** Centered page container with responsive gutters and a sensible max width. */
export function Container({
  className,
  as: Tag = "div",
  children,
}: {
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-7xl container-px", className)}>
      {children}
    </Tag>
  );
}
