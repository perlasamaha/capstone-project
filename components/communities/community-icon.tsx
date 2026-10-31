import { cn } from "@/lib/utils";

// Static class names so Tailwind can find them at build time.
const palette = [
  "bg-sky-500/15 text-sky-300",
  "bg-violet-500/15 text-violet-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
  "bg-cyan-500/15 text-cyan-300",
  "bg-indigo-500/15 text-indigo-300",
  "bg-orange-500/15 text-orange-300",
];

function colorFor(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

function initialsFor(name: string) {
  const capitals = name.replace(/[^A-Z]/g, "");
  if (capitals.length >= 2) return capitals.slice(0, 2);
  return name.replace(/[^a-zA-Z]/g, "").slice(0, 2);
}

export function CommunityIcon({
  name,
  slug,
  size = "md",
}: {
  name: string;
  slug: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-lg font-semibold",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-14 text-lg",
        colorFor(slug),
      )}
    >
      {initialsFor(name)}
    </span>
  );
}
