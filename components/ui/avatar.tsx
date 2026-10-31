import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = { xs: 20, sm: 28, md: 36, lg: 48, xl: 88 };

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Avatar({
  name,
  image,
  size = "md",
  className,
}: {
  name: string;
  image?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const px = sizes[size];

  // The name is always shown next to the avatar, so the image itself is
  // decorative for screen readers.
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={px}
        height={px}
        className={cn("shrink-0 rounded-full bg-surface-2 object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ width: px, height: px, fontSize: Math.max(10, px * 0.38) }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-surface-2 font-medium text-muted",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
