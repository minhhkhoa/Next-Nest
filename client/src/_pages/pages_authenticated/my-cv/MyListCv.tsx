"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useGetUserResumes } from "@/queries/useUserResume";
import { listTemplateMetadata } from "../cv-templates/ListTemplate";
import ListCvSkeleton from "@/components/skeletons/list-cv-skeleton";
import { generateSlugUrl } from "@/lib/utils";

export default function PageMyListCv() {
  const { data: listMyCvFetch, isLoading } = useGetUserResumes();

  //- vì response trả về không có field image và title nên ta sẽ thêm vào và dùng listTemplateMetadata để map theo listMyCvFetch.templateID === listTemplateMetadata.id để lấy image và title tương ứng
  const listMyCv = listMyCvFetch?.data?.map((template) => {
    const templateMetadata = listTemplateMetadata.find(
      (item) => item.id === template.templateID,
    );
    if (!templateMetadata) return template;
    return {
      ...template,
      image: template.image || templateMetadata.image,
      title: template.title || templateMetadata.title,
      description: template.description || templateMetadata.description,
    };
  });

  if (isLoading) {
    return <ListCvSkeleton />;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Danh sách mẫu CV của tôi
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Dưới đây là danh sách các mẫu CV mà bạn đã tạo. Bạn có thể xem, chỉnh
          sửa hoặc tạo mới các mẫu CV của mình để phù hợp với nhu cầu ứng tuyển
          của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listMyCv?.length === 0 ? (
          <p className="text-center text-muted-foreground col-span-full">
            Bạn chưa tạo CV nào. Hãy tạo CV đầu tiên của bạn ngay bây giờ!
          </p>
        ) : (
          listMyCv?.map((template, index) => (
            <Card
              key={index}
              className="flex flex-col pb-2 overflow-hidden h-full group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50"
            >
              <div className="relative aspect-[3/3] w-full bg-muted overflow-hidden">
                <Image
                  src={template.image!}
                  alt={template.title!}
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button variant="default" className="rounded-full" asChild>
                    <Link
                      href={`/my-cv/${generateSlugUrl({ name: template.templateID, id: template._id })}?edit=true`}
                    >
                      Xem chi tiết
                    </Link>
                  </Button>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                  {template.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <CardDescription className="line-clamp-3 text-sm">
                  {template.description}
                </CardDescription>
              </CardContent>

              <CardFooter className="pt-0">
                <Button className="w-full group/btn" variant="outline" asChild>
                  <Link
                    href={`/my-cv/${generateSlugUrl({ name: template.templateID, id: template._id })}?edit=true`}
                  >
                    Chỉnh sửa
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
