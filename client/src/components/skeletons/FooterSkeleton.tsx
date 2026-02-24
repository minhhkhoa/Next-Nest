import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function FooterSkeleton() {
  return (
    <footer className="bg-primary/5 dark:bg-primary-dark/5 mt-auto">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 space-y-2">
              <Skeleton className="h-8 w-24" /> {/* Brand Name */}
              <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
              <Skeleton className="h-4 w-3/4" /> {/* Description line 2 */}
            </div>

            {/* Social icons */}
            <div className="flex gap-4 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>

          {/* Links sections */}
          {[1, 2, 3, 4].map((section) => (
            <div key={section}>
              <Skeleton className="h-5 w-32 mb-4" /> {/* Section Title */}
              <div className="space-y-3">
                {[1, 2, 3, 4].map((link) => (
                  <Skeleton key={link} className="h-4 w-24" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <Separator className="my-12 border-t border-primary-foreground/10" />

        {/* Bottom section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Contact info */}
          <div className="flex flex-4 flex-col gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          {/* Map skeleton */}
          <div className="flex-4 h-[200px] w-full max-w-md">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        </div>

        <Separator className="mt-12" />

        {/* Copyright */}
        <div className="flex justify-center py-5">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </footer>
  );
}
