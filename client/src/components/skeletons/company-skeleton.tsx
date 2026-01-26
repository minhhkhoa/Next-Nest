import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "../ui/card";

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

export function MemberTableSkeleton() {
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardContent className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
