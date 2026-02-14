import React from 'react'
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

export default function ListCvSkeleton() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col text-center mb-12 space-y-4">
        <Skeleton className="h-10 w-3/4 md:w-1/2 mx-auto" />
        <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card
            key={index}
            className="flex flex-col pb-2 overflow-hidden h-full border-border"
          >
            <div className="aspect-[3/3] w-full bg-muted overflow-hidden relative">
              <Skeleton className="w-full h-full" />
            </div>

            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>

            <CardContent className="flex-grow space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>

            <CardFooter className="pt-0">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
