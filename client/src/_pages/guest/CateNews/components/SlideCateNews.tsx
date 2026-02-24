import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { generateSlugUrl } from "@/lib/utils";
import { CategoryNewsResType } from "@/schemasvalidation/NewsCategory";

export default function SlideCateNews({
  cateNews,
}: {
  cateNews: CategoryNewsResType[];
}) {
  return (
    <div className="mt-5 md:mt-10">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {cateNews?.map((cateNews) => {
            return (
              <CarouselItem
                key={cateNews._id}
                // basis theo mobile và desktop
                className="basis-1/2 sm:basis-1/3 md:basis-1/5 px-2"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/cate-news/${generateSlugUrl({
                        name: cateNews.slug.vi,
                        id: cateNews._id,
                      })}`}
                      className="truncate line-clamp-1 text-center px-1 py-0.5 border border-gray-700 rounded-lg cursor-pointer hover:bg-primary block"
                    >
                      {cateNews.name.vi}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{cateNews.name.vi}</p>
                  </TooltipContent>
                </Tooltip>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="hidden md:flex">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}
