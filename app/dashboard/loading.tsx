import { CardListSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="mb-2 h-7 w-64" />
      <Skeleton className="mb-8 h-4 w-80" />
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-xl" />
        ))}
      </div>
      <CardListSkeleton count={3} />
    </>
  );
}
