import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Skeleton className="h-8 w-32" />
        
        {/* Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" /> {/* Theme toggle */}
        <Skeleton className="h-10 w-10 rounded-full" /> {/* Language */}
        <Skeleton className="h-10 w-24" /> {/* Button */}
        <Skeleton className="h-10 w-24" /> {/* Button */}
      </div>
    </div>
  );
}
