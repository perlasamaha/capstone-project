import { Skeleton, CardListSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-80" />
      <Skeleton className="mb-6 h-9 w-full" />
      <CardListSkeleton count={6} grid />
    </>
  );
}
