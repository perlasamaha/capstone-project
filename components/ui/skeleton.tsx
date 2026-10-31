import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-surface-2", className)} />;
}

/** Placeholder for a list of post or community cards while a page loads. */
export function CardListSkeleton({ count = 4, grid = false }: { count?: number; grid?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={grid ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-line bg-surface p-5">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
