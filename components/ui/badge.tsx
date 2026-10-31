import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-line bg-surface-2 text-muted",
  accent: "border-accent/30 bg-accent/10 text-link",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A topic hashtag that links to the blog list filtered by that topic. */
export function TopicLink({ topic, community }: { topic: string; community?: string }) {
  const params = new URLSearchParams({ topic });
  if (community) params.set("community", community);

  return (
    <Link
      href={`/blogs?${params}`}
      className="inline-flex items-center rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-link"
    >
      #{topic}
    </Link>
  );
}
