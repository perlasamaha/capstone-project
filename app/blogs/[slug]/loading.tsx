import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-3xl space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-4/5" />
      <div className="flex items-center gap-3 pb-6">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
