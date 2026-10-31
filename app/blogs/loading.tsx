import { CardListSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="mb-2 h-7 w-32" />
      <Skeleton className="mb-6 h-4 w-72" />
      <Skeleton className="mb-6 h-[68px] w-full rounded-xl" />
      <CardListSkeleton count={5} />
    </>
  );
}
