import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function DetailJobSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[500px] lg:col-span-2 rounded-lg" />
        <Skeleton className="h-[500px] rounded-lg" />
      </div>
    </div>
  );
}
