import { CardListSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-xl border border-line bg-surface p-6">
        <Skeleton className="size-[88px] rounded-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
      <CardListSkeleton count={3} />
    </div>
  );
}
