import { CardListSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="mb-2 h-7 w-40" />
      <Skeleton className="mb-6 h-4 w-56" />
      <CardListSkeleton count={4} />
    </>
  );
}
