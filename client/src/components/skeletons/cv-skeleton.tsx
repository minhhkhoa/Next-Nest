import { Skeleton } from "@/components/ui/skeleton";

export default function CVSkeleton() {
  return (
    <div className="w-full max-w-[210mm] mx-auto min-h-screen pt-3 pb-20">
      <div className="border border-border shadow-xl rounded-lg bg-card overflow-hidden">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row rounded-t-lg bg-muted sm:px-2 w-full pb-5 sm:pb-0 h-[200px] relative">
          <div className="absolute top-10 left-5">
             <Skeleton className="h-40 w-40 rounded-full border-4 border-card" />
          </div>
          <div className="sm:ml-48 mt-10 p-5 space-y-3 w-full">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <div className="flex gap-4 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 mt-10">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-8">
            {/* Skills */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Summary */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-1/2" />
                  <div className="space-y-2 pl-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                   <Skeleton className="h-6 w-1/3" />
                   <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
