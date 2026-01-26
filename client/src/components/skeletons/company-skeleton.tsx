import { Skeleton } from "@/components/ui/skeleton";

export const CompanySkeleton = () => (
  <div className="container mx-auto py-8 max-w-4xl space-y-6">
    <Skeleton className="h-12 w-1/3" />
    <Skeleton className="h-48 w-full rounded-xl" />
    <div className="grid grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);
