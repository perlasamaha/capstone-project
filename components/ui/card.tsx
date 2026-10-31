import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("rounded-xl border border-line bg-surface", className)} {...props} />
  );
}

export function SectionHeading({
  title,
  href,
  linkLabel = "View all",
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm text-link hover:underline">
          {linkLabel} →
        </Link>
      ) : (
        children
      )}
    </div>
  );
}
