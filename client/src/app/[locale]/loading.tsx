import AppHeaderSkeleton from "@/components/skeletons/AppHeader";
import { FooterSkeleton } from "@/components/skeletons/FooterSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Next.js có một file đặc biệt là loading.tsx. Khi Khoa gọi notFound(), Next.js đôi khi cần một "trạm dừng" trước khi hiện trang lỗi.
 */

export default function Loading() {
  return (
    <div className="md:px-26 min-h-screen flex flex-col">
      {/* Header Skeleton */}
      <AppHeaderSkeleton />

      {/* Main Content Skeleton */}
      <main className="flex-grow flex flex-col py-8 gap-8 container mx-auto px-4">
        {/* Banner Section Skeleton */}
        <div className="w-full h-[300px] rounded-xl overflow-hidden relative">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Search/Filter Bar Skeleton */}
        <div className="w-full h-16 rounded-lg">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="flex flex-col space-y-3 p-4 border rounded-xl">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <div className="md:-mx-30">
        <FooterSkeleton />
      </div>
    </div>
  );
}
